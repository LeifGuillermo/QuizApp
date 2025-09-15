import csv
import json
import os
from flask import jsonify

from modules.global_vars import DATA_DIR

def load_questions(filepath):
    """Loads questions from a CSV file."""
    questions = []
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return []
        
    with open(filepath, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            row['answers'] = [ans.strip() for ans in row['answers'].split('|')] if row.get('answers') else []
            row['correct_answers'] = [ans.strip() for ans in row['correct_answers'].split('|')] if row.get('correct_answers') else []
            row['categories'] = [cat.strip() for cat in row['categories'].split('|')] if row.get('categories') else []
            questions.append(row)
    return questions

def load_results(filepath):
    """Loads all past test results from a JSON file."""
    # Check if the file exists and is not empty
    if not os.path.exists(filepath) or os.stat(filepath).st_size == 0:
        return []
    with open(filepath, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            # Handle the case where the file is malformed (e.g., corrupted)
            return []

def save_results(results, filepath):
    """Saves test results to a JSON file."""
    with open(filepath, 'w') as f:
        json.dump(results, f, indent=4)

def get_all_categories(filepath):
    """Helper to get all unique categories from the questions file."""
    questions = load_questions(filepath)
    categories = set()
    for q in questions:
        for cat in q['categories']:
            categories.add(cat)
    return sorted(list(categories))

def list_quizzes():
    """Lists all available quiz files in the data directory."""
    quiz_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
    return jsonify(quiz_files)