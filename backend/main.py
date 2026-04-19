"""
CareerBoost AI - FastAPI Application
Main entry point for the backend API
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import create_tables
from app.routes import (
    auth_router,
    job_router,
    resume_router,
    skill_router,
    interview_router,
    roadmap_router,
    news_router,
    tracker_router
)

# --------------- CORS Origins ---------------
# Read from env var (comma-separated) or fall back to dev defaults
_default_origins = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app = FastAPI(
    title="CareerBoost AI API",
    description="AI-powered career assistance platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(job_router)
app.include_router(resume_router)
app.include_router(skill_router)
app.include_router(interview_router)
app.include_router(roadmap_router)
app.include_router(news_router)
app.include_router(tracker_router)


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup."""
    create_tables()


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "CareerBoost AI API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
