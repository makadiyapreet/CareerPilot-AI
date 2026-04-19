"""
Response Schemas
Standard response formats for API endpoints
"""
from typing import Any, Optional
from pydantic import BaseModel


class SuccessResponse(BaseModel):
    """Standard success response."""
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    message: str
    detail: Optional[str] = None
