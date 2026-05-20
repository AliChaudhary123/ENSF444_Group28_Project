# Backend container for the Calgary Crime Forecast API (FastAPI + scikit-learn).
#
# IMPORTANT: the build context is the REPO ROOT, not backend/, so the image can
# bake in the trained models from ml/models. render.yaml wires this up via:
#   dockerfilePath: backend/Dockerfile
#   dockerContext: .
# To build locally from the repo root:
#   docker build -f backend/Dockerfile -t crime-api .
#   docker run --rm -p 8000:8000 crime-api

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install Python deps first so this layer is cached across code changes.
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# App code + the trained models the predictor loads at startup.
COPY backend/app ./app
COPY ml/models ./models

# config.py reads MODEL_DIR; point it at the baked-in models directory.
ENV MODEL_DIR=/app/models

# Render (and most hosts) inject $PORT at runtime; default to 8000 for local runs.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
