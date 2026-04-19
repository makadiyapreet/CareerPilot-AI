"""
Resume Routes
Handles resume upload, scoring, and ATS compatibility checking
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), "../../../ai_ml"))

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.models.user_model import User
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import get_current_user
from app.services.file_service import save_resume, save_temp_file, get_resume_text, delete_file

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/score", response_model=SuccessResponse)
async def score_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """
    Score a resume against a job description.

    Returns:
    - final_score: Overall match score (0-100)
    - similarity_score: Text similarity score
    - skills_analysis: Detailed skill matching
    - keyword_analysis: Keyword match details
    - sections_analysis: Resume section quality
    - experience_analysis: Experience relevance
    - improvement_suggestions: Actionable recommendations
    """
    temp_path = None
    try:
        temp_path = save_temp_file(resume)

        resume_text = get_resume_text(temp_path)

        from resume_analyzer.resume_scorer import calculate_resume_score

        result = await asyncio.to_thread(calculate_resume_score, resume_text, job_description)

        return SuccessResponse(
            message="Resume scored successfully",
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
            detail=f"Error scoring resume: {str(e)}"
        )
    finally:
        if temp_path:
            delete_file(temp_path)


@router.post("/upload", response_model=SuccessResponse)
async def upload_resume(
    resume: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and save a resume for the current user.
    """
    try:
        if not resume.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed"
            )

        file_path = save_resume(resume, current_user.id)

        current_user.resume_path = file_path
        db.commit()

        return SuccessResponse(
            message="Resume uploaded successfully",
            data={"file_path": file_path}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading resume: {str(e)}"
        )


@router.post("/parse", response_model=SuccessResponse)
async def parse_resume(
    resume: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Parse a resume and extract information.

    Returns:
    - contact_info: Name, email, phone, LinkedIn, GitHub
    - skills: List of extracted skills
    - sections: Detected sections and their content
    - word_count: Total word count
    """
    temp_path = None
    try:
        temp_path = save_temp_file(resume)

        from resume_analyzer.resume_parser import parse_resume as ai_parse_resume

        result = await asyncio.to_thread(ai_parse_resume, temp_path)

        return SuccessResponse(
            message="Resume parsed successfully",
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
            detail=f"Error parsing resume: {str(e)}"
        )
    finally:
        if temp_path:
            delete_file(temp_path)


@router.post("/ats-check", response_model=SuccessResponse)
async def check_ats_compatibility(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Check resume for ATS compatibility.

    If job_description is provided, also checks keyword match with the job.

    Returns:
    - ats_score: Overall ATS compatibility score (0-100)
    - score_breakdown: Individual component scores
    - issues: List of issues with severity
    - suggestions: Improvement suggestions by category
    - format_check: Detailed format analysis
    - optimization_tips: Priority-ordered optimization tips
    - ats_friendly: Boolean indicating if resume is ATS-friendly
    - rating: Human-readable ATS rating
    """
    temp_path = None
    try:
        temp_path = save_temp_file(resume)

        resume_text = get_resume_text(temp_path)

        from resume_analyzer.ats_checker import check_ats_compatibility as ai_check_ats

        result = await asyncio.to_thread(ai_check_ats, resume_text, job_description)

        return SuccessResponse(
            message="ATS check completed",
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
            detail=f"Error checking ATS compatibility: {str(e)}"
        )
    finally:
        if temp_path:
            delete_file(temp_path)


@router.post("/analyze", response_model=SuccessResponse)
async def full_resume_analysis(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """
    Perform a comprehensive resume analysis.

    Combines parsing, scoring, skill gap, and ATS checking.

    Returns:
    - parse_result: Parsed resume data
    - score_result: Resume scoring against job
    - ats_result: ATS compatibility analysis
    - skill_gap: Skill gap analysis
    - recommendations: Combined recommendations
    """
    temp_path = None
    try:
        temp_path = save_temp_file(resume)

        resume_text = get_resume_text(temp_path)

        # Import all analyzers
        from resume_analyzer.resume_parser import parse_resume as ai_parse_resume
        from resume_analyzer.resume_scorer import calculate_resume_score
        from resume_analyzer.ats_checker import check_ats_compatibility as ai_check_ats
        from skill_gap.skill_gap_analyzer import analyze_skill_gap as ai_analyze_gap

        # Run all analyses
        parse_result = await asyncio.to_thread(ai_parse_resume, temp_path)
        score_result = await asyncio.to_thread(calculate_resume_score, resume_text, job_description)
        ats_result = await asyncio.to_thread(ai_check_ats, resume_text, job_description)
        skill_gap = await asyncio.to_thread(ai_analyze_gap, resume_text, job_description)

        # Calculate overall score
        overall_score = (
            score_result.get("final_score", 0) * 0.4 +
            ats_result.get("ats_score", 0) * 0.3 +
            skill_gap.get("match_percentage", 0) * 0.3
        )

        # Combine recommendations
        all_recommendations = []

        # From ATS
        for suggestion in ats_result.get("suggestions", [])[:5]:
            all_recommendations.append({
                "type": "ATS",
                "priority": suggestion.get("priority", "medium"),
                "recommendation": suggestion.get("suggestion", "")
            })

        # From skill gap
        for rec in skill_gap.get("course_recommendations", [])[:5]:
            all_recommendations.append({
                "type": "Skills",
                "priority": rec.get("priority", "medium"),
                "recommendation": f"Learn {rec.get('skill', '')}: {rec.get('resource', '')}"
            })

        # From score
        for suggestion in score_result.get("improvement_suggestions", [])[:5]:
            all_recommendations.append({
                "type": "Content",
                "priority": "medium",
                "recommendation": suggestion
            })

        return SuccessResponse(
            message="Comprehensive analysis completed",
            data={
                "overall_score": round(overall_score, 2),
                "overall_rating": get_rating(overall_score),
                "parse_result": {
                    "contact_info": parse_result.get("contact_info", {}),
                    "skills": parse_result.get("skills", []),
                    "word_count": parse_result.get("word_count", 0)
                },
                "score_result": {
                    "final_score": score_result.get("final_score", 0),
                    "skills_analysis": score_result.get("skills_analysis", {}),
                    "experience_analysis": score_result.get("experience_analysis", {})
                },
                "ats_result": {
                    "ats_score": ats_result.get("ats_score", 0),
                    "ats_friendly": ats_result.get("ats_friendly", False),
                    "issues_count": len(ats_result.get("issues", []))
                },
                "skill_gap": {
                    "match_percentage": skill_gap.get("match_percentage", 0),
                    "missing_count": len(skill_gap.get("missing_skills", [])),
                    "matched_count": len(skill_gap.get("matched_skills", []))
                },
                "recommendations": all_recommendations[:15],
                "learning_path": skill_gap.get("learning_path", [])[:7]
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
            detail=f"Error analyzing resume: {str(e)}"
        )
    finally:
        if temp_path:
            delete_file(temp_path)


def get_rating(score: float) -> str:
    """Get human-readable rating for a score."""
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 55:
        return "Fair"
    elif score >= 40:
        return "Needs Improvement"
    else:
        return "Poor"
