"""
Skill Gap Routes
Handles skill gap analysis with detailed recommendations
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), "../../../ai_ml"))

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional

from app.models.user_model import User
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import get_current_user
from app.services.file_service import save_temp_file, get_resume_text, delete_file

router = APIRouter(prefix="/skills", tags=["Skill Gap"])


class SkillAnalysisRequest(BaseModel):
    """Request schema for skill analysis."""
    skills: List[str]


@router.post("/gap", response_model=SuccessResponse)
async def analyze_skill_gap(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    target_role: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze skill gap between resume and job description.

    Returns:
    - matched_skills: Skills found in both
    - missing_skills: Skills to learn with priority and resources
    - learning_path: Optimal order to learn missing skills
    - course_recommendations: Top courses for each skill
    - certifications_suggested: Relevant certifications
    """
    temp_path = None
    try:
        temp_path = save_temp_file(resume)

        resume_text = get_resume_text(temp_path)

        from skill_gap.skill_gap_analyzer import analyze_skill_gap as ai_analyze_gap

        result = await asyncio.to_thread(ai_analyze_gap, resume_text, job_description, target_role)

        return SuccessResponse(
            message="Skill gap analysis completed",
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
            detail=f"Error analyzing skill gap: {str(e)}"
        )
    finally:
        if temp_path:
            delete_file(temp_path)


@router.post("/analyze", response_model=SuccessResponse)
async def quick_skill_analysis(
    request: SkillAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Quick analysis of a list of skills.

    Returns skill breakdown by level, category, and learning time.
    """
    try:
        from skill_gap.skill_gap_analyzer import quick_skill_analysis as ai_analyze

        result = await asyncio.to_thread(ai_analyze, request.skills)

        return SuccessResponse(
            message="Skill analysis completed",
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
            detail=f"Error analyzing skills: {str(e)}"
        )


@router.get("/resources/{skill}", response_model=SuccessResponse)
async def get_skill_resources(
    skill: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get learning resources for a specific skill.

    Returns courses, tutorials, books, and certifications.
    """
    try:
        from skill_gap.skill_gap_analyzer import (
            get_skill_learning_resources,
            get_skill_prerequisites,
            get_related_skills
        )

        resources = await asyncio.to_thread(get_skill_learning_resources, skill)
        prerequisites = await asyncio.to_thread(get_skill_prerequisites, skill)
        related = await asyncio.to_thread(get_related_skills, skill)

        return SuccessResponse(
            message=f"Resources for {skill}",
            data={
                "skill": skill,
                "resources": resources,
                "prerequisites": prerequisites,
                "related_skills": related
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
            detail=f"Error getting skill resources: {str(e)}"
        )


@router.get("/taxonomy", response_model=SuccessResponse)
async def get_skill_taxonomy(
    current_user: User = Depends(get_current_user)
):
    """
    Get the full skill taxonomy with categories and levels.
    """
    try:
        from skill_gap.skill_gap_analyzer import load_taxonomy

        taxonomy = await asyncio.to_thread(load_taxonomy)

        # Organize by category
        by_category = {}
        for skill, data in taxonomy.items():
            category = data.get("category", "general")
            if category not in by_category:
                by_category[category] = []
            by_category[category].append({
                "skill": skill,
                "level": data.get("level", "intermediate"),
                "importance": data.get("importance", "medium")
            })

        return SuccessResponse(
            message="Skill taxonomy retrieved",
            data={
                "total_skills": len(taxonomy),
                "categories": list(by_category.keys()),
                "skills_by_category": by_category
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
            detail=f"Error loading taxonomy: {str(e)}"
        )
