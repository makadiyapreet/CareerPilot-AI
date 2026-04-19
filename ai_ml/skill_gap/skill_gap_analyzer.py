"""
Skill Gap Analyzer Module
Analyzes skill gaps between resumes and job descriptions with detailed recommendations.
"""
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from job_analyzer.skill_extractor import extract_skills

TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), 'skill_taxonomy.json')


def load_taxonomy() -> dict:
    """Load skill taxonomy from JSON file."""
    try:
        with open(TAXONOMY_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def analyze_skill_gap(resume_text: str, job_description_text: str, target_role: str = None) -> dict:
    """
    Analyze the skill gap between a resume and job description.

    Args:
        resume_text: Full text of the resume
        job_description_text: Full text of the job description
        target_role: Optional target role for additional context

    Returns:
        Dictionary containing:
        - matched_skills: Skills found in both resume and job
        - missing_skills: Skills in job but not in resume (with priority)
        - match_percentage: Percentage of skills matched
        - course_recommendations: Recommended courses for missing skills
        - learning_path: Suggested order for learning skills
        - estimated_time: Total time to fill skill gaps
    """
    taxonomy = load_taxonomy()

    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description_text)

    resume_skills_lower = set(s.lower() for s in resume_skills)
    job_skills_lower = set(s.lower() for s in job_skills)

    matched = list(resume_skills_lower & job_skills_lower)
    missing = list(job_skills_lower - resume_skills_lower)
    extra = list(resume_skills_lower - job_skills_lower)

    # Enrich missing skills with detailed info
    missing_with_details = []
    for skill in missing:
        skill_info = get_skill_details(skill, taxonomy)
        missing_with_details.append(skill_info)

    # Sort by importance and priority
    missing_with_details.sort(key=lambda x: (
        importance_order(x.get("importance", "medium")),
        priority_order(x.get("priority", "Medium"))
    ))

    # Enrich matched skills
    matched_with_details = []
    for skill in matched:
        skill_info = taxonomy.get(skill, {})
        matched_with_details.append({
            "skill": skill,
            "level": skill_info.get("level", "intermediate"),
            "category": skill_info.get("category", "general")
        })

    # Calculate match percentage
    if job_skills_lower:
        match_percentage = (len(matched) / len(job_skills_lower)) * 100
    else:
        match_percentage = 100 if not resume_skills_lower else 0

    # Generate learning path based on prerequisites
    learning_path = generate_learning_path(missing_with_details, taxonomy)

    # Calculate estimated learning time
    total_weeks = sum(parse_time_to_learn(s.get("time_to_learn", "2-3 weeks")) for s in missing_with_details[:10])

    # Get top recommendations
    recommendations = get_top_recommendations(missing_with_details[:7], taxonomy)

    # Identify skill gaps by category
    gaps_by_category = categorize_skill_gaps(missing_with_details)

    # Identify strengths by category
    strengths = categorize_skills(matched_with_details)

    return {
        "matched_skills": matched_with_details,
        "missing_skills": missing_with_details,
        "extra_skills": extra,
        "match_percentage": round(match_percentage, 2),
        "gap_analysis": {
            "critical_gaps": [s for s in missing_with_details if s.get("importance") == "critical"],
            "high_priority_gaps": [s for s in missing_with_details if s.get("importance") == "high"],
            "gaps_by_category": gaps_by_category
        },
        "strengths_by_category": strengths,
        "learning_path": learning_path,
        "estimated_learning_weeks": total_weeks,
        "course_recommendations": recommendations,
        "certifications_suggested": get_suggested_certifications(missing_with_details[:5]),
        "total_job_skills": len(job_skills_lower),
        "total_resume_skills": len(resume_skills_lower),
        "skill_fit_score": calculate_fit_score(matched, missing, job_skills_lower)
    }


def get_skill_details(skill: str, taxonomy: dict) -> dict:
    """
    Get detailed information about a skill.

    Args:
        skill: Skill name
        taxonomy: Skill taxonomy dictionary

    Returns:
        Dictionary with skill details
    """
    skill_lower = skill.lower()

    if skill_lower in taxonomy:
        skill_data = taxonomy[skill_lower]
        return {
            "skill": skill,
            "level": skill_data.get("level", "intermediate"),
            "category": skill_data.get("category", "general"),
            "importance": skill_data.get("importance", "medium"),
            "time_to_learn": skill_data.get("time_to_learn", "2-4 weeks"),
            "prerequisites": skill_data.get("prerequisites", []),
            "related": skill_data.get("related", []),
            "resources": skill_data.get("resources", [])[:3],  # Top 3 resources
            "certifications": skill_data.get("certifications", []),
            "priority": get_learning_priority(skill_data)
        }

    # Default for unknown skills
    return {
        "skill": skill,
        "level": "intermediate",
        "category": "general",
        "importance": "medium",
        "time_to_learn": "2-4 weeks",
        "prerequisites": [],
        "related": [],
        "resources": [
            {"name": f"Search for '{skill}' courses", "url": f"https://www.coursera.org/search?query={skill}", "type": "course"}
        ],
        "certifications": [],
        "priority": "Medium"
    }


