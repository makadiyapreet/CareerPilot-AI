"""
User Schemas
Pydantic models for request/response validation
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserSignup(BaseModel):
    """Schema for user registration."""
    name: str
    email: EmailStr
    password: str
    otp: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    interested_role: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response data."""
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    interested_role: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None
    resume_path: Optional[str] = None
    is_verified: Optional[bool] = False
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    interested_role: Optional[str] = None
    skills: Optional[str] = None
    experience_level: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Job Application Schemas
class JobApplicationCreate(BaseModel):
    """Schema for creating a job application."""
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: str = "applied"
    notes: Optional[str] = None
    contacts: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None


class JobApplicationUpdate(BaseModel):
    """Schema for updating a job application."""
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    contacts: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    response_date: Optional[datetime] = None


class JobApplicationResponse(BaseModel):
    """Schema for job application response."""
    id: int
    user_id: int
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: str
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    response_date: Optional[datetime] = None
    notes: Optional[str] = None
    contacts: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Resume Builder Schemas
class ResumeSection(BaseModel):
    """Schema for a resume section."""
    title: str
    content: str


class ResumeCreate(BaseModel):
    """Schema for creating a saved resume."""
    name: str
    content: str  # JSON string
    template_type: str = "modern"
    is_default: bool = False


class ResumeResponse(BaseModel):
    """Schema for saved resume response."""
    id: int
    user_id: int
    name: str
    content: str
    template_type: str
    is_default: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Interview History Schemas
class InterviewHistoryCreate(BaseModel):
    """Schema for creating interview history."""
    job_role: str
    question: str
    user_answer: Optional[str] = None
    category: Optional[str] = None
    relevance_score: Optional[int] = None
    confidence_score: Optional[int] = None
    feedback: Optional[str] = None


class InterviewHistoryResponse(BaseModel):
    """Schema for interview history response."""
    id: int
    user_id: int
    job_role: str
    question: str
    user_answer: Optional[str] = None
    category: Optional[str] = None
    relevance_score: Optional[int] = None
    confidence_score: Optional[int] = None
    feedback: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
