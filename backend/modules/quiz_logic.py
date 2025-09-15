import random

def get_filtered_questions(all_questions, selected_categories):
    """Filters questions by category and handles the 'All' option."""
    if 'All' in selected_categories:
        return all_questions
    else:
        return [
            q for q in all_questions
            if any(cat in q['categories'] for cat in selected_categories)
        ]

def sanitize_questions(questions):
    """Removes correct answers from questions for security."""
    return [
        {k: v for k, v in q.items() if k != 'correct_answers'}
        for q in questions
    ]

def grade_test(submitted_questions, user_answers, all_questions):
    """
    Grades the user's answers.

    Args:
        submitted_questions (list): List of question IDs the user answered.
        user_answers (dict): Mapping of question ID to user's answer.
        all_questions (list): List of all question dicts, each with 'id' and 'correct_answer' keys.

    Returns:
        dict: {
            'score': int,
            'total': int,
            'details': list of dicts with question_id, correct_answer, user_answer, is_correct
        }
    """
    # Build a lookup for correct answers
    answer_key = {q['id']: q['correct_answer'] for q in all_questions}
    details = []
    score = 0

    for qid in submitted_questions:
        # qid is the unique identifier for each submitted question
        correct = answer_key.get(qid)
        user = user_answers.get(qid)
        is_correct = user == correct
        if is_correct:
            score += 1
        details.append({
            'question_id': qid,
            'correct_answer': correct,
            'user_answer': user,
            'is_correct': is_correct
        })

    return {
        'score': score,
        'total': len(submitted_questions),
        'details': details
    }
