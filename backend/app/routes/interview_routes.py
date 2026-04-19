"""
Interview Prep Routes
Handles interview question generation and answer evaluation with role dropdown
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), "../../../ai_ml"))

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.database import get_db
from app.models.user_model import User, InterviewHistory
from app.schemas.user_schema import InterviewHistoryResponse
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/interview", tags=["Interview Prep"])


# Available roles for dropdown
AVAILABLE_ROLES = [
    {"value": "data-analyst", "label": "Data Analyst", "icon": "chart-bar"},
    {"value": "data-scientist", "label": "Data Scientist", "icon": "brain"},
    {"value": "machine-learning-engineer", "label": "Machine Learning Engineer", "icon": "cpu"},
    {"value": "frontend-developer", "label": "Frontend Developer", "icon": "layout"},
    {"value": "backend-developer", "label": "Backend Developer", "icon": "server"},
    {"value": "full-stack-developer", "label": "Full Stack Developer", "icon": "layers"},
    {"value": "devops-engineer", "label": "DevOps Engineer", "icon": "cloud"},
    {"value": "software-engineer", "label": "Software Engineer", "icon": "code"},
    {"value": "cloud-engineer", "label": "Cloud Engineer", "icon": "cloud-lightning"},
    {"value": "product-manager", "label": "Product Manager", "icon": "briefcase"},
    {"value": "ai-ml-engineer", "label": "AI/ML Engineer", "icon": "zap"},
    {"value": "cybersecurity-analyst", "label": "Cybersecurity Analyst", "icon": "shield"},
    {"value": "mobile-developer", "label": "Mobile Developer", "icon": "smartphone"},
    {"value": "qa-engineer", "label": "QA Engineer", "icon": "check-circle"},
    {"value": "database-administrator", "label": "Database Administrator", "icon": "database"},
    {"value": "ui-ux-designer", "label": "UI/UX Designer", "icon": "pen-tool"},
    {"value": "systems-architect", "label": "Systems Architect", "icon": "grid"},
    {"value": "technical-lead", "label": "Technical Lead", "icon": "users"},
    {"value": "business-analyst", "label": "Business Analyst", "icon": "trending-up"},
    {"value": "data-engineer", "label": "Data Engineer", "icon": "database"}
]

# Difficulty levels
DIFFICULTY_LEVELS = [
    {"value": "Easy", "label": "Easy", "description": "Basic concepts and fundamentals"},
    {"value": "Medium", "label": "Medium", "description": "Intermediate problem-solving"},
    {"value": "Hard", "label": "Hard", "description": "Advanced scenarios and edge cases"}
]

# Question categories
QUESTION_CATEGORIES = [
    {"value": "technical", "label": "Technical", "description": "Technical skills and knowledge"},
    {"value": "behavioral", "label": "Behavioral", "description": "Soft skills and past experiences"},
    {"value": "situational", "label": "Situational", "description": "How you would handle scenarios"},
    {"value": "hr", "label": "HR/General", "description": "General and HR questions"},
    {"value": "system-design", "label": "System Design", "description": "Architecture and design questions"},
    {"value": "coding", "label": "Coding/Aptitude", "description": "Problem-solving and coding"}
]


class QuestionRequest(BaseModel):
    """Request schema for generating questions."""
    job_role: str
    difficulty: str = "Medium"
    count: int = 10
    category: Optional[str] = None


class AnswerEvaluationRequest(BaseModel):
    """Request schema for evaluating answers."""
    question: str
    user_answer: str
    job_role: Optional[str] = None
    ideal_answer: Optional[str] = None
    save_history: bool = False
    category: Optional[str] = None


class SaveHistoryRequest(BaseModel):
    """Request schema for saving interview history."""
    job_role: str
    question: str
    user_answer: str
    category: Optional[str] = None
    relevance_score: Optional[int] = None
    confidence_score: Optional[int] = None
    feedback: Optional[str] = None


@router.get("/roles", response_model=SuccessResponse)
async def get_available_roles():
    """
    Get list of available job roles for interview prep dropdown.
    """
    return SuccessResponse(
        message="Roles retrieved successfully",
        data={
            "roles": AVAILABLE_ROLES,
            "total": len(AVAILABLE_ROLES)
        }
    )


@router.get("/difficulties", response_model=SuccessResponse)
async def get_difficulty_levels():
    """
    Get list of difficulty levels.
    """
    return SuccessResponse(
        message="Difficulty levels retrieved",
        data={"levels": DIFFICULTY_LEVELS}
    )


@router.get("/categories", response_model=SuccessResponse)
async def get_question_categories():
    """
    Get list of question categories.
    """
    return SuccessResponse(
        message="Categories retrieved",
        data={"categories": QUESTION_CATEGORIES}
    )


@router.post("/questions", response_model=SuccessResponse)
async def generate_questions(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate interview questions for a specific job role.
    """
    try:
        from interview_prep.question_generator import generate_questions as ai_generate_questions

        questions = await asyncio.to_thread(
            ai_generate_questions,
            job_role=request.job_role,
            difficulty=request.difficulty,
            count=request.count
        )

        # Filter by category if specified
        if request.category and questions:
            questions = [q for q in questions if q.get("category", "").lower() == request.category.lower()]
            # If no questions match category, return all
            if not questions:
                questions = await asyncio.to_thread(
                    ai_generate_questions,
                    job_role=request.job_role,
                    difficulty=request.difficulty,
                    count=request.count
                )

        return SuccessResponse(
            message="Questions generated successfully",
            data={
                "job_role": request.job_role,
                "difficulty": request.difficulty,
                "category": request.category,
                "questions": questions,
                "total": len(questions)
            }
        )

    except ImportError as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI module not available: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating questions: {str(e)}"
        )


