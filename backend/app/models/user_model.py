"""
User Model
SQLAlchemy ORM model for users table
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from app.database.database import Base


class User(Base):
    """User model for storing user information."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    college = Column(String(150), nullable=True)
    degree = Column(String(50), nullable=True)
    branch = Column(String(100), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    interested_role = Column(String(100), nullable=True)
    skills = Column(Text, nullable=True)
    experience_level = Column(String(20), nullable=True)
    resume_path = Column(String(300), nullable=True)

    # Email verification
    is_verified = Column(Boolean, default=False)

    # Profile enhancements
    linkedin_url = Column(String(200), nullable=True)
    github_url = Column(String(200), nullable=True)
    portfolio_url = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)
    profile_picture = Column(String(300), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class JobApplication(Base):
    """Model for tracking job applications."""

    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)

    # Job details
    company_name = Column(String(150), nullable=False)
    job_title = Column(String(150), nullable=False)
    job_url = Column(String(500), nullable=True)
    job_description = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    salary_range = Column(String(50), nullable=True)

    # Application status
    status = Column(String(30), default="applied")  # applied, interviewing, offered, rejected, withdrawn
    applied_date = Column(DateTime, default=datetime.utcnow)
    interview_date = Column(DateTime, nullable=True)
    response_date = Column(DateTime, nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
    contacts = Column(Text, nullable=True)  # JSON string of contact persons

    # Resume used
    resume_version = Column(String(300), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<JobApplication(id={self.id}, company={self.company_name}, title={self.job_title})>"


class SavedResume(Base):
    """Model for storing user's saved resumes/templates."""

    __tablename__ = "saved_resumes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)

    name = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)  # JSON content
    template_type = Column(String(50), default="modern")
    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<SavedResume(id={self.id}, name={self.name})>"


class InterviewHistory(Base):
    """Model for saving interview practice history."""

    __tablename__ = "interview_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)

    job_role = Column(String(100), nullable=False)
    question = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)

    relevance_score = Column(Integer, nullable=True)
    confidence_score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<InterviewHistory(id={self.id}, role={self.job_role})>"
