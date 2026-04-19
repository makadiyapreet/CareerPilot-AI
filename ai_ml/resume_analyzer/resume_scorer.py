"""
Enhanced Resume Scorer Module
Scores resumes against job descriptions with detailed analysis.
"""
import sys
import os
import re
from collections import Counter

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from utils.text_preprocessor import preprocess, text_to_string
from job_analyzer.skill_extractor import extract_skills, extract_soft_skills, extract_skills_with_categories


def calculate_resume_score(resume_text: str, job_description_text: str) -> dict:
    """
    Calculate comprehensive resume score against job description.

    Args:
        resume_text: Full text of the resume
        job_description_text: Full text of the job description

    Returns:
        Detailed scoring dictionary
    """
    resume_word_count = len(resume_text.split())

    # TF-IDF Similarity Score
    similarity_score = calculate_tfidf_similarity(resume_text, job_description_text)

    # Skills Analysis
    skills_analysis = analyze_skills_match(resume_text, job_description_text)

    # Keyword Analysis
    keyword_analysis = analyze_keywords(resume_text, job_description_text)

    # Section Analysis
    section_analysis = analyze_sections(resume_text)

    # Experience Analysis
    experience_analysis = analyze_experience(resume_text, job_description_text)

    # Calculate weighted final score
    final_score = calculate_weighted_score(
        similarity_score,
        skills_analysis,
        keyword_analysis,
        section_analysis,
        experience_analysis
    )

    # Generate improvement suggestions
    suggestions = generate_detailed_suggestions(
        resume_text,
        skills_analysis,
        section_analysis,
        keyword_analysis,
        experience_analysis
    )

    # Determine match level
    match_level = get_match_level(final_score)

    return {
        "resume_score": round(final_score, 2),
        "match_level": match_level,
        "job_match_percentage": round(similarity_score, 2),
        "skills_analysis": skills_analysis,
        "keyword_analysis": {
            "match_percentage": keyword_analysis["match_percentage"],
            "keywords_matched": keyword_analysis["keywords_matched"],
            "missing_keywords": keyword_analysis["missing_keywords"][:10]
        },
        "section_analysis": section_analysis,
        "experience_analysis": experience_analysis,
        "matched_skills": skills_analysis["technical_skills"]["matched"],
        "missing_skills": skills_analysis["technical_skills"]["missing"],
        "improvement_suggestions": [s["suggestion"] for s in suggestions[:8]],
        "detailed_suggestions": suggestions,
        "keyword_match_percentage": keyword_analysis["match_percentage"],
        "word_count": resume_word_count,
        "summary": generate_summary(final_score, skills_analysis, match_level)
    }


def calculate_tfidf_similarity(resume_text: str, job_text: str) -> float:
    """Calculate TF-IDF cosine similarity between resume and job."""
    try:
        resume_processed = text_to_string(preprocess(resume_text))
        job_processed = text_to_string(preprocess(job_text))

        if not resume_processed.strip() or not job_processed.strip():
            return 0.0

        vectorizer = TfidfVectorizer(max_features=1000)
        tfidf_matrix = vectorizer.fit_transform([resume_processed, job_processed])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        return similarity * 100
    except Exception:
        return 0.0


def analyze_skills_match(resume_text: str, job_text: str) -> dict:
    """Analyze technical and soft skills match."""
    resume_tech_skills = set(s.lower() for s in extract_skills(resume_text))
    job_tech_skills = set(s.lower() for s in extract_skills(job_text))

    matched_tech = list(resume_tech_skills & job_tech_skills)
    missing_tech = list(job_tech_skills - resume_tech_skills)
    extra_tech = list(resume_tech_skills - job_tech_skills)

    resume_soft_skills = set(s.lower() for s in extract_soft_skills(resume_text))
    job_soft_skills = set(s.lower() for s in extract_soft_skills(job_text))

    matched_soft = list(resume_soft_skills & job_soft_skills)
    missing_soft = list(job_soft_skills - resume_soft_skills)

    total_required = len(job_tech_skills) + len(job_soft_skills)
    total_matched = len(matched_tech) + len(matched_soft)
    match_percentage = (total_matched / total_required * 100) if total_required > 0 else 100

    resume_categories = extract_skills_with_categories(resume_text)
    job_categories = extract_skills_with_categories(job_text)

    return {
        "technical_skills": {
            "matched": matched_tech,
            "missing": missing_tech,
            "extra": extra_tech,
            "match_count": len(matched_tech),
            "required_count": len(job_tech_skills),
            "score": (len(matched_tech) / len(job_tech_skills) * 100) if job_tech_skills else 100
        },
        "soft_skills": {
            "matched": matched_soft,
            "missing": missing_soft,
            "match_count": len(matched_soft),
            "required_count": len(job_soft_skills),
            "score": (len(matched_soft) / len(job_soft_skills) * 100) if job_soft_skills else 100
        },
        "overall_match_percentage": round(match_percentage, 2),
        "resume_skill_categories": resume_categories,
        "job_skill_categories": job_categories
    }


