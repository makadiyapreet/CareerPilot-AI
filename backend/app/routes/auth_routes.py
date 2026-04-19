"""
Authentication Routes
Handles user signup, login, OTP verification, and profile management
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.database.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserSignup, UserLogin, UserResponse, UserUpdate, TokenResponse
from app.schemas.response_schema import SuccessResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.services.file_service import save_resume
from app.services.email_service import (
    generate_otp,
    store_otp,
    verify_otp,
    is_email_verified,
    clear_verified_email,
    send_otp_email,
    send_welcome_email,
    send_password_reset_email
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class OTPRequest(BaseModel):
    """Schema for OTP request."""
    email: EmailStr


class OTPVerifyRequest(BaseModel):
    """Schema for OTP verification."""
    email: EmailStr
    otp: str


class PasswordResetRequest(BaseModel):
    """Schema for password reset."""
    email: EmailStr
    otp: str
    new_password: str


@router.post("/send-otp", response_model=SuccessResponse)
async def send_signup_otp(
    request: OTPRequest,
    db: Session = Depends(get_db)
):
    """
    Send OTP to email for verification during signup.
    """
    # Check if email already exists and is verified
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        is_verified = getattr(existing_user, 'is_verified', True)
        if is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Generate and store OTP
    otp = generate_otp()
    store_otp(request.email, otp)

    # Send OTP email
    send_otp_email(request.email, otp)

    return SuccessResponse(
        message="OTP sent successfully to your email",
        data={"email": request.email}
    )


@router.post("/verify-otp", response_model=SuccessResponse)
async def verify_email_otp(
    request: OTPVerifyRequest
):
    """
    Verify OTP sent to email.
    """
    success, message = verify_otp(request.email, request.otp)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

    return SuccessResponse(
        message=message,
        data={"email": request.email, "verified": True}
    )


@router.post("/signup", response_model=SuccessResponse)
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    otp: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    college: Optional[str] = Form(None),
    degree: Optional[str] = Form(None),
    branch: Optional[str] = Form(None),
    graduation_year: Optional[int] = Form(None),
    interested_role: Optional[str] = Form(None),
    skills: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Register a new user account with optional OTP verification.
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check verification status
    is_verified = False

    # First check if email was already verified via /verify-otp endpoint
    if is_email_verified(email):
        is_verified = True
        clear_verified_email(email)  # Clear after use
    # Or verify OTP now if provided
    elif otp:
        success, message = verify_otp(email, otp)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        is_verified = True

    hashed_pwd = hash_password(password)

    new_user = User(
        name=name,
        email=email,
        hashed_password=hashed_pwd,
        phone=phone,
        college=college,
        degree=degree,
        branch=branch,
        graduation_year=graduation_year,
        interested_role=interested_role,
        skills=skills,
        experience_level=experience_level,
        is_verified=is_verified
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if resume:
        file_path = save_resume(resume, new_user.id)
        new_user.resume_path = file_path
        db.commit()

    # Send welcome email if verified
    if is_verified:
        send_welcome_email(email, name)

    return SuccessResponse(
        message="Account created successfully",
        data={"user_id": new_user.id, "email": new_user.email, "is_verified": is_verified}
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    """
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )

    access_token = create_access_token(data={"sub": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/forgot-password", response_model=SuccessResponse)
async def forgot_password(
    request: OTPRequest,
    db: Session = Depends(get_db)
):
    """
    Send password reset OTP to email.
    """
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        # Return success even if email not found (security)
        return SuccessResponse(
            message="If your email exists, you will receive a password reset code",
            data={"email": request.email}
        )

    otp = generate_otp()
    store_otp(request.email, otp)
    send_password_reset_email(request.email, otp, user.name)

    return SuccessResponse(
        message="If your email exists, you will receive a password reset code",
        data={"email": request.email}
    )


@router.post("/reset-password", response_model=SuccessResponse)
async def reset_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using OTP.
    """
    # Verify OTP
    success, message = verify_otp(request.email, request.otp)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update password
    user.hashed_password = hash_password(request.new_password)
    db.commit()

    return SuccessResponse(
        message="Password reset successfully. Please login with your new password.",
        data={"email": request.email}
    )


@router.get("/me", response_model=SuccessResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user's information.
    """
    return SuccessResponse(
        message="User retrieved successfully",
        data=UserResponse.model_validate(current_user)
    )


@router.put("/profile", response_model=SuccessResponse)
async def update_profile(
    name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    college: Optional[str] = Form(None),
    degree: Optional[str] = Form(None),
    branch: Optional[str] = Form(None),
    graduation_year: Optional[int] = Form(None),
    interested_role: Optional[str] = Form(None),
    skills: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    portfolio_url: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    """
    if name is not None:
        current_user.name = name
    if phone is not None:
        current_user.phone = phone
    if college is not None:
        current_user.college = college
    if degree is not None:
        current_user.degree = degree
    if branch is not None:
        current_user.branch = branch
    if graduation_year is not None:
        current_user.graduation_year = graduation_year
    if interested_role is not None:
        current_user.interested_role = interested_role
    if skills is not None:
        current_user.skills = skills
    if experience_level is not None:
        current_user.experience_level = experience_level
    if linkedin_url is not None:
        current_user.linkedin_url = linkedin_url
    if github_url is not None:
        current_user.github_url = github_url
    if portfolio_url is not None:
        current_user.portfolio_url = portfolio_url
    if bio is not None:
        current_user.bio = bio

    db.commit()
    db.refresh(current_user)

    return SuccessResponse(
        message="Profile updated successfully",
        data=UserResponse.model_validate(current_user)
    )


@router.post("/change-password", response_model=SuccessResponse)
async def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change password for authenticated user.
    """
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    current_user.hashed_password = hash_password(new_password)
    db.commit()

    return SuccessResponse(
        message="Password changed successfully",
        data={}
    )
