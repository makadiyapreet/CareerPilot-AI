"""
ATS Checker Module
Checks resume compatibility with Applicant Tracking Systems.
Provides detailed analysis and optimization suggestions.
"""
import sys
import os
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from job_analyzer.skill_extractor import extract_skills

ATS_FRIENDLY_SECTIONS = [
    "contact information", "summary", "professional summary", "objective",
    "experience", "work experience", "professional experience",
    "work history", "employment history", "education",
    "skills", "technical skills", "core competencies",
    "certifications", "projects", "achievements"
]

ATS_UNFRIENDLY_ELEMENTS = [
    "tables", "columns", "graphics", "images", "charts",
    "text boxes", "headers", "footers", "watermarks"
]

# Common ATS keywords that should be present
POWER_VERBS = [
    "achieved", "accomplished", "administered", "analyzed", "built",
    "coordinated", "created", "delivered", "designed", "developed",
    "directed", "enhanced", "established", "executed", "implemented",
    "improved", "increased", "initiated", "launched", "led",
    "managed", "optimized", "organized", "planned", "produced",
    "reduced", "resolved", "streamlined", "supervised", "trained"
]

# Date format patterns
DATE_PATTERNS = [
    r'\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',
    r'\b\d{1,2}/\d{4}\b',
    r'\b\d{4}\s*[-–]\s*\d{4}\b',
    r'\b\d{4}\s*[-–]\s*present\b'
]


