"""
Enhanced Skill Extraction Module
Extracts technical and soft skills from text with better accuracy.
"""
import re

# Comprehensive skills organized by category
SKILLS_DATABASE = {
    "programming_languages": {
        "python": ["python", "python3", "py"],
        "java": ["java", "java8", "java11", "java17", "jdk", "jvm"],
        "javascript": ["javascript", "js", "es6", "es2015", "ecmascript"],
        "typescript": ["typescript", "ts"],
        "c++": ["c++", "cpp", "c plus plus"],
        "c#": ["c#", "csharp", "c sharp", ".net core"],
        "c": ["c programming", "ansi c"],
        "go": ["go", "golang"],
        "rust": ["rust", "rustlang"],
        "ruby": ["ruby"],
        "php": ["php", "php7", "php8"],
        "swift": ["swift"],
        "kotlin": ["kotlin"],
        "scala": ["scala"],
        "r": ["r programming", "r language", "rstudio"],
        "matlab": ["matlab"],
        "julia": ["julia"],
        "dart": ["dart"],
        "perl": ["perl"],
        "haskell": ["haskell"],
        "lua": ["lua"],
        "groovy": ["groovy"],
        "elixir": ["elixir"],
        "clojure": ["clojure"],
        "fortran": ["fortran"],
        "cobol": ["cobol"],
        "assembly": ["assembly", "asm"],
        "vba": ["vba", "visual basic"],
        "shell": ["shell", "bash", "zsh", "powershell", "shell scripting"],
    },
    "frontend": {
        "html": ["html", "html5"],
        "css": ["css", "css3"],
        "react": ["react", "reactjs", "react.js", "react native"],
        "angular": ["angular", "angularjs", "angular.js"],
        "vue": ["vue", "vuejs", "vue.js", "vue3"],
        "svelte": ["svelte", "sveltekit"],
        "next.js": ["next.js", "nextjs", "next"],
        "nuxt.js": ["nuxt.js", "nuxtjs", "nuxt"],
        "gatsby": ["gatsby", "gatsbyjs"],
        "jquery": ["jquery"],
        "bootstrap": ["bootstrap", "bootstrap5"],
        "tailwind css": ["tailwind", "tailwindcss", "tailwind css"],
        "sass": ["sass", "scss"],
        "less": ["less"],
        "material ui": ["material ui", "material-ui", "mui"],
        "chakra ui": ["chakra ui", "chakra"],
        "ant design": ["ant design", "antd"],
        "styled components": ["styled components", "styled-components"],
        "webpack": ["webpack"],
        "vite": ["vite"],
        "babel": ["babel"],
        "redux": ["redux", "redux toolkit", "rtk"],
        "mobx": ["mobx"],
        "zustand": ["zustand"],
        "pwa": ["pwa", "progressive web app"],
        "web components": ["web components"],
        "three.js": ["three.js", "threejs"],
        "d3.js": ["d3.js", "d3js", "d3"],
    },
    "backend": {
        "node.js": ["node.js", "nodejs", "node"],
        "express": ["express", "express.js", "expressjs"],
        "django": ["django"],
        "flask": ["flask"],
        "fastapi": ["fastapi", "fast api"],
        "spring boot": ["spring boot", "springboot", "spring framework", "spring"],
        "asp.net": ["asp.net", "asp.net core", ".net", "dotnet"],
        "laravel": ["laravel"],
        "rails": ["rails", "ruby on rails", "ror"],
        "nest.js": ["nest.js", "nestjs", "nest"],
        "koa": ["koa", "koa.js"],
        "hapi": ["hapi", "hapi.js"],
        "fastify": ["fastify"],
        "gin": ["gin", "gin-gonic"],
        "echo": ["echo golang"],
        "fiber": ["fiber"],
        "actix": ["actix", "actix-web"],
        "phoenix": ["phoenix framework"],
        "strapi": ["strapi"],
        "prisma": ["prisma"],
        "graphql": ["graphql", "apollo graphql", "apollo server"],
        "rest api": ["rest api", "restful", "rest", "api design"],
        "grpc": ["grpc"],
        "websocket": ["websocket", "socket.io", "ws"],
        "microservices": ["microservices", "micro services"],
        "serverless": ["serverless", "lambda functions"],
    },
    "databases": {
        "sql": ["sql"],
        "mysql": ["mysql"],
        "postgresql": ["postgresql", "postgres", "psql"],
        "mongodb": ["mongodb", "mongo"],
        "redis": ["redis"],
        "sqlite": ["sqlite", "sqlite3"],
        "oracle": ["oracle", "oracle db", "plsql", "pl/sql"],
        "sql server": ["sql server", "mssql", "microsoft sql"],
        "mariadb": ["mariadb"],
        "cassandra": ["cassandra", "apache cassandra"],
        "dynamodb": ["dynamodb", "dynamo db"],
        "firebase": ["firebase", "firestore"],
        "elasticsearch": ["elasticsearch", "elastic search", "elk"],
        "neo4j": ["neo4j", "graph database"],
        "couchdb": ["couchdb", "couch db"],
        "influxdb": ["influxdb"],
        "timescaledb": ["timescaledb"],
        "cockroachdb": ["cockroachdb"],
        "supabase": ["supabase"],
        "planetscale": ["planetscale"],
        "snowflake": ["snowflake"],
        "redshift": ["redshift", "aws redshift"],
        "bigquery": ["bigquery", "big query"],
        "databricks": ["databricks"],
    },
    "cloud_devops": {
        "aws": ["aws", "amazon web services", "ec2", "s3", "lambda", "rds", "cloudfront", "route53", "iam", "vpc", "eks", "ecs", "sqs", "sns", "cloudwatch", "dynamodb"],
        "azure": ["azure", "microsoft azure", "azure devops", "azure functions"],
        "gcp": ["gcp", "google cloud", "google cloud platform", "cloud run", "cloud functions", "gke"],
        "docker": ["docker", "dockerfile", "docker-compose", "docker compose"],
        "kubernetes": ["kubernetes", "k8s", "kubectl", "helm", "eks", "aks", "gke"],
        "terraform": ["terraform", "iac", "infrastructure as code"],
        "ansible": ["ansible"],
        "jenkins": ["jenkins"],
        "github actions": ["github actions", "gh actions"],
        "gitlab ci": ["gitlab ci", "gitlab ci/cd"],
        "circleci": ["circleci", "circle ci"],
        "travis ci": ["travis ci", "travisci"],
        "argocd": ["argocd", "argo cd"],
        "prometheus": ["prometheus"],
        "grafana": ["grafana"],
        "datadog": ["datadog"],
        "nginx": ["nginx"],
        "apache": ["apache", "httpd"],
        "linux": ["linux", "ubuntu", "centos", "debian", "rhel"],
        "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous deployment"],
    },
    "ai_ml": {
        "machine learning": ["machine learning", "ml"],
        "deep learning": ["deep learning", "dl"],
        "artificial intelligence": ["artificial intelligence", "ai"],
        "tensorflow": ["tensorflow", "tf"],
        "pytorch": ["pytorch", "torch"],
        "keras": ["keras"],
        "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
        "pandas": ["pandas"],
        "numpy": ["numpy", "np"],
        "scipy": ["scipy"],
        "matplotlib": ["matplotlib", "plt"],
        "seaborn": ["seaborn"],
        "plotly": ["plotly"],
        "opencv": ["opencv", "cv2", "open cv"],
        "nlp": ["nlp", "natural language processing"],
        "computer vision": ["computer vision", "cv", "image processing"],
        "spacy": ["spacy"],
        "nltk": ["nltk"],
        "hugging face": ["hugging face", "huggingface", "transformers"],
        "bert": ["bert"],
        "gpt": ["gpt", "chatgpt", "gpt-3", "gpt-4", "openai"],
        "llm": ["llm", "large language model", "llama", "mistral"],
        "langchain": ["langchain"],
        "neural networks": ["neural networks", "ann", "dnn"],
        "cnn": ["cnn", "convolutional neural network"],
        "rnn": ["rnn", "recurrent neural network"],
        "lstm": ["lstm"],
        "gan": ["gan", "generative adversarial"],
        "reinforcement learning": ["reinforcement learning", "rl"],
        "xgboost": ["xgboost"],
        "lightgbm": ["lightgbm"],
        "catboost": ["catboost"],
        "mlflow": ["mlflow"],
        "kubeflow": ["kubeflow"],
        "mlops": ["mlops"],
        "feature engineering": ["feature engineering"],
        "model deployment": ["model deployment", "model serving"],
    },
    "data_engineering": {
        "data analysis": ["data analysis", "data analytics"],
        "data science": ["data science"],
        "data engineering": ["data engineering"],
        "big data": ["big data"],
        "hadoop": ["hadoop", "hdfs", "mapreduce"],
        "spark": ["spark", "apache spark", "pyspark"],
        "kafka": ["kafka", "apache kafka"],
        "airflow": ["airflow", "apache airflow"],
        "luigi": ["luigi"],
        "dbt": ["dbt", "data build tool"],
        "etl": ["etl", "extract transform load"],
        "data warehousing": ["data warehousing", "data warehouse", "dwh"],
        "data lake": ["data lake"],
        "data pipeline": ["data pipeline", "data pipelines"],
        "tableau": ["tableau"],
        "power bi": ["power bi", "powerbi"],
        "looker": ["looker"],
        "metabase": ["metabase"],
        "superset": ["superset", "apache superset"],
        "excel": ["excel", "microsoft excel", "spreadsheet"],
        "google sheets": ["google sheets"],
    },
    "mobile": {
        "android": ["android", "android studio", "android sdk"],
        "ios": ["ios", "iphone", "ipad"],
        "react native": ["react native"],
        "flutter": ["flutter", "dart flutter"],
        "swift": ["swift", "swiftui"],
        "kotlin android": ["kotlin android", "kotlin mobile"],
        "xamarin": ["xamarin"],
        "ionic": ["ionic"],
        "cordova": ["cordova", "phonegap"],
        "expo": ["expo"],
    },
    "testing": {
        "unit testing": ["unit testing", "unit tests"],
        "integration testing": ["integration testing", "integration tests"],
        "e2e testing": ["e2e testing", "end to end testing"],
        "selenium": ["selenium", "webdriver"],
        "cypress": ["cypress"],
        "playwright": ["playwright"],
        "jest": ["jest"],
        "mocha": ["mocha"],
        "chai": ["chai"],
        "pytest": ["pytest"],
        "junit": ["junit"],
        "testng": ["testng"],
        "cucumber": ["cucumber", "bdd"],
        "postman": ["postman"],
        "tdd": ["tdd", "test driven development"],
        "qa": ["qa", "quality assurance"],
    },
    "security": {
        "cybersecurity": ["cybersecurity", "cyber security"],
        "penetration testing": ["penetration testing", "pentest", "pentesting"],
        "ethical hacking": ["ethical hacking"],
        "owasp": ["owasp"],
        "security": ["security", "infosec", "information security"],
        "encryption": ["encryption", "cryptography"],
        "oauth": ["oauth", "oauth2", "oauth 2.0"],
        "jwt": ["jwt", "json web token"],
        "ssl/tls": ["ssl", "tls", "https"],
        "sso": ["sso", "single sign-on"],
        "ldap": ["ldap", "active directory"],
        "vault": ["vault", "hashicorp vault"],
        "waf": ["waf", "web application firewall"],
        "siem": ["siem"],
        "soar": ["soar"],
    },
    "tools": {
        "git": ["git"],
        "github": ["github"],
        "gitlab": ["gitlab"],
        "bitbucket": ["bitbucket"],
        "jira": ["jira"],
        "confluence": ["confluence"],
        "trello": ["trello"],
        "asana": ["asana"],
        "notion": ["notion"],
        "slack": ["slack"],
        "vs code": ["vs code", "vscode", "visual studio code"],
        "intellij": ["intellij", "intellij idea"],
        "vim": ["vim", "neovim"],
        "postman": ["postman"],
        "swagger": ["swagger", "openapi"],
        "figma": ["figma"],
        "sketch": ["sketch"],
        "adobe xd": ["adobe xd"],
    },
    "methodologies": {
        "agile": ["agile", "agile methodology"],
        "scrum": ["scrum", "scrum master"],
        "kanban": ["kanban"],
        "devops": ["devops"],
        "devsecops": ["devsecops"],
        "waterfall": ["waterfall"],
        "lean": ["lean", "lean methodology"],
        "safe": ["safe", "scaled agile"],
    },
    "other_tech": {
        "blockchain": ["blockchain"],
        "web3": ["web3", "web 3.0"],
        "solidity": ["solidity"],
        "ethereum": ["ethereum", "eth"],
        "smart contracts": ["smart contracts"],
        "nft": ["nft", "non-fungible token"],
        "iot": ["iot", "internet of things"],
        "raspberry pi": ["raspberry pi"],
        "arduino": ["arduino"],
        "embedded systems": ["embedded systems", "embedded"],
        "vr": ["vr", "virtual reality"],
        "ar": ["ar", "augmented reality"],
        "game development": ["game development", "unity", "unreal engine"],
    }
}

