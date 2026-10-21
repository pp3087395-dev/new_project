from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.schemas.analysis import ForensicAnalysisResponse
from app.services.detector import detector_service

router = APIRouter(prefix="/api", tags=["analysis"])

MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TruthLens Media Forensics Engine",
        "version": "1.0.0-phase1",
        "mode": "genuine_signal_processing",
        "ai_model_connected": False,
        "capabilities": [
            "Real 2D-FFT frequency spectrum computation",
            "Image EXIF and dimension metadata extraction",
            "Radial spectral energy distribution analysis"
        ]
    }

@router.post("/analyze/image", response_model=ForensicAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided with upload."
        )

    # Read uploaded bytes into memory (avoiding permanent server disk writes)
    file_bytes = await file.read()
    
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes)."
        )

    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum size limit of 15MB ({len(file_bytes) / (1024 * 1024):.1f}MB)."
        )

    try:
        # Perform genuine metadata extraction and 2D-FFT computation
        result = detector_service.analyze_image(file_bytes, file.filename)
        return result
    except ValueError as ve:
        # User error: invalid or corrupted image file
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        # Server error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forensics analysis error: {str(e)}"
        )

@router.post("/analyze/video")
async def analyze_video(file: UploadFile = File(...)):
    # Explicit, honest message regarding Phase 1 scope
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Video frame analysis is scheduled for Phase 4. Currently, image forensics (2D-FFT and metadata) is active."
    )
