"""
Company News Routes
Handles company information and news
"""
from fastapi import APIRouter, Depends, HTTPException

from app.models.user_model import User
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/news", tags=["Company News"])

COMPANY_DATA = {
    "Google": {
        "tech_stack": ["Python", "Java", "Go", "C++", "JavaScript", "TensorFlow", "Kubernetes", "BigQuery", "Angular", "GCP"],
        "recent_news": [
            "Google announces new AI features for Search with Gemini integration",
            "Cloud Platform expands data center presence globally",
            "New hiring initiative for ML engineers and researchers",
            "Bard AI chatbot receives major update"
        ],
        "hiring_trends": "Strong demand for ML/AI engineers, cloud architects, and full-stack developers. Focus on distributed systems expertise. Remote and hybrid options available.",
        "interview_tips": "Focus on system design, data structures, and behavioral questions. Practice coding on whiteboard. Understand Google's products and culture. Expect 4-5 rounds including phone screen, coding, system design, and Googleyness.",
        "culture": "Innovation-driven, 20% time for personal projects, collaborative environment, data-driven decisions",
        "interview_rounds": ["Phone Screen", "Technical Interview x2", "System Design", "Behavioral/Googleyness"],
        "preparation_time": "2-3 months recommended"
    },
    "Microsoft": {
        "tech_stack": ["C#", ".NET", "Azure", "TypeScript", "Python", "SQL Server", "Power Platform", "React", "Kubernetes"],
        "recent_news": [
            "Azure AI services expansion announced with OpenAI partnership",
            "GitHub Copilot enterprise features launched",
            "New cloud security features released",
            "Microsoft 365 Copilot general availability"
        ],
        "hiring_trends": "Growing teams in AI, cloud computing, and enterprise solutions. Remote work options available. Focus on inclusive hiring.",
        "interview_tips": "Prepare for coding challenges and system design. Understand Azure services. Demonstrate collaborative skills. STAR method for behavioral questions.",
        "culture": "Growth mindset, diversity and inclusion focus, work-life balance emphasis, learn-it-all culture",
        "interview_rounds": ["HR Screen", "Technical Interview x2-3", "System Design", "Hiring Manager"],
        "preparation_time": "1-2 months recommended"
    },
    "Amazon": {
        "tech_stack": ["Java", "Python", "AWS", "DynamoDB", "React", "Node.js", "Kubernetes", "TypeScript", "Go"],
        "recent_news": [
            "AWS launches new generative AI services",
            "Amazon expands same-day delivery network",
            "New sustainability initiatives announced",
            "Alexa AI capabilities enhanced"
        ],
        "hiring_trends": "High demand for software engineers, data scientists, and DevOps specialists. Leadership principles are crucial. Bar raiser interviews.",
        "interview_tips": "Master Amazon's 16 Leadership Principles. Prepare STAR format stories. Practice coding and system design. Expect LP questions in every round.",
        "culture": "Customer obsession, ownership mentality, high bar for talent, fast-paced environment",
        "interview_rounds": ["Phone Screen", "Coding x2", "System Design", "Bar Raiser", "Hiring Manager"],
        "preparation_time": "2-3 months recommended"
    },
    "Meta": {
        "tech_stack": ["React", "PHP/Hack", "Python", "C++", "GraphQL", "PyTorch", "Presto", "React Native", "Flow"],
        "recent_news": [
            "Meta AI assistant launches across platforms",
            "VR/AR Reality Labs expansion continues",
            "Threads reaches 100 million users",
            "New privacy and safety features implemented"
        ],
        "hiring_trends": "Focus on VR/AR engineers, ML researchers, and mobile developers. Emphasis on scale and performance. Bootcamp for new engineers.",
        "interview_tips": "Practice algorithmic coding extensively. Understand distributed systems. Be ready for behavioral questions about impact. Ninja and Pirate coding style.",
        "culture": "Move fast, be bold, focus on impact, open and transparent communication",
        "interview_rounds": ["Initial Screen", "Coding x2", "System Design", "Behavioral"],
        "preparation_time": "2-3 months recommended"
    },
    "Apple": {
        "tech_stack": ["Swift", "Objective-C", "Python", "C++", "Metal", "Core ML", "SwiftUI", "Combine", "UIKit"],
        "recent_news": [
            "Vision Pro spatial computing device launched",
            "iOS 18 with advanced AI features announced",
            "Apple Silicon continues performance leadership",
            "Privacy features enhanced across ecosystem"
        ],
        "hiring_trends": "Strong demand for iOS developers, ML engineers, and hardware-software integration specialists. Secrecy culture.",
        "interview_tips": "Deep knowledge of Apple ecosystem required. Focus on user experience and attention to detail. Prepare for technical design questions. NDAs are common.",
        "culture": "Secrecy, excellence in design, user-centric thinking, attention to detail",
        "interview_rounds": ["Phone Screen", "Technical x2-3", "Design Review", "Team Match"],
        "preparation_time": "2 months recommended"
    },
    "Netflix": {
        "tech_stack": ["Java", "Python", "Node.js", "React", "AWS", "Kafka", "Cassandra", "Spark", "gRPC"],
        "recent_news": [
            "New streaming technology improvements for lower bandwidth",
            "Content recommendation AI significantly enhanced",
            "Ad-supported tier expansion globally",
            "Gaming platform investment increases"
        ],
        "hiring_trends": "Looking for senior engineers with distributed systems experience. Strong focus on data and ML. High compensation packages.",
        "interview_tips": "Understand Netflix culture and freedom/responsibility model. Prepare for system design at scale. Read the Netflix Culture Deck.",
        "culture": "Freedom and responsibility, high performance, candid feedback, no vacation tracking",
        "interview_rounds": ["Recruiter Call", "Technical Screen", "Virtual Onsite x4-5"],
        "preparation_time": "1-2 months recommended"
    },
    "Spotify": {
        "tech_stack": ["Python", "Java", "JavaScript", "GCP", "Kafka", "TensorFlow", "React", "Kotlin", "Go"],
        "recent_news": [
            "AI DJ feature launches globally",
            "Podcast platform reaches new milestones",
            "New creator monetization tools",
            "Audiobook expansion continues"
        ],
        "hiring_trends": "Growing teams in ML, backend, and mobile development. Focus on audio and discovery. Squad-based agile organization.",
        "interview_tips": "Understand recommendation systems. Prepare for coding and design. Show passion for music/audio. Know the squad model.",
        "culture": "Squad-based organization, band mentality, innovation in audio, data-driven",
        "interview_rounds": ["HR Screen", "Technical x2", "System Design", "Values Interview"],
        "preparation_time": "1-2 months recommended"
    },
    "Uber": {
        "tech_stack": ["Go", "Python", "Java", "React Native", "Kafka", "MySQL", "Redis", "Cassandra", "Presto"],
        "recent_news": [
            "Uber Eats expansion to new markets",
            "Autonomous vehicle partnerships announced",
            "New driver and rider safety features",
            "Freight platform growth accelerates"
        ],
        "hiring_trends": "Demand for mobile, backend, and ML engineers. Real-time systems experience valued. Global opportunities.",
        "interview_tips": "Focus on scalable systems design. Understand ride-sharing and marketplace dynamics. Practice coding challenges. Know Uber's business model.",
        "culture": "Move fast, celebrate differences, act like owners, make big bold bets",
        "interview_rounds": ["Phone Screen", "Coding x2", "System Design", "Hiring Manager"],
        "preparation_time": "1-2 months recommended"
    },
    "Airbnb": {
        "tech_stack": ["Ruby on Rails", "React", "Java", "Python", "AWS", "MySQL", "Redis", "Kafka"],
        "recent_news": [
            "New AI-powered search features launched",
            "Experiences platform expansion",
            "Host tools and analytics improved",
            "Sustainability initiatives announced"
        ],
        "hiring_trends": "Focus on full-stack engineers, ML, and trust & safety. Design-driven culture. Emphasis on belonging.",
        "interview_tips": "Understand hospitality and marketplace dynamics. Prepare for cross-functional interviews. Show empathy and user focus.",
        "culture": "Belong anywhere, design excellence, host and guest focus, entrepreneurial spirit",
        "interview_rounds": ["Phone Screen", "Technical x2", "Cross-functional", "Core Values"],
        "preparation_time": "1-2 months recommended"
    },
    "Stripe": {
        "tech_stack": ["Ruby", "Go", "Python", "JavaScript", "React", "AWS", "PostgreSQL", "Redis", "Kafka"],
        "recent_news": [
            "New payment methods added globally",
            "Stripe Atlas expansion for startups",
            "Revenue and finance automation tools",
            "Climate initiative reaches new milestone"
        ],
        "hiring_trends": "High bar for engineers. Focus on infrastructure, payments, and developer experience. Fully remote options.",
        "interview_tips": "Deep technical knowledge required. Understand payments ecosystem. Write clean, production-ready code. Read Stripe's engineering blog.",
        "culture": "Users first, move with urgency, craft excellence, global thinking",
        "interview_rounds": ["Phone Screen", "Technical x2-3", "System Design", "Manager"],
        "preparation_time": "2-3 months recommended"
    },
    "Salesforce": {
        "tech_stack": ["Java", "Apex", "JavaScript", "Lightning", "Heroku", "AWS", "Python", "Tableau"],
        "recent_news": [
            "Einstein AI features expanded across platform",
            "Slack integration deepens",
            "Industry cloud solutions launched",
            "New sustainability cloud features"
        ],
        "hiring_trends": "Growing teams in AI, platform development, and industry solutions. Trailhead for learning. Ohana culture.",
        "interview_tips": "Understand Salesforce ecosystem and CRM concepts. Prepare for platform-specific questions. Demonstrate customer success mindset.",
        "culture": "Ohana (family), trust, customer success, innovation, equality",
        "interview_rounds": ["HR Screen", "Technical x2", "Case Study", "Hiring Manager"],
        "preparation_time": "1-2 months recommended"
    },
    "Adobe": {
        "tech_stack": ["JavaScript", "C++", "Python", "React", "Node.js", "AWS", "Java", "Machine Learning"],
        "recent_news": [
            "Firefly generative AI tools launch",
            "Creative Cloud AI features expanded",
            "Experience Cloud innovations",
            "Figma acquisition developments"
        ],
        "hiring_trends": "Focus on ML/AI, creative tools, and cloud platform engineers. Design-centric culture.",
        "interview_tips": "Understand creative professional needs. Prepare for technical depth. Show passion for creativity and design tools.",
        "culture": "Creativity for all, genuine, exceptional, innovative",
        "interview_rounds": ["Phone Screen", "Technical x2", "Design/Product", "Manager"],
        "preparation_time": "1-2 months recommended"
    },
    "Twitter/X": {
        "tech_stack": ["Scala", "Java", "Python", "React", "GraphQL", "Kafka", "Manhattan", "Go", "Rust"],
        "recent_news": [
            "Platform rebranding and feature updates",
            "New API pricing and access tiers",
            "Content moderation changes",
            "Subscription features expansion"
        ],
        "hiring_trends": "Engineers in ML, backend, and trust & safety. Real-time processing expertise valued. Dynamic environment.",
        "interview_tips": "Understand distributed systems and caching. Prepare for scale questions. Know the platform's current direction well.",
        "culture": "Impact-driven, move fast, transparent communication",
        "interview_rounds": ["Phone Screen", "Technical x2", "System Design", "Cultural"],
        "preparation_time": "1-2 months recommended"
    },
    "LinkedIn": {
        "tech_stack": ["Java", "Python", "JavaScript", "Kafka", "Ember.js", "MySQL", "Espresso", "Spark", "Samza"],
        "recent_news": [
            "AI-powered job matching improvements",
            "LinkedIn Learning expansion",
            "Professional networking tools enhanced",
            "New creator features launched"
        ],
        "hiring_trends": "Growing teams in ML, search, and enterprise solutions. Focus on professional development tools. Microsoft backing.",
        "interview_tips": "Understand professional networking domain. Prepare for system design. Demonstrate collaborative mindset and growth orientation.",
        "culture": "Members first, relationships matter, be open, act like an owner, embrace change",
        "interview_rounds": ["Phone Screen", "Technical x2", "System Design", "Hiring Manager"],
        "preparation_time": "1-2 months recommended"
    },
    "Shopify": {
        "tech_stack": ["Ruby on Rails", "React", "Go", "Python", "MySQL", "Redis", "Kafka", "GraphQL"],
        "recent_news": [
            "AI-powered commerce tools launch",
            "Checkout extensibility improvements",
            "International expansion features",
            "New merchant tools and analytics"
        ],
        "hiring_trends": "Focus on full-stack, infrastructure, and ML engineers. Remote-first culture. Merchant success focus.",
        "interview_tips": "Understand e-commerce and merchant needs. Prepare for practical coding. Show entrepreneurial mindset.",
        "culture": "Merchant obsessed, thrive on change, build for the long term, empowerment",
        "interview_rounds": ["Phone Screen", "Life Story", "Technical x2", "Team Lead"],
        "preparation_time": "1-2 months recommended"
    },
    "Databricks": {
        "tech_stack": ["Python", "Scala", "Java", "Spark", "Delta Lake", "MLflow", "SQL", "Kubernetes"],
        "recent_news": [
            "Lakehouse AI features announced",
            "Unity Catalog general availability",
            "New partnership announcements",
            "Series I funding milestone"
        ],
        "hiring_trends": "High demand for data engineers, ML platform engineers, and solutions architects. Fast-growing company.",
        "interview_tips": "Strong Spark and distributed systems knowledge. Understand data lakehouse concepts. Prepare for technical depth.",
        "culture": "Customer-centric, proactive, high quality, collaborative, continuous learning",
        "interview_rounds": ["Phone Screen", "Technical x3", "System Design", "Hiring Manager"],
        "preparation_time": "2 months recommended"
    },
    "Snowflake": {
        "tech_stack": ["Java", "C++", "Python", "SQL", "JavaScript", "React", "AWS/Azure/GCP"],
        "recent_news": [
            "Snowpark for Python enhancements",
            "Data sharing capabilities expanded",
            "AI/ML workload features",
            "Industry partnerships announced"
        ],
        "hiring_trends": "Growing teams in core database engineering, cloud platform, and sales engineering. Enterprise focus.",
        "interview_tips": "Deep database and distributed systems knowledge. Understand data warehouse concepts. Prepare for complex coding.",
        "culture": "Customer first, integrity, ownership, thoughtful execution, empowerment",
        "interview_rounds": ["Phone Screen", "Technical x3", "System Design", "Executive"],
        "preparation_time": "2-3 months recommended"
    },
    "Atlassian": {
        "tech_stack": ["Java", "Python", "JavaScript", "React", "Node.js", "AWS", "PostgreSQL", "Kotlin"],
        "recent_news": [
            "AI features across Jira and Confluence",
            "Cloud migration milestone reached",
            "New team collaboration tools",
            "Forge platform expansion"
        ],
        "hiring_trends": "Focus on cloud platform, AI, and collaboration features. Distributed teams across globe.",
        "interview_tips": "Understand collaboration software needs. Prepare for behavioral questions. Show teamwork and communication skills.",
        "culture": "Open company, build with heart and balance, don't #$%@ the customer",
        "interview_rounds": ["Phone Screen", "Technical x2", "Values Interview", "Hiring Manager"],
        "preparation_time": "1-2 months recommended"
    },
    "Nvidia": {
        "tech_stack": ["C++", "CUDA", "Python", "C", "TensorRT", "PyTorch", "Linux", "Assembly"],
        "recent_news": [
            "New GPU architecture announcement",
            "AI enterprise platform expansion",
            "Automotive AI partnerships",
            "Data center revenue growth"
        ],
        "hiring_trends": "High demand for GPU, AI/ML, and systems engineers. Deep technical expertise required. Hardware-software intersection.",
        "interview_tips": "Strong computer architecture and systems knowledge. Understand GPU programming. Prepare for low-level technical questions.",
        "culture": "Innovation, technical excellence, speed, one team",
        "interview_rounds": ["Phone Screen", "Technical x3-4", "Coding Deep Dive", "Manager"],
        "preparation_time": "2-3 months recommended"
    },
    "Oracle": {
        "tech_stack": ["Java", "SQL", "PL/SQL", "JavaScript", "Python", "OCI", "Kubernetes", "Linux"],
        "recent_news": [
            "OCI infrastructure expansion",
            "MySQL HeatWave enhancements",
            "Healthcare cloud solutions",
            "AI integration across products"
        ],
        "hiring_trends": "Focus on cloud infrastructure, database, and enterprise applications. Traditional tech with cloud transformation.",
        "interview_tips": "Database and SQL expertise important. Understand enterprise software. Prepare for technical and behavioral rounds.",
        "culture": "Customer success, innovation, global perspective, integrity",
        "interview_rounds": ["HR Screen", "Technical x2-3", "Manager", "Skip Level"],
        "preparation_time": "1-2 months recommended"
    }
}


