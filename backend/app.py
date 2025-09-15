from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

from modules.data_handler import load_questions, load_results, save_results, list_quizzes, get_all_categories
from modules.quiz_logic import get_filtered_questions, grade_test, sanitize_questions
from modules.stats_logic import aggregate_stats
from modules.global_vars import DATA_DIR, QUESTIONS_FILE, RESULTS_FILE

# Helper function to ensure data directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Helper function to create an empty results.json if it doesn't exist
if not os.path.exists(RESULTS_FILE):
    with open(RESULTS_FILE, 'w') as f:
        f.write('[]')

@app.route('/quizzes', methods=['GET'])
def get_quizzes():
    return list_quizzes()

@app.route('/categories', methods=['GET'])
def get_categories():
    quiz_file = request.args.get('quiz_file')
    if not quiz_file or not quiz_file.endswith('.csv'):
        return jsonify({'error': 'Invalid quiz file specified'}), 400
    # Now, call the helper function with the specific file
    categories = get_all_categories(os.path.join(DATA_DIR, quiz_file))
    return jsonify(['All'] + categories)

@app.route('/questions', methods=['GET'])
def get_questions():
    quiz_file = request.args.get('quiz_file')
    """Retrieves a list of questions filtered by category."""
    all_questions = load_questions(os.path.join(DATA_DIR, quiz_file))
    selected_categories = [cat.strip() for cat in request.args.get('categories', 'All').split(',')]
    filtered_questions = get_filtered_questions(all_questions, selected_categories)
    random.shuffle(filtered_questions)
    # Do not send correct answers to the frontend
    sanitized_questions = sanitize_questions(filtered_questions)
    return jsonify(sanitized_questions)

@app.route('/submit_test', methods=['POST'])
def submit_test():
    """Grades the submitted test and saves the results."""
    data = request.json
    user_answers = data.get('user_answers', {})

    quiz_file = data.get('quiz_file')  # Get the quiz file from the request body
    if not quiz_file:
        return jsonify({'error': 'Quiz file not specified in request body'}), 400
    

    submitted_question_texts = list(user_answers.keys())
    
    all_questions = load_questions(os.path.join(DATA_DIR, quiz_file))
    
    score = 0
    detailed_results = []
    
    for q_text in submitted_question_texts:
        # Find the full question object from the original data
        q = next((item for item in all_questions if item['question'] == q_text), None)
        if not q:
            continue
        
        correct_answers = q['correct_answers']
        user_ans = user_answers.get(q_text)
        
        is_correct = False
        if q['type'] == 'te':
            # Text entry: check if any keyword matches
            user_ans_str = str(user_ans).lower().strip()
            is_correct = any(keyword.lower() in user_ans_str for keyword in correct_answers)
        elif q['type'] == 'ma':
            # Multiple answer: check if the sets of answers are equal
            if isinstance(user_ans, list):
                user_set = set([ans.strip() for ans in user_ans])
            else:
                user_set = set()
            correct_set = set(correct_answers)
            is_correct = user_set == correct_set
        else:
            # Multiple choice, binary: direct comparison
            user_ans_str = str(user_ans).strip()
            is_correct = user_ans_str == correct_answers[0]

        if is_correct:
            score += 1
        
        detailed_results.append({
            'question': q_text,
            'is_correct': is_correct,
            'user_answer': user_ans,
            'correct_answers': correct_answers,
        })
    
    percentage = (score / len(submitted_question_texts)) * 100 if submitted_question_texts else 0
    
    # Save test results
    all_results = load_results(filepath=QUESTIONS_FILE)
    test_result = {
        'timestamp': datetime.now().isoformat(),
        'score': score,
        'total_questions': len(submitted_question_texts),
        'percentage': percentage,
        'detailed_results': detailed_results
    }
    all_results.append(test_result)
    results_file_path = os.path.join(DATA_DIR, quiz_file[:-4] + '-results.json')
    save_results(all_results, results_file_path)
    return jsonify({
        'score': score,
        'total_questions': len(submitted_question_texts),
        'percentage': round(percentage, 2),
        'detailed_results': detailed_results
    })

@app.route('/statistics', methods=['GET'])
def get_statistics():

    """Calculates and returns quiz statistics based on past tests."""
    all_results = load_results()
    all_questions = load_questions()
    
    return aggregate_stats(all_results, all_questions)

if __name__ == '__main__':
    app.run(debug=True)