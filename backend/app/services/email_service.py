"""
Email Service
Handles OTP generation and email sending for verification
"""
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional


# Store OTPs in memory (in production, use Redis or database)
otp_store = {}
# Store verified emails temporarily (valid for 30 minutes after verification)
verified_emails = {}


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP of specified length."""
    return ''.join(random.choices(string.digits, k=length))


def store_otp(email: str, otp: str, expiry_minutes: int = 10) -> None:
    """Store OTP with expiry time."""
    otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=expiry_minutes),
        "attempts": 0
    }


def is_email_verified(email: str) -> bool:
    """Check if email was recently verified."""
    if email in verified_emails:
        if datetime.utcnow() < verified_emails[email]:
            return True
        else:
            del verified_emails[email]
    return False


def mark_email_verified(email: str, valid_minutes: int = 30) -> None:
    """Mark email as verified for a period of time."""
    verified_emails[email] = datetime.utcnow() + timedelta(minutes=valid_minutes)


def clear_verified_email(email: str) -> None:
    """Clear verified status after signup."""
    if email in verified_emails:
        del verified_emails[email]


def verify_otp(email: str, otp: str) -> tuple:
    """
    Verify OTP for email.
    Returns (success, message)
    """
    if email not in otp_store:
        # Check if already verified
        if is_email_verified(email):
            return True, "Email already verified!"
        return False, "No OTP found for this email. Please request a new one."

    stored = otp_store[email]

    # Check expiry
    if datetime.utcnow() > stored["expires_at"]:
        del otp_store[email]
        return False, "OTP has expired. Please request a new one."

    # Check attempts
    if stored["attempts"] >= 3:
        del otp_store[email]
        return False, "Too many failed attempts. Please request a new OTP."

    # Verify OTP
    if stored["otp"] != otp:
        otp_store[email]["attempts"] += 1
        remaining = 3 - otp_store[email]["attempts"]
        return False, f"Invalid OTP. {remaining} attempts remaining."

    # Success - remove OTP and mark as verified
    del otp_store[email]
    mark_email_verified(email)
    return True, "Email verified successfully!"


def send_otp_email(email: str, otp: str, name: str = "User") -> bool:
    """
    Send OTP email using SMTP.

    Configure these environment variables:
    - SMTP_HOST: SMTP server hostname
    - SMTP_PORT: SMTP server port
    - SMTP_USER: SMTP username/email
    - SMTP_PASSWORD: SMTP password
    - SMTP_FROM_EMAIL: From email address
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)

    # If SMTP not configured, print OTP to console (for development)
    if not smtp_user or not smtp_password:
        print(f"\n{'='*50}")
        print(f"OTP for {email}: {otp}")
        print(f"{'='*50}\n")
        return True

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "CareerBoost AI - Email Verification OTP"
        msg["From"] = from_email
        msg["To"] = email

        # Plain text version
        text = f"""
Hello {name},

Your verification code for CareerBoost AI is: {otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
CareerBoost AI Team
        """

        # HTML version
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .otp-box {{ background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }}
        .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CareerBoost AI</h1>
            <p>Email Verification</p>
        </div>
        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>
            <p>Your verification code is:</p>
            <div class="otp-box">
                <span class="otp-code">{otp}</span>
            </div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 CareerBoost AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, email, msg.as_string())

        return True

    except Exception as e:
        print(f"Error sending email: {e}")
        # Fallback: print OTP to console
        print(f"\n{'='*50}")
        print(f"OTP for {email}: {otp}")
        print(f"{'='*50}\n")
        return True  # Return True so signup can continue


def send_welcome_email(email: str, name: str) -> bool:
    """Send welcome email after successful verification."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)

    if not smtp_user or not smtp_password:
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to CareerBoost AI!"
        msg["From"] = from_email
        msg["To"] = email

        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
        .cta {{ background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to CareerBoost AI!</h1>
        </div>
        <div class="content">
            <p>Hi <strong>{name}</strong>,</p>
            <p>Thank you for joining CareerBoost AI! Your account is now verified and ready to use.</p>

            <h3>Here's what you can do:</h3>
            <div class="feature">📄 <strong>Resume Scoring</strong> - Get instant feedback on your resume</div>
            <div class="feature">🎯 <strong>Skill Gap Analysis</strong> - Identify skills you need to learn</div>
            <div class="feature">🗺️ <strong>Learning Roadmaps</strong> - Get personalized career paths</div>
            <div class="feature">💼 <strong>Interview Prep</strong> - Practice with AI-generated questions</div>
            <div class="feature">🏢 <strong>Company Insights</strong> - Research companies before interviews</div>

            <p>Start your career journey today!</p>
        </div>
    </div>
</body>
</html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, email, msg.as_string())

        return True
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return False


def send_password_reset_email(email: str, otp: str, name: str = "User") -> bool:
    """Send password reset OTP email."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)

    if not smtp_user or not smtp_password:
        print(f"\n{'='*50}")
        print(f"Password Reset OTP for {email}: {otp}")
        print(f"{'='*50}\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "CareerBoost AI - Password Reset"
        msg["From"] = from_email
        msg["To"] = email

        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .otp-box {{ background: white; border: 2px dashed #dc3545; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 5px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>
            <p>We received a request to reset your password. Use this code to verify:</p>
            <div class="otp-box">
                <span class="otp-code">{otp}</span>
            </div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
    </div>
</body>
</html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, email, msg.as_string())

        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        print(f"\n{'='*50}")
        print(f"Password Reset OTP for {email}: {otp}")
        print(f"{'='*50}\n")
        return True