def check_ats_compatibility(resume_text: str, job_description: str = None) -> dict:
    """
    Check resume for ATS (Applicant Tracking System) compatibility.

    Args:
        resume_text: Full text of the resume
        job_description: Optional job description for keyword matching

    Returns:
        Dictionary containing:
        - ats_score: Overall ATS compatibility score (0-100)
        - issues: List of potential ATS issues with severity
        - suggestions: List of improvement suggestions
        - format_check: Dictionary of format-related checks
        - keyword_analysis: Detailed keyword analysis
        - optimization_tips: Specific optimization recommendations
    """
    issues = []
    suggestions = []
    format_check = {}

    # 1. Contact Information Check
    contact_result = check_contact_info(resume_text)
    format_check["contact_info"] = contact_result
    if contact_result["score"] < 60:
        issues.append({
            "issue": "Missing or incomplete contact information",
            "severity": "high",
            "details": contact_result["missing"]
        })
        suggestions.append({
            "category": "Contact",
            "suggestion": "Add missing contact details: " + ", ".join(contact_result["missing"]),
            "priority": "high"
        })

    # 2. Section Structure Check
    section_result = check_sections(resume_text)
    format_check["sections"] = section_result
    if section_result["missing"]:
        issues.append({
            "issue": f"Missing essential sections: {', '.join(section_result['missing'])}",
            "severity": "high" if len(section_result["missing"]) > 1 else "medium",
            "details": section_result["missing"]
        })
        suggestions.append({
            "category": "Structure",
            "suggestion": f"Add these sections: {', '.join(section_result['missing'])}",
            "priority": "high"
        })

    # 3. Keyword Analysis
    keyword_result = check_keyword_usage(resume_text, job_description)
    format_check["keywords"] = keyword_result
    if keyword_result["score"] < 50:
        issues.append({
            "issue": "Low keyword density - may not pass ATS keyword filters",
            "severity": "high",
            "details": f"Found {keyword_result['skill_count']} skills, density: {keyword_result['density']:.1f}%"
        })
        suggestions.append({
            "category": "Keywords",
            "suggestion": "Add more relevant technical keywords throughout your resume",
            "priority": "high"
        })

    # 4. Length Check
    length_result = check_length(resume_text)
    format_check["length"] = length_result
    if length_result["score"] < 60:
        issues.append({
            "issue": f"Resume length ({length_result['word_count']} words) is not optimal",
            "severity": "medium",
            "details": length_result["recommendation"]
        })
        suggestions.append({
            "category": "Length",
            "suggestion": length_result["recommendation"],
            "priority": "medium"
        })

    # 5. Formatting Check
    formatting_result = check_formatting(resume_text)
    format_check["formatting"] = formatting_result
    for issue in formatting_result.get("issues", []):
        issues.append({
            "issue": issue,
            "severity": "medium",
            "details": ""
        })

    # 6. Special Characters Check
    special_result = check_special_characters(resume_text)
    format_check["special_characters"] = special_result
    if special_result["found"]:
        issues.append({
            "issue": "Contains special characters that may confuse ATS",
            "severity": "medium",
            "details": f"Found: {', '.join(special_result['found'])}"
        })
        suggestions.append({
            "category": "Formatting",
            "suggestion": "Replace special characters (★, •, →) with simple dashes or asterisks",
            "priority": "medium"
        })

    # 7. Action Verbs Check
    verbs_result = check_action_verbs(resume_text)
    format_check["action_verbs"] = verbs_result
    if verbs_result["score"] < 50:
        issues.append({
            "issue": "Limited use of strong action verbs",
            "severity": "low",
            "details": f"Found {verbs_result['count']} power verbs"
        })
        suggestions.append({
            "category": "Content",
            "suggestion": f"Use more action verbs like: {', '.join(verbs_result['suggested'][:5])}",
            "priority": "low"
        })

    # 8. Date Format Check
    dates_result = check_date_formats(resume_text)
    format_check["dates"] = dates_result
    if not dates_result["consistent"]:
        issues.append({
            "issue": "Inconsistent date formats",
            "severity": "low",
            "details": "Use consistent date format throughout (e.g., 'Jan 2020' or '01/2020')"
        })

    # 9. Quantification Check
    metrics_result = check_quantification(resume_text)
    format_check["metrics"] = metrics_result
    if metrics_result["score"] < 50:
        suggestions.append({
            "category": "Impact",
            "suggestion": "Add more quantifiable achievements (numbers, percentages, dollar amounts)",
            "priority": "medium"
        })

    # 10. Job Description Keyword Match (if provided)
    if job_description:
        match_result = check_job_keyword_match(resume_text, job_description)
        format_check["job_match"] = match_result
        if match_result["match_percentage"] < 40:
            issues.append({
                "issue": "Low keyword match with job description",
                "severity": "high",
                "details": f"Only {match_result['match_percentage']:.1f}% keyword match"
            })
            suggestions.append({
                "category": "Keywords",
                "suggestion": f"Add these missing keywords: {', '.join(match_result['missing_keywords'][:10])}",
                "priority": "high"
            })

    # Calculate Overall ATS Score
    ats_score = calculate_ats_score(
        contact_result["score"],
        section_result["score"],
        keyword_result["score"],
        length_result["score"],
        formatting_result["score"],
        verbs_result["score"],
        metrics_result["score"],
        len([i for i in issues if i["severity"] == "high"])
    )

    # Generate optimization tips
    optimization_tips = generate_optimization_tips(format_check, issues)

    return {
        "ats_score": round(ats_score, 2),
        "score_breakdown": {
            "contact_info": contact_result["score"],
            "sections": section_result["score"],
            "keywords": keyword_result["score"],
            "length": length_result["score"],
            "formatting": formatting_result["score"],
            "action_verbs": verbs_result["score"],
            "metrics": metrics_result["score"]
        },
        "issues": issues,
        "suggestions": suggestions,
        "format_check": format_check,
        "optimization_tips": optimization_tips,
        "ats_friendly": ats_score >= 70,
        "rating": get_ats_rating(ats_score)
    }


def check_contact_info(text: str) -> dict:
    """Check for presence of contact information."""
    text_lower = text.lower()
    found = []
    missing = []

    # Email
    email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    if re.search(email_pattern, text):
        found.append("email")
    else:
        missing.append("email")

    # Phone
    phone_pattern = r'(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
    if re.search(phone_pattern, text):
        found.append("phone")
    else:
        missing.append("phone")

    # Name (check for a capitalized name at the start)
    name_pattern = r'^[A-Z][a-z]+\s+[A-Z][a-z]+'
    lines = text.strip().split('\n')
    if lines and re.match(name_pattern, lines[0].strip()):
        found.append("name")
    else:
        missing.append("name (at top)")

    # LinkedIn
    if "linkedin" in text_lower or "linkedin.com" in text_lower:
        found.append("linkedin")

    # GitHub
    if "github" in text_lower or "github.com" in text_lower:
        found.append("github")

    # Location
    location_patterns = [r'\b[A-Z][a-z]+,\s*[A-Z]{2}\b', r'\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b']
    if any(re.search(p, text) for p in location_patterns):
        found.append("location")

    # Calculate score
    essential = {"email", "phone", "name (at top)"}
    essential_found = len(essential & set(found))
    bonus = len(set(found) - essential)

    score = (essential_found / len(essential)) * 80 + min(bonus * 5, 20)

    return {
        "score": round(score, 2),
        "found": found,
        "missing": missing
    }