@router.post("/evaluate", response_model=SuccessResponse)
async def evaluate_answer(
    request: AnswerEvaluationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluate a user's answer to an interview question.
    """
    try:
        from interview_prep.answer_evaluator import evaluate_answer as ai_evaluate_answer

        result = await asyncio.to_thread(
            ai_evaluate_answer,
            question=request.question,
            user_answer=request.user_answer,
            ideal_answer=request.ideal_answer
        )

        # Save to history if requested
        if request.save_history:
            try:
                history = InterviewHistory(
                    user_id=current_user.id,
                    job_role=request.job_role or "general",
                    question=request.question,
                    user_answer=request.user_answer,
                    category=request.category,
                    relevance_score=result.get("relevance_score"),
                    confidence_score=result.get("confidence_score"),
                    feedback=result.get("feedback_text")
                )
                db.add(history)
                db.commit()
                result["saved_to_history"] = True
            except Exception:
                result["saved_to_history"] = False

        return SuccessResponse(
            message="Answer evaluated successfully",
            data=result
        )

    except ImportError as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI module not available: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error evaluating answer: {str(e)}"
        )


@router.post("/history", response_model=SuccessResponse)
async def save_interview_history(
    request: SaveHistoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save an interview practice session to history.
    """
    try:
        history = InterviewHistory(
            user_id=current_user.id,
            job_role=request.job_role,
            question=request.question,
            user_answer=request.user_answer,
            category=request.category,
            relevance_score=request.relevance_score,
            confidence_score=request.confidence_score,
            feedback=request.feedback
        )
        db.add(history)
        db.commit()
        db.refresh(history)

        return SuccessResponse(
            message="History saved successfully",
            data=InterviewHistoryResponse.model_validate(history)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error saving history: {str(e)}"
        )


@router.get("/history", response_model=SuccessResponse)
async def get_interview_history(
    job_role: Optional[str] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get interview practice history for the current user.
    """
    query = db.query(InterviewHistory).filter(InterviewHistory.user_id == current_user.id)

    if job_role:
        query = query.filter(InterviewHistory.job_role == job_role)

    history = query.order_by(InterviewHistory.created_at.desc()).limit(limit).all()

    # Calculate stats
    all_history = db.query(InterviewHistory).filter(
        InterviewHistory.user_id == current_user.id
    ).all()

    stats = {
        "total_sessions": len(all_history),
        "avg_relevance_score": sum(h.relevance_score or 0 for h in all_history) / max(len(all_history), 1),
        "avg_confidence_score": sum(h.confidence_score or 0 for h in all_history) / max(len(all_history), 1),
        "roles_practiced": list(set(h.job_role for h in all_history))
    }

    return SuccessResponse(
        message="History retrieved successfully",
        data={
            "history": [InterviewHistoryResponse.model_validate(h) for h in history],
            "stats": stats
        }
    )


@router.delete("/history/{history_id}", response_model=SuccessResponse)
async def delete_history_item(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an interview history item.
    """
    item = db.query(InterviewHistory).filter(
        InterviewHistory.id == history_id,
        InterviewHistory.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="History item not found"
        )

    db.delete(item)
    db.commit()

    return SuccessResponse(
        message="History item deleted",
        data={"id": history_id}
    )


@router.get("/tips/{role}", response_model=SuccessResponse)
async def get_interview_tips(
    role: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get interview tips for a specific role.
    """
    # General tips for all roles
    general_tips = [
        "Research the company thoroughly before the interview",
        "Prepare specific examples using the STAR method (Situation, Task, Action, Result)",
        "Practice answering questions out loud, not just in your head",
        "Prepare thoughtful questions to ask the interviewer",
        "Dress professionally and arrive 10-15 minutes early",
        "Bring copies of your resume and a notepad",
        "Follow up with a thank-you email within 24 hours"
    ]

    # Role-specific tips
    role_tips = {
        "data-analyst": [
            "Be ready to discuss SQL queries and database concepts",
            "Prepare examples of data-driven insights you've discovered",
            "Practice explaining statistical concepts in simple terms",
            "Know your visualization tools (Tableau, Power BI, etc.)",
            "Be ready to walk through a case study analysis"
        ],
        "data-scientist": [
            "Understand the difference between supervised and unsupervised learning",
            "Be ready to explain model selection and validation techniques",
            "Prepare to discuss feature engineering approaches",
            "Know how to handle imbalanced datasets",
            "Be ready to discuss production ML system considerations"
        ],
        "frontend-developer": [
            "Know CSS layout techniques (Flexbox, Grid) inside out",
            "Be ready to discuss React/Vue/Angular concepts",
            "Understand web performance optimization techniques",
            "Know accessibility (a11y) best practices",
            "Be prepared for live coding exercises"
        ],
        "backend-developer": [
            "Understand REST API design principles",
            "Be ready to discuss database design and optimization",
            "Know about authentication and security best practices",
            "Understand caching strategies",
            "Be prepared to discuss scalability considerations"
        ],
        "devops-engineer": [
            "Know CI/CD pipeline concepts thoroughly",
            "Be ready to discuss container orchestration (Kubernetes)",
            "Understand infrastructure as code (Terraform, Ansible)",
            "Know monitoring and logging best practices",
            "Be prepared to discuss incident response processes"
        ],
        "software-engineer": [
            "Review data structures and algorithms",
            "Practice system design questions",
            "Be ready to discuss your most challenging project",
            "Understand design patterns and when to use them",
            "Be prepared for coding exercises"
        ],
        "mobile-developer": [
            "Know the differences between native and cross-platform development",
            "Be ready to discuss app lifecycle and state management",
            "Understand mobile-specific UI/UX patterns",
            "Know about app store submission and guidelines",
            "Be prepared to discuss performance optimization for mobile"
        ],
        "data-engineer": [
            "Understand ETL/ELT processes and when to use each",
            "Be ready to discuss data modeling and warehousing concepts",
            "Know big data technologies (Spark, Kafka, etc.)",
            "Be prepared to discuss data quality and governance",
            "Understand real-time vs batch processing trade-offs"
        ],
        "database-administrator": [
            "Know database performance tuning techniques",
            "Be ready to discuss backup and recovery strategies",
            "Understand replication and high availability setups",
            "Know about database security best practices",
            "Be prepared to discuss migration strategies"
        ],
        "ui-ux-designer": [
            "Know the design thinking process",
            "Be ready to walk through your portfolio and design decisions",
            "Understand user research methods",
            "Know accessibility guidelines (WCAG)",
            "Be prepared to do a whiteboard design exercise"
        ],
        "qa-engineer": [
            "Know different testing methodologies (unit, integration, e2e)",
            "Be ready to discuss test automation frameworks",
            "Understand CI/CD and how testing fits in",
            "Know about performance and security testing",
            "Be prepared to write test cases on the spot"
        ],
        "technical-lead": [
            "Be ready to discuss how you mentor team members",
            "Know how to balance coding with leadership responsibilities",
            "Understand how to handle technical debt",
            "Be prepared to discuss conflict resolution",
            "Know how to drive architectural decisions"
        ],
        "systems-architect": [
            "Know common architecture patterns and their trade-offs",
            "Be ready to design systems on a whiteboard",
            "Understand CAP theorem and distributed systems",
            "Know about cloud architecture best practices",
            "Be prepared to discuss scalability and reliability"
        ],
        "business-analyst": [
            "Know requirements gathering techniques",
            "Be ready to discuss stakeholder management",
            "Understand business process modeling",
            "Know basic SQL and data analysis",
            "Be prepared to create user stories on the spot"
        ],
        "product-manager": [
            "Know how to prioritize features using frameworks",
            "Be ready to discuss product metrics and KPIs",
            "Understand agile methodologies",
            "Know how to conduct user research",
            "Be prepared for product sense questions"
        ],
        "cloud-engineer": [
            "Know major cloud services (compute, storage, networking)",
            "Be ready to discuss infrastructure as code",
            "Understand cloud security best practices",
            "Know about cost optimization strategies",
            "Be prepared to design cloud architectures"
        ],
        "ai-ml-engineer": [
            "Know ML fundamentals and common algorithms",
            "Be ready to discuss model deployment and MLOps",
            "Understand deep learning frameworks (TensorFlow, PyTorch)",
            "Know about model evaluation and monitoring",
            "Be prepared for coding exercises on ML problems"
        ],
        "cybersecurity-analyst": [
            "Know common security frameworks (NIST, ISO 27001)",
            "Be ready to discuss incident response procedures",
            "Understand vulnerability assessment and penetration testing",
            "Know about security monitoring and SIEM tools",
            "Be prepared to analyze security scenarios"
        ],
        "full-stack-developer": [
            "Know both frontend and backend technologies",
            "Be ready to discuss database design",
            "Understand deployment and DevOps basics",
            "Know about API design and integration",
            "Be prepared for full-stack coding exercises"
        ]
    }

    # Normalize role key
    role_key = role.lower().replace(" ", "-")
    specific_tips = role_tips.get(role_key, [])

    return SuccessResponse(
        message=f"Interview tips for {role}",
        data={
            "role": role,
            "general_tips": general_tips,
            "role_specific_tips": specific_tips
        }
    )