def analyze_keywords(resume_text: str, job_text: str) -> dict:
    """Analyze keyword presence and density."""
    job_tokens = preprocess(job_text)
    resume_tokens = preprocess(resume_text)

    job_freq = Counter(job_tokens)
    resume_freq = Counter(resume_tokens)

    top_job_keywords = [word for word, _ in job_freq.most_common(30)]

    matched_keywords = []
    missing_keywords = []

    for keyword in top_job_keywords:
        if keyword in resume_freq:
            matched_keywords.append({
                "keyword": keyword,
                "job_count": job_freq[keyword],
                "resume_count": resume_freq[keyword]
            })
        else:
            missing_keywords.append(keyword)

    match_percentage = (len(matched_keywords) / len(top_job_keywords) * 100) if top_job_keywords else 100

    return {
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "match_percentage": round(match_percentage, 2),
        "total_keywords_checked": len(top_job_keywords),
        "keywords_matched": len(matched_keywords)
    }


def analyze_sections(resume_text: str) -> dict:
    """Analyze resume sections and their quality."""
    resume_lower = resume_text.lower()

    sections = {
        "contact_info": {"present": False, "score": 0, "details": []},
        "summary": {"present": False, "score": 0, "details": []},
        "experience": {"present": False, "score": 0, "details": []},
        "education": {"present": False, "score": 0, "details": []},
        "skills": {"present": False, "score": 0, "details": []},
        "projects": {"present": False, "score": 0, "details": []},
        "certifications": {"present": False, "score": 0, "details": []}
    }

    # Check Contact Info
    email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    phone_pattern = r'[\+]?[\d\s\-\(\)]{10,15}'

    if re.search(email_pattern, resume_text):
        sections["contact_info"]["present"] = True
        sections["contact_info"]["score"] += 40
        sections["contact_info"]["details"].append("Email found")

    if re.search(phone_pattern, resume_text):
        sections["contact_info"]["score"] += 30
        sections["contact_info"]["details"].append("Phone found")

    if "linkedin" in resume_lower:
        sections["contact_info"]["score"] += 15
        sections["contact_info"]["details"].append("LinkedIn found")

    if "github" in resume_lower:
        sections["contact_info"]["score"] += 15
        sections["contact_info"]["details"].append("GitHub found")

    # Check Summary/Objective
    summary_keywords = ["summary", "objective", "about me", "professional summary"]
    if any(kw in resume_lower for kw in summary_keywords):
        sections["summary"]["present"] = True
        sections["summary"]["score"] = 100

    # Check Experience
    exp_keywords = ["experience", "work history", "employment", "professional experience"]
    if any(kw in resume_lower for kw in exp_keywords):
        sections["experience"]["present"] = True
        sections["experience"]["score"] = 80
        action_verbs = ["developed", "managed", "led", "created", "implemented", "designed", "built", "achieved"]
        verbs_found = sum(1 for verb in action_verbs if verb in resume_lower)
        sections["experience"]["score"] += min(verbs_found * 2, 20)

    # Check Education
    edu_keywords = ["education", "degree", "university", "college", "bachelor", "master"]
    if any(kw in resume_lower for kw in edu_keywords):
        sections["education"]["present"] = True
        sections["education"]["score"] = 100

    # Check Skills
    skills_keywords = ["skills", "technical skills", "technologies", "tools"]
    if any(kw in resume_lower for kw in skills_keywords):
        sections["skills"]["present"] = True
        skills_count = len(extract_skills(resume_text))
        sections["skills"]["score"] = min(skills_count * 10, 100)

    # Check Projects
    project_keywords = ["project", "portfolio", "case study"]
    if any(kw in resume_lower for kw in project_keywords):
        sections["projects"]["present"] = True
        sections["projects"]["score"] = 100

    # Check Certifications
    cert_keywords = ["certification", "certified", "certificate"]
    if any(kw in resume_lower for kw in cert_keywords):
        sections["certifications"]["present"] = True
        sections["certifications"]["score"] = 100

    total_score = sum(s["score"] for s in sections.values())
    max_score = 700
    overall_score = (total_score / max_score) * 100

    return {
        "sections": sections,
        "overall_score": round(overall_score, 2),
        "sections_present": sum(1 for s in sections.values() if s["present"]),
        "total_sections": len(sections)
    }


