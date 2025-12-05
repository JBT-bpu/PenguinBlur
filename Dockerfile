# Multi-stage Dockerfile for PenguinBlur - Cloud Native Deployment
# Builds React frontend and serves with Python backend in a single container
# Google Cloud Run compatible - exposes PORT 8080

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install all frontend dependencies (including TypeScript for build)
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build React app for production
RUN npm run build

# Remove dev dependencies to keep production image lean
RUN npm prune --production

# Stage 2: Production Runtime
FROM python:3.9-slim AS runtime

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# Install system dependencies for video processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libglib2.0-0 \
    libgl1-mesa-glx \
    libgomp1 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist ./static

# Create necessary directories
RUN mkdir -p ./uploads ./temp ./logs

# Set permissions
RUN chmod +x ./src/server.ts

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash penguin && \
    chown -R penguin:penguin /app
USER penguin

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port 8080 for Google Cloud Run
EXPOSE 8080

# Start the application
CMD ["python", "-m", "uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8080"]
