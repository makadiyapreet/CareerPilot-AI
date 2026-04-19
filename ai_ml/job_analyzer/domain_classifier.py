"""
Domain Classification Module
Classifies job domains based on skills and text content.
"""

DOMAIN_RULES = {
    "Machine Learning / AI": [
        "machine learning", "ml", "deep learning", "dl", "artificial intelligence",
        "ai", "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
        "neural networks", "nlp", "computer vision", "reinforcement learning",
        "data science", "hugging face", "transformers"
    ],
    "Web Development (Frontend)": [
        "react", "angular", "vue", "vue.js", "html", "css", "javascript",
        "frontend", "front-end", "ui developer", "svelte", "tailwind",
        "bootstrap", "next.js", "gatsby"
    ],
    "Web Development (Backend)": [
        "node.js", "nodejs", "django", "flask", "fastapi", "spring",
        "spring boot", "express", "backend", "back-end", "laravel",
        "rails", "ruby on rails", "asp.net", "nest.js"
    ],
    "Full Stack Development": [
        "full stack", "fullstack", "full-stack", "mern", "mean", "lamp"
    ],
    "Data Analytics": [
        "data analyst", "data analytics", "sql", "tableau", "power bi",
        "excel", "data visualization", "business intelligence", "bi",
        "looker", "metabase", "reporting"
    ],
    "Data Engineering": [
        "data engineer", "data engineering", "etl", "data pipeline",
        "hadoop", "spark", "kafka", "airflow", "data warehouse",
        "snowflake", "databricks", "redshift"
    ],
    "Cloud Computing": [
        "aws", "azure", "gcp", "google cloud", "cloud engineer",
        "cloud architect", "cloudformation", "cloud computing"
    ],
    "DevOps": [
        "devops", "docker", "kubernetes", "k8s", "ci/cd", "jenkins",
        "terraform", "ansible", "infrastructure", "site reliability",
        "sre", "gitops"
    ],
    "Mobile Development": [
        "android", "ios", "mobile developer", "react native", "flutter",
        "swift", "kotlin", "mobile app", "xamarin"
    ],
    "Cybersecurity": [
        "cybersecurity", "security engineer", "penetration testing",
        "ethical hacking", "security analyst", "soc", "kali",
        "vulnerability", "infosec"
    ],
    "Database Administration": [
        "database administrator", "dba", "database management",
        "oracle dba", "sql server dba", "mysql dba", "postgres dba"
    ],
    "Quality Assurance": [
        "qa engineer", "quality assurance", "test engineer", "testing",
        "selenium", "automation testing", "manual testing", "qc"
    ]
}


def classify_domain(skills_list: list, text: str) -> str:
    """
    Classify the job domain based on skills and text content.

    Args:
        skills_list: List of extracted technical skills
        text: Full job description text

    Returns:
        Classified domain string
    """
    text_lower = text.lower()
    skills_lower = [s.lower() for s in skills_list]

    domain_scores = {}

    for domain, keywords in DOMAIN_RULES.items():
        score = 0
        for keyword in keywords:
            if keyword in text_lower:
                score += 2
            if keyword in skills_lower:
                score += 3
        domain_scores[domain] = score

    if domain_scores:
        max_domain = max(domain_scores, key=domain_scores.get)
        if domain_scores[max_domain] > 0:
            return max_domain

    return "General Software Development"


def get_all_domains() -> list:
    """
    Get list of all possible domains.

    Returns:
        List of domain names
    """
    return list(DOMAIN_RULES.keys()) + ["General Software Development"]
