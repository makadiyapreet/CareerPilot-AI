"""
Answer Evaluator Module
Evaluates interview answers using TF-IDF similarity and keyword analysis.
"""
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def evaluate_answer(question: str, user_answer: str, ideal_answer: str = None) -> dict:
    """
    Evaluate a user's answer to an interview question.

    Args:
        question: The interview question
        user_answer: User's response
        ideal_answer: Optional ideal answer for comparison

    Returns:
        Dictionary containing:
        - relevance_score: Score out of 10
        - length_feedback: Feedback on answer length
        - confidence_score: Simulated confidence score
        - feedback_text: Detailed feedback message
    """
    if ideal_answer:
        relevance_score = calculate_similarity_score(user_answer, ideal_answer)
    else:
        relevance_score = calculate_keyword_score(question, user_answer)

    length_feedback = assess_length(user_answer)

    confidence_score = round(random.uniform(6.0, 9.0), 1)

    feedback_text = generate_feedback(relevance_score, length_feedback)

    return {
        "relevance_score": round(relevance_score, 1),
        "length_feedback": length_feedback,
        "confidence_score": confidence_score,
        "feedback_text": feedback_text,
        "word_count": len(user_answer.split())
    }


def calculate_similarity_score(user_answer: str, ideal_answer: str) -> float:
    """
    Calculate TF-IDF similarity between user answer and ideal answer.

    Args:
        user_answer: User's response
        ideal_answer: Ideal response

    Returns:
        Score from 0 to 10
    """
    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([user_answer, ideal_answer])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return similarity * 10
    except Exception:
        return 5.0


def calculate_keyword_score(question: str, user_answer: str) -> float:
    """
    Calculate score based on keyword presence from question.

    Args:
        question: The interview question
        user_answer: User's response

    Returns:
        Score from 0 to 10
    """
    stop_words = {'is', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
                  'to', 'for', 'of', 'with', 'by', 'what', 'how', 'why', 'when',
                  'where', 'which', 'who', 'you', 'your', 'me', 'do', 'does',
                  'did', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
                  'has', 'had', 'will', 'would', 'could', 'should', 'can'}

    question_words = set(question.lower().split())
    keywords = question_words - stop_words

    answer_lower = user_answer.lower()
    matched = sum(1 for keyword in keywords if keyword in answer_lower)

    score = min(10, matched * 1.5)

    word_count = len(user_answer.split())
    if word_count >= 50:
        score = min(10, score + 2)
    if word_count >= 100:
        score = min(10, score + 1)

    return score


def assess_length(answer: str) -> str:
    """
    Assess the length of an answer.

    Args:
        answer: User's response

    Returns:
        Length feedback string
    """
    word_count = len(answer.split())

    if word_count < 20:
        return "Too brief, please elaborate more on your answer"
    elif word_count > 200:
        return "Too verbose, try to be more concise"
    elif word_count < 50:
        return "Could be more detailed, consider adding examples"
    else:
        return "Good length for an interview response"


def generate_feedback(relevance_score: float, length_feedback: str) -> str:
    """
    Generate detailed feedback based on scores.

    Args:
        relevance_score: Relevance score out of 10
        length_feedback: Length assessment

    Returns:
        Feedback text
    """
    if relevance_score >= 8:
        quality = "Excellent answer! Very relevant and well-structured."
        suggestion = "You demonstrated strong understanding of the topic."
    elif relevance_score >= 6:
        quality = "Good answer with relevant information."
        suggestion = "Consider adding more specific examples or details to strengthen your response."
    elif relevance_score >= 4:
        quality = "Adequate answer, but could be improved."
        suggestion = "Try to directly address the key points of the question and use relevant terminology."
    else:
        quality = "This answer needs improvement."
        suggestion = "Review the topic and practice structuring your responses with clear, relevant points."

    length_note = ""
    if "brief" in length_feedback.lower():
        length_note = " Also, try to provide more comprehensive responses."
    elif "verbose" in length_feedback.lower():
        length_note = " Also, focus on being more concise while keeping key points."

    return f"{quality} {suggestion}{length_note}"


def get_sample_ideal_answers() -> dict:
    """
    Get sample ideal answers for common questions.
    These can be used to evaluate user responses.

    Returns:
        Dictionary mapping questions to ideal answers
    """
    return {
        "Tell me about yourself.": """I am a passionate professional with experience in
        software development and a strong background in computer science. I have worked
        on various projects involving web development and data analysis. I am particularly
        interested in solving complex problems and learning new technologies. In my previous
        role, I contributed to improving system efficiency by 30% through code optimization.""",

        "What is the difference between SQL and NoSQL databases?": """SQL databases are
        relational databases that use structured query language and have a predefined schema.
        They are ideal for complex queries and transactions. NoSQL databases are non-relational,
        offer flexible schemas, and are designed for scalability and handling large volumes of
        unstructured data. SQL databases include MySQL and PostgreSQL, while NoSQL examples
        are MongoDB and Cassandra.""",

        "Explain the concept of machine learning.": """Machine learning is a subset of
        artificial intelligence that enables systems to learn and improve from experience
        without being explicitly programmed. It involves training algorithms on data to
        identify patterns and make predictions. Types include supervised learning,
        unsupervised learning, and reinforcement learning. Applications range from
        recommendation systems to autonomous vehicles."""
    }