SOFT_SKILLS_DATABASE = {
    "communication": ["communication", "communicate", "verbal", "written communication", "presentation skills", "public speaking"],
    "teamwork": ["teamwork", "team player", "collaboration", "collaborative", "team work"],
    "leadership": ["leadership", "lead", "leading", "mentor", "mentoring", "team lead"],
    "problem solving": ["problem solving", "problem-solving", "analytical", "troubleshooting", "debugging"],
    "time management": ["time management", "deadline", "prioritization", "multitasking", "punctual"],
    "critical thinking": ["critical thinking", "logical thinking", "analytical thinking", "decision making"],
    "adaptability": ["adaptability", "adaptable", "flexible", "flexibility", "versatile"],
    "creativity": ["creativity", "creative", "innovative", "innovation", "out of the box"],
    "attention to detail": ["attention to detail", "detail-oriented", "detail oriented", "meticulous", "thorough"],
    "work ethic": ["work ethic", "self-motivated", "proactive", "dedicated", "committed", "hardworking"],
    "interpersonal": ["interpersonal", "people skills", "relationship building", "networking"],
    "emotional intelligence": ["emotional intelligence", "empathy", "self-awareness"],
    "conflict resolution": ["conflict resolution", "negotiation", "mediation"],
    "initiative": ["initiative", "self-starter", "entrepreneurial", "ownership"],
    "learning": ["fast learner", "quick learner", "continuous learning", "eager to learn", "growth mindset"],
    "organization": ["organizational", "organized", "planning", "coordination"],
}