def analyze_experience(resume_text: str, job_text: str) -> dict:
    """Analyze experience level and relevance."""
    resume_lower = resume_text.lower()
    job_lower = job_text.lower()

    year_patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s+)?experience',
        r'experience[:\s]+(\d+)\+?\s*years?',
    ]

    resume_years = 0
    for pattern in year_patterns:
        match = re.search(pattern, resume_lower)
        if match:
            resume_years = max(resume_years, int(match.group(1)))

    job_years = 0
    for pattern in year_patterns:
        match = re.search(pattern, job_lower)
        if match:
            job_years = max(job_years, int(match.group(1)))

    level_keywords = {
        "entry": ["entry level", "fresher", "graduate", "junior", "0-1 year"],
        "mid": ["mid level", "2-5 year", "3-5 year", "intermediate"],
        "senior": ["senior", "lead", "5+ year", "principal"],
    }

    detected_level = "not_specified"
    for level, keywords in level_keywords.items():
        if any(kw in job_lower for kw in keywords):
            detected_level = level
            break

    if job_years == 0:
        experience_match = 100
    elif resume_years >= job_years:
        experience_match = 100
    else:
        experience_match = (resume_years / job_years) * 100

    return {
        "resume_years": resume_years,
        "required_years": job_years,
        "experience_match": round(experience_match, 2),
        "detected_level": detected_level,
        "meets_requirement": resume_years >= job_years
    }


def calculate_weighted_score(similarity, skills, keywords, sections, experience):
    """Calculate final weighted score."""
    weights = {
        "similarity": 0.20,
        "skills": 0.35,
        "keywords": 0.15,
        "sections": 0.15,
        "experience": 0.15
    }

    score = (
        similarity * weights["similarity"] +
        skills["overall_match_percentage"] * weights["skills"] +
        keywords["match_percentage"] * weights["keywords"] +
        sections["overall_score"] * weights["sections"] +
        experience["experience_match"] * weights["experience"]
    )

    return min(100, max(0, score))


def generate_detailed_suggestions(resume_text, skills, sections, keywords, experience):
    """Generate detailed improvement suggestions."""
    suggestions = []
    resume_lower = resume_text.lower()
    word_count = len(resume_text.split())

    if word_count < 300:
        suggestions.append({
            "priority": "high",
            "category": "content",
            "suggestion": "Your resume is too brief. Add more details about your experience and achievements.",
            "impact": "+10-15 points"
        })

    missing_tech = skills["technical_skills"]["missing"]
    if missing_tech:
        top_missing = missing_tech[:5]
        suggestions.append({
            "priority": "high",
            "category": "skills",
            "suggestion": f"Add these missing skills if you have them: {', '.join(top_missing)}",
            "impact": "+15-20 points"
        })

    section_data = sections["sections"]

    if not section_data["summary"]["present"]:
        suggestions.append({
            "priority": "medium",
            "category": "structure",
            "suggestion": "Add a professional summary at the top of your resume.",
            "impact": "+5-8 points"
        })

    if not section_data["projects"]["present"]:
        suggestions.append({
            "priority": "high",
            "category": "structure",
            "suggestion": "Add a projects section to showcase your practical experience.",
            "impact": "+8-12 points"
        })

    if "github" not in resume_lower:
        suggestions.append({
            "priority": "medium",
            "category": "contact",
            "suggestion": "Add your GitHub profile to showcase your code.",
            "impact": "+3-5 points"
        })

    if keywords["match_percentage"] < 50:
        suggestions.append({
            "priority": "high",
            "category": "keywords",
            "suggestion": "Your resume lacks keywords from the job description. Tailor it more.",
            "impact": "+10-15 points"
        })

    numbers_pattern = r'\d+%|\$\d+|\d+\s*(?:users|clients|projects|team)'
    if not re.search(numbers_pattern, resume_text):
        suggestions.append({
            "priority": "high",
            "category": "content",
            "suggestion": "Add quantifiable achievements (e.g., 'increased sales by 20%').",
            "impact": "+10-15 points"
        })

    priority_order = {"high": 0, "medium": 1, "low": 2}
    suggestions.sort(key=lambda x: priority_order.get(x["priority"], 2))

    return suggestions


def get_match_level(score):
    """Get match level description based on score."""
    if score >= 85:
        return {"level": "Excellent Match", "color": "green"}
    elif score >= 70:
        return {"level": "Good Match", "color": "blue"}
    elif score >= 55:
        return {"level": "Fair Match", "color": "yellow"}
    elif score >= 40:
        return {"level": "Needs Improvement", "color": "orange"}
    else:
        return {"level": "Low Match", "color": "red"}


def generate_summary(score, skills, match_level):
    """Generate a human-readable summary."""
    tech_match = skills["technical_skills"]["match_count"]
    tech_total = skills["technical_skills"]["required_count"]

    summary = f"Your resume scores {score}/100 ({match_level['level']}). "
    summary += f"You match {tech_match} out of {tech_total} required technical skills. "

    if score >= 70:
        summary += "Your resume is well-aligned with this job."
    elif score >= 50:
        summary += "Consider adding more relevant skills and keywords."
    else:
        summary += "Significant improvements needed to match this job better."

    return summary
