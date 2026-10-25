import os
import sys
import threading
import logging
from contextlib import asynccontextmanager
from pathlib import Path

# Ensure backend directory is in sys.path when executed via python app/main.py or python -m app.main
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analysis import router as analysis_router
from app.services.classifier import classifier_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("truthlens")

def _load_model_background():
    """Worker thread target to load neural model weights without delaying server port binding."""
    logger.info("Background thread: loading AI Classifier model weights...")
    success = classifier_service.initialize()
    if success:
        logger.info("AI Classifier model is loaded and ready for CPU inference.")
    else:
        logger.warning(f"AI Classifier could not be loaded: {classifier_service.error_details}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Non-blocking startup: start loading model in background thread
    logger.info("Triggering background initialization of AI Classifier Service...")
    loader_thread = threading.Thread(
        target=_load_model_background,
        daemon=True,
        name="model-loader-worker"
    )
    loader_thread.start()
    yield
    logger.info("Shutting down TruthLens Forensics API...")

app = FastAPI(
    title="TruthLens Forensics API",
    description="Backend API for TruthLens — Genuine 2D-FFT, Metadata & Pretrained ViT AI Image Classifier",
    version="1.1.0",
    lifespan=lifespan
)

# Configure CORS origins from ALLOWED_ORIGINS env var (comma-separated) with local dev fallback
raw_allowed_origins = os.environ.get("ALLOWED_ORIGINS", "")
if raw_allowed_origins.strip():
    allowed_origins = [o.strip() for o in raw_allowed_origins.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://new-project-theta-taupe.vercel.app",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analysis_router)

@app.get("/api/ping")
def ping():
    """Direct root /api/ping check that returns immediately without touching AI model."""
    return {"ok": True}

@app.get("/")
def root():
    return {
        "message": "Welcome to TruthLens Media Forensics Engine",
        "documentation": "/docs",
        "health": "/api/health",
        "ping": "/api/ping",
        "ai_model": classifier_service.MODEL_NAME,
        "ai_model_connected": classifier_service.is_available,
        "ai_model_status": classifier_service.status,
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    logger.info(f"Starting uvicorn server on {host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
