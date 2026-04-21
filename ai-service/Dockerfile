# ──────────────────────────────────────────────
# AI Service — Python + FastAPI + face_recognition
# NOTE: dlib compiles from source, first build takes ~15-20 min
# ──────────────────────────────────────────────
FROM python:3.11-slim

# Install system dependencies required by dlib & face_recognition
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies (dlib will compile here — this is the slow step)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
