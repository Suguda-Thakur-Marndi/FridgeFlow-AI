# ==============================================================================
# FridgeFlow AI — Production Dockerfile for FastAPI Vision & Culinary Backend
# Base Image: Official Python 3.11 Slim (Debian Bookworm)
# Target Deployment: Render (Web Service, Singapore Region)
# ==============================================================================

FROM python:3.11-slim

# Set container working directory
WORKDIR /app

# Ensure Python output is sent straight to terminal (unbuffered)
# and prevent creation of .pyc bytecode files
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    PYTHONPATH=/app

# Install minimal OS runtime dependencies (curl & ca-certificates for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root user and group for security defense-in-depth
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup --no-create-home appuser

# Leverage Docker layer caching: Copy requirements.txt first
# When Render root directory is 'backend', context root is the backend folder
COPY requirements.txt /app/backend/requirements.txt

# Install dependencies directly into system Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application source code and tests into /app/backend
COPY . /app/backend/

# Assign ownership of /app to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose default port (overridden dynamically by Render at runtime via $PORT)
EXPOSE 8000

# Container-level health check verifying the /health endpoint using standard library urllib
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request, os; port = os.getenv('PORT', '8000'); urllib.request.urlopen(f'http://127.0.0.1:{port}/health')" || exit 1

# Start Uvicorn bound to 0.0.0.0 and dynamic $PORT injected by Render (falls back to 8000)
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
