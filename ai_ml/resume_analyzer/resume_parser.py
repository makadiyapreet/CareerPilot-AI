"""
Resume Parser Module
Parses resume PDFs and extracts structured information.
"""
import sys
import os
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.pdf_extractor import extract_text_from_pdf
from job_analyzer.skill_extractor import extract_skills, extract_soft_skills

SECTION_KEYWORDS = {
    "education": ["education", "degree", "university", "college", "bachelor",
                  "master", "phd", "diploma", "academic", "school", "graduated"],
    "experience": ["experience", "work history", "employment", "worked",
                   "internship", "position", "job", "career", "professional"],
    "projects": ["project", "projects", "built", "developed", "created",
                 "implemented", "designed", "portfolio"],
    "skills": ["skills", "technologies", "tools", "technical skills",
               "competencies", "expertise", "proficient"],
    "certifications": ["certification", "certified", "certificate", "license",
                       "accreditation"],
    "summary": ["summary", "objective", "profile", "about me", "introduction"]
}


def parse_resume(pdf_path: str) -> dict:
    """
    Parse a resume PDF and extract structured information.

    Args:
        pdf_path: Path to the resume PDF file

    Returns:
        Dictionary containing:
        - name: Extracted name
        - email: Extracted email
        - phone: Extracted phone number
        - skills: List of technical skills
        - soft_skills: List of soft skills
        - sections_detected: List of detected sections
        - raw_text: Full text content
        - word_count: Total word count
    """
    raw_text = extract_text_from_pdf(pdf_path)

    name = extract_name(raw_text)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    skills = extract_skills(raw_text)
    soft_skills = extract_soft_skills(raw_text)
    sections = detect_sections(raw_text)
    word_count = len(raw_text.split())

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "soft_skills": soft_skills,
        "sections_detected": sections,
        "raw_text": raw_text,
        "word_count": word_count
    }


def parse_resume_text(text: str) -> dict:
    """
    Parse resume from text (when PDF is already extracted).

    Args:
        text: Resume text content

    Returns:
        Dictionary with parsed resume data
    """
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    soft_skills = extract_soft_skills(text)
    sections = detect_sections(text)
    word_count = len(text.split())

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "soft_skills": soft_skills,
        "sections_detected": sections,
        "raw_text": text,
        "word_count": word_count
    }


def extract_name(text: str) -> str:
    """
    Extract name from resume (usually first line).

    Args:
        text: Resume text

    Returns:
        Extracted name or "Not found"
    """
    lines = text.strip().split('\n')
    for line in lines[:3]:
        line = line.strip()
        if line and len(line) > 2 and len(line) < 50:
            if not re.search(r'[@\d]', line):
                words = line.split()
                if 1 <= len(words) <= 4:
                    return line
    return "Not found"


def extract_email(text: str) -> str:
    """
    Extract email address from text.

    Args:
        text: Resume text

    Returns:
        Email address or "Not found"
    """
    email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    match = re.search(email_pattern, text)
    return match.group(0) if match else "Not found"


def extract_phone(text: str) -> str:
    """
    Extract phone number from text.

    Args:
        text: Resume text

    Returns:
        Phone number or "Not found"
    """
    phone_patterns = [
        r'\+?[\d\s\-\(\)]{10,15}',
        r'\(\d{3}\)\s*\d{3}[-\s]?\d{4}',
        r'\d{3}[-\s]?\d{3}[-\s]?\d{4}',
        r'\+\d{1,3}[-\s]?\d{10}'
    ]

    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            phone = match.group(0).strip()
            digits = re.sub(r'\D', '', phone)
            if 10 <= len(digits) <= 15:
                return phone

    return "Not found"


def detect_sections(text: str) -> list:
    """
    Detect which sections are present in the resume.

    Args:
        text: Resume text

    Returns:
        List of detected section names
    """
    text_lower = text.lower()
    detected = []

    for section, keywords in SECTION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                if section not in detected:
                    detected.append(section)
                break

    return detected
