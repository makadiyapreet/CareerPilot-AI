"""
Roadmap Generator Module
Generates personalized learning roadmaps based on target role and missing skills.
"""
import os
import json
import re
import difflib

TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), 'roadmap_templates.json')


def load_templates() -> dict:
    """Load roadmap templates from JSON file."""
    try:
        with open(TEMPLATES_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def generate_roadmap(target_role: str, missing_skills: list = None, experience_level: str = "beginner") -> dict:
    """
    Generate a personalized learning roadmap.

    Args:
        target_role: Target job role (e.g., "Data Analyst", "Frontend Developer")
        missing_skills: Optional list of skills the user needs to learn
        experience_level: User's current level (beginner, intermediate, advanced)

    Returns:
        Dictionary containing:
        - target_role: Matched role name
        - description: Role description
        - salary_range: Expected salary range
        - steps: List of learning steps
        - total_estimated_weeks: Total duration
        - filtered: Whether steps were filtered by missing skills
    """
    templates = load_templates()

    if not templates:
        return {
            "target_role": target_role,
            "description": "",
            "salary_range": "",
            "steps": [],
            "total_estimated_weeks": 0,
            "filtered": False,
            "error": "Roadmap templates not loaded. Please contact support.",
            "message": "Template file missing or corrupted"
        }

    matched_role = find_closest_role(target_role, templates)

    if matched_role is None:
        available_roles = list(templates.keys())
        return {
            "target_role": target_role,
            "description": "",
            "salary_range": "",
            "steps": [],
            "total_estimated_weeks": 0,
            "filtered": False,
            "message": f"No template found for '{target_role}'. Try one of these: {', '.join(available_roles[:5])}...",
            "available_roles": available_roles,
            "suggestions": get_role_suggestions(target_role, available_roles)
        }

    role_data = templates[matched_role]

    # Handle both old and new template formats
    if isinstance(role_data, list):
        # Old format: direct list of steps
        steps = role_data
        description = ""
        salary_range = ""
        total_duration = ""
    else:
        # New format: dict with metadata and steps
        steps = role_data.get("steps", [])
        description = role_data.get("description", "")
        salary_range = role_data.get("salary_range", "")
        total_duration = role_data.get("total_duration", "")

    # Validate steps have resources
    steps = validate_and_enrich_steps(steps)

    if missing_skills and len(missing_skills) > 0:
        filtered_steps = filter_steps_by_skills(steps, missing_skills)
        is_filtered = True
    else:
        filtered_steps = steps
        is_filtered = False

    # Adjust for experience level
    if experience_level.lower() == "advanced":
        # Skip beginner steps for advanced users
        filtered_steps = [s for s in filtered_steps if s.get("priority") != "beginner" or "portfolio" in s.get("skill", "").lower()]
    elif experience_level.lower() == "intermediate":
        # Keep most steps but mark some as optional
        for step in filtered_steps:
            if step.get("priority") == "beginner":
                step["optional"] = True

    # Sort by step number
    filtered_steps = sorted(filtered_steps, key=lambda x: x.get('step', 0))

    total_weeks = calculate_total_weeks(filtered_steps)

    # Generate prioritized learning order
    prioritized_steps = prioritize_steps(filtered_steps)

    return {
        "target_role": matched_role,
        "description": description,
        "salary_range": salary_range,
        "total_duration": total_duration,
        "steps": prioritized_steps,
        "total_estimated_weeks": total_weeks,
        "filtered": is_filtered,
        "total_steps": len(prioritized_steps),
        "experience_level": experience_level,
        "critical_skills": [s.get("skill") for s in prioritized_steps if s.get("priority") == "critical"],
        "estimated_completion_date": calculate_completion_date(total_weeks)
    }


def find_closest_role(target_role: str, templates: dict) -> str:
    """
    Find the closest matching role in templates.

    Args:
        target_role: Input role name
        templates: Available templates

    Returns:
        Matched role name or None
    """
    available_roles = list(templates.keys())

    if target_role in available_roles:
        return target_role

    target_lower = target_role.lower()
    for role in available_roles:
        if role.lower() == target_lower:
            return role

    # Check for common aliases
    role_aliases = {
        "ml engineer": "Machine Learning Engineer",
        "ml": "Machine Learning Engineer",
        "ai engineer": "AI/ML Engineer",
        "ai/ml": "AI/ML Engineer",
        "frontend": "Frontend Developer",
        "backend": "Backend Developer",
        "fullstack": "Full Stack Developer",
        "full-stack": "Full Stack Developer",
        "data science": "Data Scientist",
        "ds": "Data Scientist",
        "da": "Data Analyst",
        "devops": "DevOps Engineer",
        "swe": "Software Engineer",
        "sde": "Software Engineer",
        "cloud": "Cloud Engineer",
        "pm": "Product Manager",
        "security": "Cybersecurity Analyst",
        "infosec": "Cybersecurity Analyst"
    }

    if target_lower in role_aliases:
        alias_match = role_aliases[target_lower]
        if alias_match in available_roles:
            return alias_match

    # Fuzzy matching
    matches = difflib.get_close_matches(
        target_role,
        available_roles,
        n=1,
        cutoff=0.4
    )

    if matches:
        return matches[0]

    # Word intersection matching
    target_words = set(target_role.lower().split())
    for role in available_roles:
        role_words = set(role.lower().split())
        if target_words & role_words:
            return role

    return None


def filter_steps_by_skills(steps: list, missing_skills: list) -> list:
    """
    Filter roadmap steps based on missing skills.

    Args:
        steps: Full list of roadmap steps
        missing_skills: Skills the user needs to learn

    Returns:
        Filtered list of steps
    """
    if not missing_skills:
        return steps

    missing_lower = [s.lower() for s in missing_skills]
    filtered = []

    # Skill keyword mapping for better matching
    skill_keywords = {
        "python": ["python", "pandas", "numpy", "flask", "django", "fastapi"],
        "javascript": ["javascript", "js", "react", "node", "express", "typescript"],
        "java": ["java", "spring", "maven"],
        "sql": ["sql", "database", "mysql", "postgresql", "mongodb"],
        "machine learning": ["ml", "machine learning", "scikit", "tensorflow", "pytorch"],
        "deep learning": ["deep learning", "neural", "cnn", "rnn", "transformer"],
        "docker": ["docker", "container", "kubernetes"],
        "aws": ["aws", "cloud", "ec2", "s3"],
        "react": ["react", "frontend", "javascript"]
    }

    for step in steps:
        skill_name = step.get('skill', '').lower()
        description = step.get('description', '').lower()

        # Check direct match
        if any(ms in skill_name or skill_name in ms for ms in missing_lower):
            filtered.append(step)
            continue

        # Check description for skill mentions
        if any(ms in description for ms in missing_lower):
            filtered.append(step)
            continue

        # Check via keyword mapping
        for skill_key, keywords in skill_keywords.items():
            if any(k in skill_name for k in keywords):
                if any(ms in skill_key or skill_key in ms for ms in missing_lower):
                    filtered.append(step)
                    break

        # Always include first step and portfolio steps
        if step.get('step', 0) == 1:
            if step not in filtered:
                filtered.append(step)
        elif 'portfolio' in skill_name or 'project' in skill_name:
            if step not in filtered:
                filtered.append(step)

        # Include critical priority steps
        if step.get('priority') == 'critical' and step not in filtered:
            filtered.append(step)

    if not filtered:
        # Return first 3 steps + portfolio step if no matches
        filtered = steps[:3]
        portfolio_step = next((s for s in steps if 'portfolio' in s.get('skill', '').lower()), None)
        if portfolio_step and portfolio_step not in filtered:
            filtered.append(portfolio_step)

    return filtered


def prioritize_steps(steps: list) -> list:
    """
    Prioritize and enrich learning steps.

    Args:
        steps: List of roadmap steps

    Returns:
        Enriched steps with priority scores
    """
    priority_scores = {
        "critical": 3,
        "high": 2,
        "medium": 1,
        "low": 0
    }

    for step in steps:
        priority = step.get("priority", "medium")
        step["priority_score"] = priority_scores.get(priority, 1)

        # Add learning tips based on skill type
        skill = step.get("skill", "").lower()
        if "programming" in skill or "python" in skill or "javascript" in skill:
            step["learning_tip"] = "Practice coding daily. Build small projects to reinforce concepts."
        elif "database" in skill or "sql" in skill:
            step["learning_tip"] = "Work with real datasets. Practice writing queries regularly."
        elif "machine learning" in skill or "deep learning" in skill:
            step["learning_tip"] = "Implement algorithms from scratch first, then use libraries."
        elif "portfolio" in skill or "project" in skill:
            step["learning_tip"] = "Focus on quality over quantity. Document your process well."
        elif "docker" in skill or "kubernetes" in skill:
            step["learning_tip"] = "Set up a local development environment to practice."
        elif "cloud" in skill or "aws" in skill or "azure" in skill:
            step["learning_tip"] = "Use free tier accounts to practice. Follow along with tutorials."

    return steps


def calculate_total_weeks(steps: list) -> int:
    """
    Calculate total duration in weeks from steps.

    Args:
        steps: List of roadmap steps

    Returns:
        Total weeks as integer
    """
    total = 0
    for step in steps:
        duration = step.get('duration', '0 weeks')
        weeks = parse_duration(duration)
        total += weeks
    return total


def parse_duration(duration_str: str) -> int:
    """
    Parse duration string to weeks.

    Args:
        duration_str: Duration string (e.g., "2 weeks", "1 week", "2-3 weeks")

    Returns:
        Number of weeks (average if range)
    """
    # Handle range format like "2-3 weeks"
    range_match = re.search(r'(\d+)-(\d+)', duration_str)
    if range_match:
        low = int(range_match.group(1))
        high = int(range_match.group(2))
        return (low + high) // 2

    # Handle single number
    match = re.search(r'(\d+)', duration_str)
    if match:
        return int(match.group(1))
    return 0


def get_available_roles() -> list:
    """Get list of available target roles with metadata."""
    templates = load_templates()
    roles = []

    for role_name, role_data in templates.items():
        if isinstance(role_data, dict):
            roles.append({
                "name": role_name,
                "description": role_data.get("description", ""),
                "salary_range": role_data.get("salary_range", ""),
                "total_duration": role_data.get("total_duration", ""),
                "total_steps": len(role_data.get("steps", []))
            })
        else:
            # Old format
            roles.append({
                "name": role_name,
                "total_steps": len(role_data)
            })

    return roles


def get_roadmap_preview(target_role: str) -> dict:
    """
    Get a preview of a roadmap without full details.

    Args:
        target_role: Target role name

    Returns:
        Preview dictionary with step count and duration
    """
    templates = load_templates()
    matched_role = find_closest_role(target_role, templates)

    if matched_role is None:
        return {
            "available": False,
            "available_roles": list(templates.keys())
        }

    role_data = templates[matched_role]

    # Handle both formats
    if isinstance(role_data, dict):
        steps = role_data.get("steps", [])
        description = role_data.get("description", "")
        salary_range = role_data.get("salary_range", "")
    else:
        steps = role_data
        description = ""
        salary_range = ""

    total_weeks = calculate_total_weeks(steps)

    return {
        "available": True,
        "role": matched_role,
        "description": description,
        "salary_range": salary_range,
        "total_steps": len(steps),
        "total_weeks": total_weeks,
        "skills_covered": [step.get('skill') for step in steps],
        "critical_skills": [step.get('skill') for step in steps if step.get('priority') == 'critical']
    }


def get_role_comparison(roles: list) -> list:
    """
    Compare multiple roles side by side.

    Args:
        roles: List of role names to compare

    Returns:
        List of comparison data for each role
    """
    templates = load_templates()
    comparisons = []

    for role_name in roles:
        matched_role = find_closest_role(role_name, templates)
        if matched_role:
            role_data = templates[matched_role]
            if isinstance(role_data, dict):
                steps = role_data.get("steps", [])
                comparisons.append({
                    "role": matched_role,
                    "description": role_data.get("description", ""),
                    "salary_range": role_data.get("salary_range", ""),
                    "total_duration": role_data.get("total_duration", ""),
                    "total_steps": len(steps),
                    "key_skills": [s.get("skill") for s in steps if s.get("priority") == "critical"][:5]
                })

    return comparisons


def suggest_related_roles(target_role: str) -> list:
    """
    Suggest related roles based on skill overlap.

    Args:
        target_role: Current target role

    Returns:
        List of related role names with overlap percentage
    """
    templates = load_templates()
    matched_role = find_closest_role(target_role, templates)

    if not matched_role:
        return []

    # Get skills for target role
    target_data = templates[matched_role]
    if isinstance(target_data, dict):
        target_skills = set(s.get("skill", "").lower() for s in target_data.get("steps", []))
    else:
        target_skills = set(s.get("skill", "").lower() for s in target_data)

    related = []
    for role_name, role_data in templates.items():
        if role_name == matched_role:
            continue

        if isinstance(role_data, dict):
            role_skills = set(s.get("skill", "").lower() for s in role_data.get("steps", []))
        else:
            role_skills = set(s.get("skill", "").lower() for s in role_data)

        # Calculate overlap
        overlap = len(target_skills & role_skills)
        total = len(target_skills | role_skills)
        overlap_pct = (overlap / total * 100) if total > 0 else 0

        if overlap_pct > 20:  # At least 20% skill overlap
            related.append({
                "role": role_name,
                "overlap_percentage": round(overlap_pct, 1),
                "shared_skills": list(target_skills & role_skills)[:5]
            })

    # Sort by overlap percentage
    related.sort(key=lambda x: x["overlap_percentage"], reverse=True)
    return related[:5]


def validate_and_enrich_steps(steps: list) -> list:
    """
    Validate and enrich roadmap steps with default values.

    Args:
        steps: List of roadmap steps

    Returns:
        Enriched and validated steps
    """
    for step in steps:
        # Ensure resources exist
        if "resources" not in step or not step["resources"]:
            step["resources"] = [{
                "name": "Search online for resources",
                "url": f"https://www.google.com/search?q={step.get('skill', '').replace(' ', '+')}+tutorial",
                "type": "search"
            }]

        # Ensure priority exists
        if "priority" not in step:
            step["priority"] = "medium"

        # Ensure description exists
        if "description" not in step:
            step["description"] = f"Learn {step.get('skill', 'this skill')}"

        # Ensure duration exists
        if "duration" not in step:
            step["duration"] = "2 weeks"

    return steps


def get_role_suggestions(target_role: str, available_roles: list) -> list:
    """
    Get role suggestions based on partial match.

    Args:
        target_role: User's input role
        available_roles: List of available roles

    Returns:
        List of suggested role names
    """
    target_lower = target_role.lower()
    target_words = set(target_lower.split())

    suggestions = []
    for role in available_roles:
        role_lower = role.lower()
        role_words = set(role_lower.split())

        # Check for word overlap
        if target_words & role_words:
            suggestions.append(role)
        # Check for substring match
        elif target_lower in role_lower or role_lower in target_lower:
            suggestions.append(role)

    return suggestions[:5]


def calculate_completion_date(weeks: int) -> str:
    """
    Calculate estimated completion date from current date.

    Args:
        weeks: Number of weeks

    Returns:
        Formatted date string
    """
    from datetime import datetime, timedelta
    completion_date = datetime.now() + timedelta(weeks=weeks)
    return completion_date.strftime("%B %Y")