def get_learning_priority(skill_data: dict) -> str:
    """
    Determine learning priority based on skill data.

    Args:
        skill_data: Skill information from taxonomy

    Returns:
        Priority string (High/Medium/Low)
    """
    importance = skill_data.get("importance", "medium")
    level = skill_data.get("level", "intermediate")

    if importance == "critical":
        return "High"
    elif importance == "high" and level in ["beginner", "intermediate"]:
        return "High"
    elif importance == "high":
        return "Medium"
    elif level == "beginner":
        return "Medium"
    elif level == "advanced":
        return "Low"

    return "Medium"


def generate_learning_path(missing_skills: list, taxonomy: dict) -> list:
    """
    Generate an optimal learning path based on prerequisites.

    Args:
        missing_skills: List of missing skill details
        taxonomy: Skill taxonomy

    Returns:
        Ordered list of skills to learn
    """
    # Build dependency graph
    skill_names = {s["skill"].lower() for s in missing_skills}
    learning_order = []
    added = set()

    def add_skill_with_prereqs(skill_info):
        skill = skill_info["skill"].lower()
        if skill in added:
            return

        # Add prerequisites first
        for prereq in skill_info.get("prerequisites", []):
            prereq_lower = prereq.lower()
            if prereq_lower in skill_names and prereq_lower not in added:
                prereq_info = next((s for s in missing_skills if s["skill"].lower() == prereq_lower), None)
                if prereq_info:
                    add_skill_with_prereqs(prereq_info)

        # Add this skill
        if skill not in added:
            learning_order.append({
                "skill": skill_info["skill"],
                "time_to_learn": skill_info.get("time_to_learn", "2-4 weeks"),
                "priority": skill_info.get("priority", "Medium"),
                "category": skill_info.get("category", "general")
            })
            added.add(skill)

    # Sort by importance and add with prerequisites
    sorted_skills = sorted(missing_skills, key=lambda x: (
        importance_order(x.get("importance", "medium")),
        0 if x.get("level") == "beginner" else 1
    ))

    for skill_info in sorted_skills:
        add_skill_with_prereqs(skill_info)

    return learning_order


def get_top_recommendations(missing_skills: list, taxonomy: dict) -> list:
    """
    Get top course recommendations for missing skills.

    Args:
        missing_skills: List of missing skill details
        taxonomy: Skill taxonomy

    Returns:
        List of course recommendations
    """
    recommendations = []

    for skill_info in missing_skills:
        skill = skill_info["skill"]
        resources = skill_info.get("resources", [])

        if resources:
            # Get the best resource (prefer courses)
            course = next((r for r in resources if r.get("type") == "course"), resources[0])
            recommendations.append({
                "skill": skill,
                "resource": course.get("name", f"Learn {skill}"),
                "url": course.get("url", ""),
                "type": course.get("type", "course"),
                "time_to_learn": skill_info.get("time_to_learn", "2-4 weeks"),
                "priority": skill_info.get("priority", "Medium")
            })
        else:
            recommendations.append({
                "skill": skill,
                "resource": f"Search for '{skill}' courses on Coursera or Udemy",
                "url": f"https://www.coursera.org/search?query={skill}",
                "type": "search",
                "time_to_learn": skill_info.get("time_to_learn", "2-4 weeks"),
                "priority": skill_info.get("priority", "Medium")
            })

    return recommendations


def get_suggested_certifications(missing_skills: list) -> list:
    """
    Get suggested certifications for skill gaps.

    Args:
        missing_skills: List of missing skill details

    Returns:
        List of certification suggestions
    """
    certifications = []

    for skill_info in missing_skills:
        certs = skill_info.get("certifications", [])
        for cert in certs[:1]:  # Only top cert per skill
            certifications.append({
                "skill": skill_info["skill"],
                "certification": cert
            })

    return certifications


def categorize_skill_gaps(skills: list) -> dict:
    """
    Categorize skill gaps by category.

    Args:
        skills: List of skill details

    Returns:
        Dictionary of skills by category
    """
    categories = {}

    for skill in skills:
        category = skill.get("category", "general")
        if category not in categories:
            categories[category] = []
        categories[category].append(skill["skill"])

    return categories


