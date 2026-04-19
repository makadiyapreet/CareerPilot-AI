"""
Roadmap Routes
Handles learning roadmap generation with detailed steps and resources
"""
import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), "../../../ai_ml"))

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.models.user_model import User
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])


class RoadmapRequest(BaseModel):
    """Request schema for generating roadmap."""
    target_role: str
    missing_skills: Optional[List[str]] = None
    experience_level: Optional[str] = "beginner"


class RoleCompareRequest(BaseModel):
    """Request schema for comparing roles."""
    roles: List[str]


@router.post("/generate", response_model=SuccessResponse)
async def generate_roadmap(
    request: RoadmapRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a personalized learning roadmap.

    Returns:
    - target_role: Matched role name
    - description: Role description
    - salary_range: Expected salary range
    - steps: Detailed learning steps with resources
    - total_estimated_weeks: Total duration
    - experience_level: Adjusted for user's level
    """
    try:
        from roadmap_generator.roadmap_generator import generate_roadmap as ai_generate_roadmap

        result = await asyncio.to_thread(
            ai_generate_roadmap,
            target_role=request.target_role,
            missing_skills=request.missing_skills or [],
            experience_level=request.experience_level or "beginner"
        )

        if not result.get("steps"):
            # Return available roles if no match
            from roadmap_generator.roadmap_generator import get_available_roles
            available = get_available_roles()
            result["available_roles"] = [r["name"] if isinstance(r, dict) else r for r in available]

        return SuccessResponse(
            message="Roadmap generated successfully",
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
            detail=f"Error generating roadmap: {str(e)}"
        )


@router.get("/roles", response_model=SuccessResponse)
async def get_available_roles(
    current_user: User = Depends(get_current_user)
):
    """
    Get list of available target roles with metadata.

    Returns role name, description, salary range, and duration.
    """
    try:
        from roadmap_generator.roadmap_generator import get_available_roles as ai_get_roles

        roles = await asyncio.to_thread(ai_get_roles)

        return SuccessResponse(
            message="Available roles retrieved",
            data={
                "roles": roles,
                "total_roles": len(roles)
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
            detail=f"Error retrieving roles: {str(e)}"
        )


@router.get("/preview/{role}", response_model=SuccessResponse)
async def get_roadmap_preview(
    role: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a preview of a roadmap without full details.

    Returns total steps, duration, and key skills.
    """
    try:
        from roadmap_generator.roadmap_generator import get_roadmap_preview as ai_preview

        result = await asyncio.to_thread(ai_preview, role)

        if not result.get("available"):
            from roadmap_generator.roadmap_generator import get_available_roles
            available = get_available_roles()
            result["available_roles"] = [r["name"] if isinstance(r, dict) else r for r in available]

        return SuccessResponse(
            message=f"Preview for {role}",
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
            detail=f"Error getting preview: {str(e)}"
        )


@router.post("/compare", response_model=SuccessResponse)
async def compare_roles(
    request: RoleCompareRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Compare multiple roles side by side.

    Returns comparison data including salary, duration, and key skills.
    """
    try:
        from roadmap_generator.roadmap_generator import get_role_comparison

        result = await asyncio.to_thread(get_role_comparison, request.roles)

        return SuccessResponse(
            message="Role comparison completed",
            data={
                "comparisons": result,
                "roles_compared": len(result)
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
            detail=f"Error comparing roles: {str(e)}"
        )


@router.get("/related/{role}", response_model=SuccessResponse)
async def get_related_roles(
    role: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get related roles based on skill overlap.

    Returns roles with similar skill requirements.
    """
    try:
        from roadmap_generator.roadmap_generator import suggest_related_roles

        related = await asyncio.to_thread(suggest_related_roles, role)

        return SuccessResponse(
            message=f"Related roles for {role}",
            data={
                "target_role": role,
                "related_roles": related
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
            detail=f"Error finding related roles: {str(e)}"
        )
