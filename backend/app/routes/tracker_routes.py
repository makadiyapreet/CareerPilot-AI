"""
Job Tracker Routes
Handles job application tracking functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database.database import get_db
from app.models.user_model import User, JobApplication
from app.schemas.user_schema import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse
)
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/tracker", tags=["Job Tracker"])


@router.post("/applications", response_model=SuccessResponse)
async def create_application(
    application: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new job application entry.
    """
    try:
        new_app = JobApplication(
            user_id=current_user.id,
            company_name=application.company_name,
            job_title=application.job_title,
            job_url=application.job_url,
            job_description=application.job_description,
            location=application.location,
            salary_range=application.salary_range,
            status=application.status,
            notes=application.notes,
            contacts=application.contacts,
            applied_date=application.applied_date or datetime.utcnow(),
            interview_date=application.interview_date
        )

        db.add(new_app)
        db.commit()
        db.refresh(new_app)

        return SuccessResponse(
            message="Application tracked successfully",
            data=JobApplicationResponse.model_validate(new_app)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating application: {str(e)}"
        )


@router.get("/applications", response_model=SuccessResponse)
async def get_applications(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all job applications for the current user.
    """
    query = db.query(JobApplication).filter(JobApplication.user_id == current_user.id)

    if status_filter:
        query = query.filter(JobApplication.status == status_filter)

    applications = query.order_by(JobApplication.applied_date.desc()).all()

    # Calculate stats
    all_apps = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    stats = {
        "total": len(all_apps),
        "applied": sum(1 for a in all_apps if a.status == "applied"),
        "interviewing": sum(1 for a in all_apps if a.status == "interviewing"),
        "offered": sum(1 for a in all_apps if a.status == "offered"),
        "rejected": sum(1 for a in all_apps if a.status == "rejected"),
        "withdrawn": sum(1 for a in all_apps if a.status == "withdrawn")
    }

    return SuccessResponse(
        message="Applications retrieved successfully",
        data={
            "applications": [JobApplicationResponse.model_validate(app) for app in applications],
            "stats": stats
        }
    )


@router.get("/applications/{app_id}", response_model=SuccessResponse)
async def get_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific job application.
    """
    application = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    return SuccessResponse(
        message="Application retrieved successfully",
        data=JobApplicationResponse.model_validate(application)
    )


@router.put("/applications/{app_id}", response_model=SuccessResponse)
async def update_application(
    app_id: int,
    update_data: JobApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a job application.
    """
    application = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if value is not None:
            setattr(application, field, value)

    db.commit()
    db.refresh(application)

    return SuccessResponse(
        message="Application updated successfully",
        data=JobApplicationResponse.model_validate(application)
    )


@router.delete("/applications/{app_id}", response_model=SuccessResponse)
async def delete_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a job application.
    """
    application = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()

    return SuccessResponse(
        message="Application deleted successfully",
        data={"id": app_id}
    )


@router.get("/stats", response_model=SuccessResponse)
async def get_tracker_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get job application statistics.
    """
    applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).all()

    # Basic stats
    stats = {
        "total": len(applications),
        "applied": sum(1 for a in applications if a.status == "applied"),
        "interviewing": sum(1 for a in applications if a.status == "interviewing"),
        "offered": sum(1 for a in applications if a.status == "offered"),
        "rejected": sum(1 for a in applications if a.status == "rejected"),
        "withdrawn": sum(1 for a in applications if a.status == "withdrawn")
    }

    # Response rate
    responded = stats["interviewing"] + stats["offered"] + stats["rejected"]
    stats["response_rate"] = round((responded / stats["total"] * 100) if stats["total"] > 0 else 0, 1)

    # Success rate (interviews + offers)
    positive = stats["interviewing"] + stats["offered"]
    stats["success_rate"] = round((positive / stats["total"] * 100) if stats["total"] > 0 else 0, 1)

    # Applications by company (top 5)
    company_counts = {}
    for app in applications:
        company_counts[app.company_name] = company_counts.get(app.company_name, 0) + 1
    stats["top_companies"] = sorted(
        [{"name": k, "count": v} for k, v in company_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    # Recent applications
    recent = sorted(applications, key=lambda x: x.applied_date or datetime.min, reverse=True)[:5]
    stats["recent_applications"] = [
        {
            "id": a.id,
            "company": a.company_name,
            "title": a.job_title,
            "status": a.status,
            "date": a.applied_date.isoformat() if a.applied_date else None
        }
        for a in recent
    ]

    return SuccessResponse(
        message="Stats retrieved successfully",
        data=stats
    )


# Status options for frontend
JOB_STATUS_OPTIONS = [
    {"value": "applied", "label": "Applied", "color": "blue"},
    {"value": "interviewing", "label": "Interviewing", "color": "yellow"},
    {"value": "offered", "label": "Offered", "color": "green"},
    {"value": "rejected", "label": "Rejected", "color": "red"},
    {"value": "withdrawn", "label": "Withdrawn", "color": "gray"}
]


@router.get("/status-options", response_model=SuccessResponse)
async def get_status_options():
    """
    Get available status options for job applications.
    """
    return SuccessResponse(
        message="Status options retrieved",
        data={"options": JOB_STATUS_OPTIONS}
    )
