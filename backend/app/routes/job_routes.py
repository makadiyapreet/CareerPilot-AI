"""
Job Analyzer Routes
Handles job description analysis
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), "../../../ai_ml"))

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.models.user_model import User
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/job", tags=["Job Analyzer"])


class JobAnalyzeRequest(BaseModel):
    """Request schema for job analysis."""
    job_description: str


@router.post("/analyze", response_model=SuccessResponse)
async def analyze_job(
    request: JobAnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze a job description and extract key information.
    """
    try:
        from job_analyzer.job_analyzer import analyze_job as ai_analyze_job

        result = await asyncio.to_thread(ai_analyze_job, request.job_description)

        return SuccessResponse(
            message="Job description analyzed successfully",
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
            detail=f"Error analyzing job description: {str(e)}"
        )
