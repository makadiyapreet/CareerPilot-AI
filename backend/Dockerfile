# ============================================
# CareerPilot AI — Backend Dockerfile
# ============================================
FROM python:3.11-slim

# System deps for NLP & PDF processing
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (leverages Docker layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLP models
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('omw-1.4')"

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 8000

# Run with uvicorn — bind to 0.0.0.0 for Docker networking
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
