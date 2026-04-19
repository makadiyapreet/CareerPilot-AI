"""
Job Analyzer Module
Main module for analyzing job descriptions.
"""
import sys
import os
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .skill_extractor import extract_skills, extract_soft_skills
from .domain_classifier import classify_domain
from utils.text_preprocessor import preprocess, extract_keywords

JOB_TITLES_LIST = [
    "Data Analyst", "Data Scientist", "Machine Learning Engineer",
    "ML Engineer", "AI Engineer", "Software Engineer", "Software Developer",
    "Frontend Developer", "Front End Developer", "Backend Developer",
    "Back End Developer", "Full Stack Developer", "Fullstack Developer",
    "DevOps Engineer", "Cloud Engineer", "Data Engineer", "QA Engineer",
    "Quality Assurance Engineer", "Test Engineer", "Mobile Developer",
    "Android Developer", "iOS Developer", "React Developer", "Python Developer",
    "Java Developer", "Product Manager", "Project Manager", "Scrum Master",
    "Technical Lead", "Tech Lead", "Engineering Manager", "CTO",
    "Solutions Architect", "System Administrator", "Database Administrator",
    "Security Engineer", "Cybersecurity Analyst", "Network Engineer",
    "Business Analyst", "BI Developer", "ETL Developer", "Research Scientist"
]

EXPERIENCE_PATTERNS = {
    "Entry Level": [
        r"0[-\s]?1\s*year", r"fresher", r"entry\s*level", r"graduate",
        r"junior", r"trainee", r"intern", r"no\s*experience"
    ],
    "Junior": [
        r"1[-\s]?2\s*year", r"2[-\s]?3\s*year", r"junior"
    ],
    "Mid Level": [
        r"3[-\s]?5\s*year", r"4[-\s]?6\s*year", r"mid[-\s]?level",
        r"intermediate"
    ],
    "Senior": [
        r"5[-\s]?7\s*year", r"6[-\s]?8\s*year", r"7\+\s*year",
        r"senior", r"lead", r"principal"
    ],
    "Expert": [
        r"8\+\s*year", r"10\+\s*year", r"expert", r"staff",
        r"architect", r"director"
    ]
}


def analyze_job(job_description_text: str) -> dict:
    """
    Analyze a job description and extract key information.

    Args:
        job_description_text: Full text of the job description

    Returns:
        Dictionary containing:
        - job_role: Detected job title
        - domain: Classified domain
        - experience_level: Required experience level
        - technical_skills: List of technical skills
        - soft_skills: List of soft skills
        - keywords: Top keywords from the description
        - job_summary: First 2 sentences
    """
    tokens = preprocess(job_description_text)

    technical_skills = extract_skills(job_description_text)
    soft_skills = extract_soft_skills(job_description_text)
    domain = classify_domain(technical_skills, job_description_text)
    experience_level = detect_experience_level(job_description_text)
    job_role = detect_job_role(job_description_text)
    keywords = extract_keywords(job_description_text, top_n=20)
    job_summary = get_job_summary(job_description_text)

    return {
        "job_role": job_role,
        "domain": domain,
        "experience_level": experience_level,
        "technical_skills": technical_skills,
        "soft_skills": soft_skills,
        "keywords": keywords,
        "job_summary": job_summary
    }


def detect_experience_level(text: str) -> str:
    """
    Detect the experience level from job description.

    Args:
        text: Job description text

    Returns:
        Experience level string
    """
    text_lower = text.lower()

    for level, patterns in EXPERIENCE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return level

    return "Not specified"


def detect_job_role(text: str) -> str:
    """
    Detect the job role/title from description.

    Args:
        text: Job description text

    Returns:
        Detected job title or "Not specified"
    """
    text_lower = text.lower()

    for title in JOB_TITLES_LIST:
        if title.lower() in text_lower:
            return title

    return "Not specified"


def get_job_summary(text: str, num_sentences: int = 2) -> str:
    """
    Get the first N sentences as a summary.

    Args:
        text: Full job description text
        num_sentences: Number of sentences to include

    Returns:
        Summary string
    """
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    summary_sentences = sentences[:num_sentences]

    return '. '.join(summary_sentences) + '.' if summary_sentences else ""
