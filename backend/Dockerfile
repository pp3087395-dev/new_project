# Multi-stage / lightweight python slim base
FROM python:3.11-slim

# Prevent python from buffering stdout/stderr and writing bytecode
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/cache/huggingface \
    PORT=7860 \
    CLASSIFIER_BACKEND=smaug \
    SMAUG_CROPS=1

# Install system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy pinned requirements first to maximize layer caching
COPY requirements.txt .

# Install dependencies using CPU-only PyTorch extra index URL to avoid 2GB+ CUDA bloat
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Pre-download the model (~1GB) at build time into $HF_HOME inside the image.
# This prevents downloading 1GB on every cold start / container restart.
RUN python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='abacusai/Smaug-AI-Image-Detector')"

# Copy application source code
COPY app /app/app

# Hugging Face Spaces standard port is 7860; Render passes dynamic $PORT
EXPOSE 7860

# Run Uvicorn on 0.0.0.0 listening on $PORT with fallback to 7860
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
