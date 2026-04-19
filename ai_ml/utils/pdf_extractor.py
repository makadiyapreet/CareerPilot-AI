"""
PDF Text Extraction Module
Uses PyMuPDF (fitz) to extract text from PDF files.
"""
import fitz
import re


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text content from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Cleaned text content as a single string
    """
    try:
        doc = fitz.open(pdf_path)
        text_content = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            text_content.append(text)

        doc.close()

        full_text = "\n".join(text_content)
        cleaned_text = clean_text(full_text)

        return cleaned_text

    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def clean_text(text: str) -> str:
    """
    Clean extracted text by removing extra whitespace and special characters.

    Args:
        text: Raw text to clean

    Returns:
        Cleaned text string
    """
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s@.+\-\(\)\/,:]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    return text
