"""
Question Generator Module
Generates interview questions based on job role and difficulty.
"""
import os
import json
import random
import difflib

QUESTIONS_DB_PATH = os.path.join(os.path.dirname(__file__), 'questions_db.json')


def load_questions_db() -> dict:
    """Load questions database from JSON file."""
    try:
        with open(QUESTIONS_DB_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def generate_questions(job_role: str, difficulty: str = "Medium", count: int = 10) -> list:
    """
    Generate interview questions for a specific job role and difficulty.

    Args:
        job_role: Target job role (e.g., "Data Analyst", "Frontend Developer")
        difficulty: Difficulty level ("Easy", "Medium", "Hard")
        count: Number of questions to generate

    Returns:
        List of question dictionaries with text and category
    """
    questions_db = load_questions_db()

    matched_role = find_closest_role(job_role, questions_db)

    if matched_role is None:
        return [{
            "question": "Tell me about yourself.",
            "category": "hr"
        }]

    role_questions = questions_db[matched_role]

    filtered_questions = filter_by_difficulty(role_questions, difficulty)

    selected = select_questions(filtered_questions, count)

    return selected


def find_closest_role(job_role: str, questions_db: dict) -> str:
    """
    Find the closest matching role in the database.

    Args:
        job_role: Input job role
        questions_db: Questions database

    Returns:
        Matched role name or None
    """
    available_roles = list(questions_db.keys())

    if job_role in available_roles:
        return job_role

    job_role_lower = job_role.lower()
    for role in available_roles:
        if role.lower() == job_role_lower:
            return role

    matches = difflib.get_close_matches(
        job_role,
        available_roles,
        n=1,
        cutoff=0.4
    )

    if matches:
        return matches[0]

    job_words = set(job_role.lower().split())
    for role in available_roles:
        role_words = set(role.lower().split())
        if job_words & role_words:
            return role

    return available_roles[0] if available_roles else None


def filter_by_difficulty(role_questions: dict, difficulty: str) -> list:
    """
    Filter questions based on difficulty level.

    Args:
        role_questions: Questions for the role (technical, hr, aptitude)
        difficulty: Difficulty level

    Returns:
        List of filtered questions with categories
    """
    all_questions = []
    difficulty = difficulty.lower()

    technical = role_questions.get("technical", [])
    hr = role_questions.get("hr", [])
    aptitude = role_questions.get("aptitude", [])

    if difficulty == "easy":
        for q in hr:
            all_questions.append({"question": q, "category": "HR"})
        for q in technical[:5]:
            all_questions.append({"question": q, "category": "Technical"})

    elif difficulty == "medium":
        for q in technical:
            all_questions.append({"question": q, "category": "Technical"})
        for q in hr:
            all_questions.append({"question": q, "category": "HR"})

    elif difficulty == "hard":
        for q in technical:
            all_questions.append({"question": q, "category": "Technical"})
        for q in hr:
            all_questions.append({"question": q, "category": "HR"})
        for q in aptitude:
            all_questions.append({"question": q, "category": "Aptitude"})
    else:
        for q in technical:
            all_questions.append({"question": q, "category": "Technical"})
        for q in hr:
            all_questions.append({"question": q, "category": "HR"})

    return all_questions


def select_questions(questions: list, count: int) -> list:
    """
    Randomly select a specified number of questions.

    Args:
        questions: List of available questions
        count: Number of questions to select

    Returns:
        Selected questions list
    """
    if len(questions) <= count:
        return questions

    return random.sample(questions, count)


def get_available_roles() -> list:
    """Get list of available job roles in the database."""
    questions_db = load_questions_db()
    return list(questions_db.keys())


def get_questions_by_category(job_role: str, category: str) -> list:
    """
    Get all questions for a specific role and category.

    Args:
        job_role: Target job role
        category: Question category (technical, hr, aptitude)

    Returns:
        List of questions
    """
    questions_db = load_questions_db()
    matched_role = find_closest_role(job_role, questions_db)

    if matched_role is None:
        return []

    role_questions = questions_db[matched_role]
    category_lower = category.lower()

    if category_lower in role_questions:
        return [{"question": q, "category": category.capitalize()}
                for q in role_questions[category_lower]]

    return []
