from collections import defaultdict
from flask import jsonify

def build_question_lookup(all_questions):
    return {q['question']: q['categories'] for q in all_questions}

def update_stats(all_results, question_lookup):
    question_stats = defaultdict(lambda: {'correct': 0, 'incorrect': 0, 'categories': []})
    category_stats = defaultdict(lambda: {'correct': 0, 'incorrect': 0})

    for test in all_results:
        for item in test['detailed_results']:
            question = item['question']
            is_correct = item['is_correct']
            categories = question_lookup.get(question)
            if not categories:
                continue

            q_stat = question_stats[question]
            q_stat['categories'] = categories
            if is_correct:
                q_stat['correct'] += 1
            else:
                q_stat['incorrect'] += 1

            for category in categories:
                if is_correct:
                    category_stats[category]['correct'] += 1
                else:
                    category_stats[category]['incorrect'] += 1

    return question_stats, category_stats

def prepare_ranked_questions(question_stats, category_stats):
    ranked_questions = []
    for question, stats in question_stats.items():
        total = stats['correct'] + stats['incorrect']
        correct_pct = (stats['correct'] / total) * 100 if total else 0
        ranked_questions.append({
            'question': question,
            'correct_percentage': correct_pct,
            'categories': stats['categories'],
            'incorrect_count': stats['incorrect']
        })

    for q_item in ranked_questions:
        category_percentages = [
            category_stats[c]['correct'] / (category_stats[c]['correct'] + category_stats[c]['incorrect'])
            for c in q_item['categories'] if (category_stats[c]['correct'] + category_stats[c]['incorrect']) > 0
        ]
        q_item['category_rank_score'] = min(category_percentages) if category_percentages else 0

    ranked_questions.sort(key=lambda x: (-x['incorrect_count'], x['category_rank_score']))
    return ranked_questions

def prepare_category_performance(category_stats):
    category_performance = [
        {
            'category': c,
            'correct_percentage': (stats['correct'] / (stats['correct'] + stats['incorrect']) * 100)
            if (stats['correct'] + stats['incorrect']) > 0 else 0
        }
        for c, stats in category_stats.items()
    ]
    category_performance.sort(key=lambda x: x['correct_percentage'])
    return category_performance

def aggregate_stats(all_results, all_questions):
    question_lookup = build_question_lookup(all_questions)
    question_stats, category_stats = update_stats(all_results, question_lookup)
    ranked_questions = prepare_ranked_questions(question_stats, category_stats)
    category_performance = prepare_category_performance(category_stats)
    return jsonify({
        'ranked_questions': ranked_questions,
        'category_performance': category_performance
    })