def check_sections(text: str) -> dict:
    """Check for presence of standard resume sections."""
    text_lower = text.lower()
    sections_found = []
    sections_missing = []

    essential_sections = {
        "experience": ["experience", "work experience", "professional experience", "employment", "work history"],
        "education": ["education", "academic background", "qualifications", "degree"],
        "skills": ["skills", "technical skills", "competencies", "expertise", "technologies"]
    }

    optional_sections = {
        "summary": ["summary", "professional summary", "profile", "objective", "about me"],
        "projects": ["projects", "personal projects", "portfolio"],
        "certifications": ["certifications", "certificates", "credentials", "licenses"]
    }

    # Check essential sections
    for section, keywords in essential_sections.items():
        if any(kw in text_lower for kw in keywords):
            sections_found.append(section)
        else:
            sections_missing.append(section)

    # Check optional sections (for bonus points)
    optional_found = []
    for section, keywords in optional_sections.items():
        if any(kw in text_lower for kw in keywords):
            optional_found.append(section)

    # Calculate score
    essential_score = (len(sections_found) / len(essential_sections)) * 80
    optional_score = min(len(optional_found) * 6.66, 20)  # Up to 20 points for optional

    return {
        "score": round(essential_score + optional_score, 2),
        "found": sections_found + optional_found,
        "missing": sections_missing,
        "optional_found": optional_found
    }


def check_keyword_usage(text: str, job_description: str = None) -> dict:
    """Check keyword density and usage."""
    skills = extract_skills(text)
    word_count = len(text.split())

    if word_count == 0:
        return {"score": 0, "skill_count": 0, "density": 0, "skills": []}

    skill_words = sum(len(skill.split()) for skill in skills)
    density = (skill_words / word_count) * 100

    # Score based on skill count and density
    skill_score = min(len(skills) * 2.5, 50)  # Up to 50 points for having skills

    if 5 <= density <= 15:
        density_score = 50
    elif 3 <= density < 5 or 15 < density <= 20:
        density_score = 35
    elif density < 3:
        density_score = density * 10
    else:
        density_score = max(0, 50 - (density - 20) * 2)

    return {
        "score": round(skill_score + density_score, 2),
        "skill_count": len(skills),
        "density": round(density, 2),
        "skills": skills[:20]  # Top 20 skills found
    }


