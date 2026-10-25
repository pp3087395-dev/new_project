import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analysis import router as analysis_router
from app.services.classifier import classifier_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("truthlens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly initialize and load the model on startup so requests do not block or re-download
    logger.info("Initializing ViT AI Classifier Service on startup...")
    success = classifier_service.initialize()
    if success:
        logger.info("AI Classifier model is ready for CPU inference.")
    else:
        logger.warning(f"AI Classifier could not be loaded on startup: {classifier_service.error_details}")
    yield
    logger.info("Shutting down TruthLens Forensics API...")

app = FastAPI(
    title="TruthLens Forensics API",
    description="Backend API for TruthLens — Genuine 2D-FFT, Metadata & Pretrained ViT AI Image Classifier",
    version="1.1.0",
    lifespan=lifespan
)

# Configure CORS for local dev + deployed Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://new-project-theta-taupe.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analysis_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to TruthLens Media Forensics Engine",
        "documentation": "/docs",
        "health": "/api/health",
        "ai_model": classifier_service.MODEL_NAME,
        "ai_model_connected": classifier_service.is_available,
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