# Build flat skills list for quick lookup
def _build_skills_list():
    skills = []
    for category, skill_dict in SKILLS_DATABASE.items():
        for main_skill, variations in skill_dict.items():
            skills.append(main_skill)
            skills.extend(variations)
    return list(set(skills))

SKILLS_LIST = _build_skills_list()

# Build flat soft skills list for quick lookup
SOFT_SKILLS_LIST = list(SOFT_SKILLS_DATABASE.keys())


def extract_skills(text: str) -> list:
    """
    Extract technical skills from text with improved accuracy.
    Uses word boundary matching and skill variations.

    Args:
        text: Input text string

    Returns:
        List of matched technical skills (normalized names)
    """
    text_lower = text.lower()
    matched_skills = set()

    for category, skill_dict in SKILLS_DATABASE.items():
        for main_skill, variations in skill_dict.items():
            for variation in variations:
                # Use word boundary matching for better accuracy
                pattern = r'\b' + re.escape(variation.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    matched_skills.add(main_skill)
                    break

    return sorted(list(matched_skills))


def extract_soft_skills(text: str) -> list:
    """
    Extract soft skills from text with improved accuracy.

    Args:
        text: Input text string

    Returns:
        List of matched soft skills
    """
    text_lower = text.lower()
    matched_skills = set()

    for main_skill, variations in SOFT_SKILLS_DATABASE.items():
        for variation in variations:
            pattern = r'\b' + re.escape(variation.lower()) + r'\b'
            if re.search(pattern, text_lower):
                matched_skills.add(main_skill)
                break

    return sorted(list(matched_skills))


def extract_skills_with_categories(text: str) -> dict:
    """
    Extract skills grouped by category.

    Args:
        text: Input text string

    Returns:
        Dictionary with categories as keys and matched skills as values
    """
    text_lower = text.lower()
    categorized_skills = {}

    for category, skill_dict in SKILLS_DATABASE.items():
        matched = []
        for main_skill, variations in skill_dict.items():
            for variation in variations:
                pattern = r'\b' + re.escape(variation.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    matched.append(main_skill)
                    break
        if matched:
            categorized_skills[category] = sorted(matched)

    return categorized_skills


def get_skill_category(skill: str) -> str:
    """
    Get the category for a given skill.

    Args:
        skill: Skill name

    Returns:
        Category name or 'other'
    """
    skill_lower = skill.lower()
    for category, skill_dict in SKILLS_DATABASE.items():
        if skill_lower in skill_dict:
            return category
        for main_skill, variations in skill_dict.items():
            if skill_lower in [v.lower() for v in variations] or skill_lower == main_skill.lower():
                return category
    return "other"


def get_related_skills(skill: str) -> list:
    """
    Get skills related to a given skill (from same category).

    Args:
        skill: Skill name

    Returns:
        List of related skills
    """
    category = get_skill_category(skill)
    if category == "other":
        return []

    related = []
    for main_skill in SKILLS_DATABASE.get(category, {}):
        if main_skill.lower() != skill.lower():
            related.append(main_skill)

    return related[:10]  # Return top 10 related skills