def categorize_skills(skills: list) -> dict:
    """
    Categorize matched skills by category.

    Args:
        skills: List of skill details

    Returns:
        Dictionary of skills by category
    """
    categories = {}

    for skill in skills:
        category = skill.get("category", "general")
        if category not in categories:
            categories[category] = []
        categories[category].append(skill["skill"])

    return categories


def calculate_fit_score(matched: list, missing: list, job_skills: set) -> dict:
    """
    Calculate a detailed fit score.

    Args:
        matched: List of matched skills
        missing: List of missing skills
        job_skills: Set of job skills

    Returns:
        Fit score details
    """
    if not job_skills:
        return {"score": 0, "rating": "N/A", "message": "No skills identified in job description"}

    match_ratio = len(matched) / len(job_skills)

    if match_ratio >= 0.8:
        rating = "Excellent"
        message = "You're a strong match for this role!"
    elif match_ratio >= 0.6:
        rating = "Good"
        message = "You have most required skills. Focus on filling critical gaps."
    elif match_ratio >= 0.4:
        rating = "Fair"
        message = "You have a foundation. Consider building missing skills before applying."
    else:
        rating = "Needs Improvement"
        message = "Significant upskilling needed. Use the learning path to build your profile."

    return {
        "score": round(match_ratio * 100, 1),
        "rating": rating,
        "message": message
    }


def parse_time_to_learn(time_str: str) -> int:
    """
    Parse time to learn string to weeks.

    Args:
        time_str: Time string (e.g., "2-4 weeks", "3 weeks")

    Returns:
        Average weeks as integer
    """
    import re

    # Handle range format
    range_match = re.search(r'(\d+)-(\d+)', time_str)
    if range_match:
        low = int(range_match.group(1))
        high = int(range_match.group(2))
        return (low + high) // 2

    # Handle single number
    match = re.search(r'(\d+)', time_str)
    if match:
        return int(match.group(1))

    return 3  # Default


def priority_order(priority: str) -> int:
    """Convert priority to numeric order for sorting."""
    order = {"High": 0, "Medium": 1, "Low": 2}
    return order.get(priority, 1)


def importance_order(importance: str) -> int:
    """Convert importance to numeric order for sorting."""
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    return order.get(importance, 2)


def get_related_skills(skill: str) -> list:
    """Get related skills for a given skill."""
    taxonomy = load_taxonomy()
    skill_lower = skill.lower()

    if skill_lower in taxonomy:
        related = taxonomy[skill_lower].get("related", [])
        return related[:5]

    return []


def get_skill_learning_resources(skill: str) -> list:
    """
    Get learning resources for a specific skill.

    Args:
        skill: Skill name

    Returns:
        List of learning resources
    """
    taxonomy = load_taxonomy()
    skill_lower = skill.lower()

    if skill_lower in taxonomy:
        return taxonomy[skill_lower].get("resources", [])

    return [
        {
            "name": f"Search for '{skill}' courses",
            "url": f"https://www.coursera.org/search?query={skill}",
            "type": "course"
        }
    ]


def get_skill_prerequisites(skill: str) -> list:
    """
    Get prerequisites for a skill.

    Args:
        skill: Skill name

    Returns:
        List of prerequisite skills
    """
    taxonomy = load_taxonomy()
    skill_lower = skill.lower()

    if skill_lower in taxonomy:
        return taxonomy[skill_lower].get("prerequisites", [])

    return []


def quick_skill_analysis(skills_list: list) -> dict:
    """
    Quick analysis of a list of skills.

    Args:
        skills_list: List of skill names

    Returns:
        Analysis summary
    """
    taxonomy = load_taxonomy()
    analysis = {
        "total_skills": len(skills_list),
        "by_level": {"beginner": 0, "intermediate": 0, "advanced": 0},
        "by_category": {},
        "critical_skills": [],
        "learning_time_weeks": 0
    }

    for skill in skills_list:
        skill_lower = skill.lower()
        if skill_lower in taxonomy:
            skill_data = taxonomy[skill_lower]

            # Count by level
            level = skill_data.get("level", "intermediate")
            analysis["by_level"][level] = analysis["by_level"].get(level, 0) + 1

            # Count by category
            category = skill_data.get("category", "general")
            analysis["by_category"][category] = analysis["by_category"].get(category, 0) + 1

            # Track critical skills
            if skill_data.get("importance") == "critical":
                analysis["critical_skills"].append(skill)

            # Sum learning time
            time_str = skill_data.get("time_to_learn", "2-4 weeks")
            analysis["learning_time_weeks"] += parse_time_to_learn(time_str)

    return analysis