@router.get("/company", response_model=SuccessResponse)
async def get_company_news(
    name: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get company information, tech stack, news, and interview tips.
    """
    company_name = None
    for key in COMPANY_DATA.keys():
        if key.lower() == name.lower():
            company_name = key
            break

    if not company_name:
        available = list(COMPANY_DATA.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Company not found. Available companies: {', '.join(available)}"
        )

    company_info = COMPANY_DATA[company_name]

    return SuccessResponse(
        message=f"Company information for {company_name}",
        data={
            "company_name": company_name,
            **company_info
        }
    )


@router.get("/companies", response_model=SuccessResponse)
async def list_companies(
    current_user: User = Depends(get_current_user)
):
    """
    Get list of all available companies.
    """
    companies_summary = []
    for name, data in COMPANY_DATA.items():
        companies_summary.append({
            "name": name,
            "tech_stack_preview": data["tech_stack"][:5],
            "hiring_trends": data["hiring_trends"][:100] + "..."
        })

    return SuccessResponse(
        message="Available companies",
        data={
            "companies": list(COMPANY_DATA.keys()),
            "total": len(COMPANY_DATA),
            "summary": companies_summary
        }
    )


@router.get("/company/{name}/interview", response_model=SuccessResponse)
async def get_interview_info(
    name: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed interview information for a company.
    """
    company_name = None
    for key in COMPANY_DATA.keys():
        if key.lower() == name.lower():
            company_name = key
            break

    if not company_name:
        raise HTTPException(status_code=404, detail="Company not found")

    company_info = COMPANY_DATA[company_name]

    return SuccessResponse(
        message=f"Interview information for {company_name}",
        data={
            "company_name": company_name,
            "interview_tips": company_info["interview_tips"],
            "interview_rounds": company_info.get("interview_rounds", []),
            "preparation_time": company_info.get("preparation_time", "1-2 months"),
            "culture": company_info.get("culture", "")
        }
    )