def check_length(text: str) -> dict:
    """Check if resume length is appropriate."""
    word_count = len(text.split())
    char_count = len(text)

    if 400 <= word_count <= 800:
        score = 100
        recommendation = "Resume length is optimal"
    elif 300 <= word_count < 400:
        score = 75
        recommendation = "Consider adding more detail to reach 400+ words"
    elif 800 < word_count <= 1000:
        score = 80
        recommendation = "Resume is slightly long - consider trimming to under 800 words"
    elif 200 <= word_count < 300:
        score = 50
        recommendation = "Resume is too short - add more relevant content"
    elif 1000 < word_count <= 1500:
        score = 60
        recommendation = "Resume is long - consider using a 2-page format or trimming"
    elif word_count < 200:
        score = 25
        recommendation = "Resume is significantly too short - add experience and skill details"
    else:
        score = 40
        recommendation = "Resume exceeds typical length - focus on most relevant content"

    return {
        "score": score,
        "word_count": word_count,
        "char_count": char_count,
        "recommendation": recommendation,
        "estimated_pages": max(1, word_count // 500)
    }


def check_formatting(text: str) -> dict:
    """Check for formatting issues."""
    score = 100
    issues = []

    lines = text.split('\n')

    # Check for very long lines (possible table remnants)
    long_lines = sum(1 for line in lines if len(line) > 120)
    if long_lines > 5:
        score -= 15
        issues.append("Some lines are very long (possible table formatting issues)")

    # Check for repeated characters (possible decorative elements)
    if re.search(r'(.)\1{5,}', text):
        score -= 10
        issues.append("Contains repeated characters (possible decorative elements)")

    # Check for excessive blank lines
    if text.count('\n\n\n') > 2:
        score -= 10
        issues.append("Excessive blank lines - clean up whitespace")

    # Check for all-caps sections (might be okay for headers)
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if caps_ratio > 0.3:
        score -= 10
        issues.append("Heavy use of uppercase - ATS may have trouble parsing")

    # Check for bullet consistency
    bullet_chars = set(re.findall(r'^[\s]*([•\-\*►▪·])', text, re.MULTILINE))
    if len(bullet_chars) > 2:
        score -= 5
        issues.append("Inconsistent bullet point styles")

    return {
        "score": max(0, score),
        "issues": issues
    }


def check_special_characters(text: str) -> dict:
    """Check for problematic special characters."""
    problematic_chars = ['★', '●', '►', '■', '◆', '→', '✓', '✗', '⬛', '⬜', '☐', '☑', '∙', '◦', '▸', '▹']
    found = []

    for char in problematic_chars:
        if char in text:
            found.append(char)

    return {
        "has_issues": len(found) > 0,
        "found": found,
        "count": len(found)
    }


def check_action_verbs(text: str) -> dict:
    """Check for use of strong action verbs."""
    text_lower = text.lower()
    found_verbs = []

    for verb in POWER_VERBS:
        if verb in text_lower:
            found_verbs.append(verb)

    # Score based on verb count
    count = len(found_verbs)
    if count >= 10:
        score = 100
    elif count >= 7:
        score = 80
    elif count >= 5:
        score = 60
    elif count >= 3:
        score = 40
    else:
        score = count * 13

    # Suggest verbs not used
    suggested = [v for v in POWER_VERBS if v not in found_verbs][:10]

    return {
        "score": score,
        "count": count,
        "found": found_verbs,
        "suggested": suggested
    }


def check_date_formats(text: str) -> dict:
    """Check for consistent date formatting."""
    dates_found = []

    for pattern in DATE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        dates_found.extend(matches)

    # Check consistency
    formats_used = set()
    for date in dates_found:
        if re.match(r'^[A-Za-z]+\s+\d{4}$', date):
            formats_used.add("Month Year")
        elif re.match(r'^\d{1,2}/\d{4}$', date):
            formats_used.add("MM/YYYY")
        elif re.match(r'^\d{4}', date):
            formats_used.add("YYYY")

    return {
        "dates_found": len(dates_found),
        "formats_used": list(formats_used),
        "consistent": len(formats_used) <= 1
    }


def check_quantification(text: str) -> dict:
    """Check for quantifiable achievements."""
    # Look for numbers, percentages, dollar amounts
    number_pattern = r'\b\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s*(?:%|percent|million|billion|thousand))?\b'
    dollar_pattern = r'\$\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s*(?:K|M|B|million|billion))?\b'
    percentage_pattern = r'\d+(?:\.\d+)?%'

    numbers = len(re.findall(number_pattern, text))
    dollars = len(re.findall(dollar_pattern, text, re.IGNORECASE))
    percentages = len(re.findall(percentage_pattern, text))

    total = numbers + dollars * 2 + percentages * 2  # Weight dollars and percentages more

    if total >= 10:
        score = 100
    elif total >= 7:
        score = 80
    elif total >= 5:
        score = 60
    elif total >= 3:
        score = 40
    else:
        score = total * 13

    return {
        "score": score,
        "numbers_found": numbers,
        "dollar_amounts": dollars,
        "percentages": percentages,
        "total_metrics": total
    }


def check_job_keyword_match(resume_text: str, job_description: str) -> dict:
    """Check how well resume keywords match job description."""
    resume_skills = set(s.lower() for s in extract_skills(resume_text))
    job_skills = set(s.lower() for s in extract_skills(job_description))

    if not job_skills:
        return {"match_percentage": 100, "matched_keywords": [], "missing_keywords": []}

    matched = list(resume_skills & job_skills)
    missing = list(job_skills - resume_skills)

    match_percentage = (len(matched) / len(job_skills)) * 100

    return {
        "match_percentage": round(match_percentage, 2),
        "matched_keywords": matched,
        "missing_keywords": missing,
        "job_skill_count": len(job_skills),
        "resume_skill_count": len(resume_skills)
    }


def calculate_ats_score(contact: float, sections: float, keywords: float,
                        length: float, formatting: float, verbs: float,
                        metrics: float, high_issues: int) -> float:
    """Calculate overall ATS score with weighted components."""
    # Weighted average
    base_score = (
        contact * 0.15 +      # 15% - Contact info
        sections * 0.20 +     # 20% - Section structure
        keywords * 0.25 +     # 25% - Keywords (most important)
        length * 0.10 +       # 10% - Length
        formatting * 0.10 +   # 10% - Formatting
        verbs * 0.10 +        # 10% - Action verbs
        metrics * 0.10        # 10% - Quantification
    )

    # Penalty for high-severity issues
    penalty = min(high_issues * 8, 24)  # Max 24 point penalty
    final_score = max(0, base_score - penalty)

    return final_score


def get_ats_rating(score: float) -> str:
    """Get a human-readable rating for ATS score."""
    if score >= 85:
        return "Excellent - Highly ATS-optimized"
    elif score >= 70:
        return "Good - ATS-friendly with minor improvements possible"
    elif score >= 55:
        return "Fair - Some ATS compatibility issues to address"
    elif score >= 40:
        return "Needs Work - Significant ATS optimization needed"
    else:
        return "Poor - Major ATS compatibility issues"


def generate_optimization_tips(format_check: dict, issues: list) -> list:
    """Generate specific optimization tips based on analysis."""
    tips = []

    # Priority 1: Critical fixes
    high_issues = [i for i in issues if i.get("severity") == "high"]
    if high_issues:
        tips.append({
            "priority": 1,
            "category": "Critical",
            "tip": "Fix these issues first: " + "; ".join([i["issue"] for i in high_issues])
        })

    # Contact info tips
    contact = format_check.get("contact_info", {})
    if "email" in contact.get("missing", []):
        tips.append({
            "priority": 1,
            "category": "Contact",
            "tip": "Add a professional email address at the top of your resume"
        })

    # Keywords tips
    keywords = format_check.get("keywords", {})
    if keywords.get("skill_count", 0) < 10:
        tips.append({
            "priority": 2,
            "category": "Keywords",
            "tip": f"Add more technical skills. Currently found: {keywords.get('skill_count', 0)}. Aim for 15-25 relevant skills."
        })

    # Metrics tips
    metrics = format_check.get("metrics", {})
    if metrics.get("total_metrics", 0) < 5:
        tips.append({
            "priority": 2,
            "category": "Impact",
            "tip": "Add quantifiable achievements (e.g., 'Increased sales by 25%', 'Managed team of 8', 'Reduced costs by $10K')"
        })

    # Action verbs tips
    verbs = format_check.get("action_verbs", {})
    if verbs.get("score", 0) < 60:
        tips.append({
            "priority": 3,
            "category": "Language",
            "tip": f"Start bullet points with action verbs like: {', '.join(verbs.get('suggested', [])[:5])}"
        })

    # Format tips
    formatting = format_check.get("formatting", {})
    if formatting.get("issues"):
        tips.append({
            "priority": 3,
            "category": "Format",
            "tip": "Use a simple, single-column layout. Avoid tables, graphics, and fancy formatting."
        })

    # General best practices
    tips.append({
        "priority": 4,
        "category": "Best Practice",
        "tip": "Save your resume as a .docx or .pdf file. Use standard fonts like Arial, Calibri, or Times New Roman."
    })

    # Sort by priority
    tips.sort(key=lambda x: x["priority"])

    return tips
