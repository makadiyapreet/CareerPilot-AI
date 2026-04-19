"""
File Service
Handles file uploads and PDF text extraction
"""
import os
import time
from typing import Optional

import fitz
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads/")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def save_resume(file: UploadFile, user_id: int) -> str:
    """
    Save an uploaded resume file.

    Args:
        file: Uploaded file object
        user_id: ID of the user uploading the file

    Returns:
        Path to the saved file
    """
    timestamp = int(time.time())
    filename = f"resume_{user_id}_{timestamp}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)

    file.file.seek(0)

    return file_path


def save_temp_file(file: UploadFile) -> str:
    """
    Save a file temporarily for processing.

    Args:
        file: Uploaded file object

    Returns:
        Path to the saved file
    """
    timestamp = int(time.time())
    filename = f"temp_{timestamp}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)

    file.file.seek(0)

    return file_path


def get_resume_text(file_path: str) -> str:
    """
    Extract text from a PDF file using PyMuPDF.

    Args:
        file_path: Path to the PDF file

    Returns:
        Extracted text as a string
    """
    try:
        doc = fitz.open(file_path)
        text = ""

        for page in doc:
            text += page.get_text()

        doc.close()

        text = clean_text(text)

        return text

    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def clean_text(text: str) -> str:
    """
    Clean extracted text by removing extra whitespace and special characters.

    Args:
        text: Raw extracted text

    Returns:
        Cleaned text
    """
    import re

    text = re.sub(r'\s+', ' ', text)

    text = text.strip()

    text = re.sub(r'[^\w\s\.\,\:\;\-\_\@\#\$\%\&\*\(\)\[\]\{\}\+\=\/\\\'\"]+', ' ', text)

    return text


def delete_file(file_path: str) -> bool:
    """
    Delete a file from the filesystem.

    Args:
        file_path: Path to the file to delete

    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False


def get_file_size(file_path: str) -> Optional[int]:
    """
    Get the size of a file in bytes.

    Args:
        file_path: Path to the file

    Returns:
        File size in bytes, or None if file doesn't exist
    """
    try:
        return os.path.getsize(file_path)
    except Exception:
        return None
