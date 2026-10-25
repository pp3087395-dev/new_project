from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class DimensionsSchema(BaseModel):
    width: int
    height: int
    aspect_ratio: str
    total_pixels: int

class ImageMetadataSchema(BaseModel):
    dimensions: DimensionsSchema
    format: str
    color_mode: str
    has_exif: bool
    exif_data: Dict[str, str]
    missing_metadata: List[str]

class SpectralEnergySchema(BaseModel):
    low_frequency_pct: float = Field(..., description="Energy ratio in core low-frequency band (broad contrast & shapes)")
    mid_frequency_pct: float = Field(..., description="Energy ratio in mid-frequency band (edges & structural transitions)")
    high_frequency_pct: float = Field(..., description="Energy ratio in outer high-frequency band (micro-texture & noise)")

class FrequencyAnalysisSchema(BaseModel):
    method: str = "2D Fast Fourier Transform (FFT) with Logarithmic Magnitude Scaling"
    fft_visualization_base64: str = Field(..., description="Base64 PNG data URI of centered 2D-FFT magnitude spectrum")
    energy_distribution: SpectralEnergySchema
    description: str
    disclaimer: str

class AIClassificationSchema(BaseModel):
    model_id: str = "umm-maybe/AI-image-detector"
    model_name: str = "ViT AI Image Detector (umm-maybe / Multi-Generator)"
    model_version: str = "2.0.0"
    status: str = Field(..., description="'success', 'unavailable', or 'error'")
    predicted_class: Optional[str] = Field(None, description="'REAL' or 'FAKE'")
    predicted_label_description: Optional[str] = Field(None, description="Human-readable description of predicted class")
    confidence_score: Optional[float] = Field(None, description="Model confidence percentage (0-100)")
    scores: Optional[Dict[str, float]] = Field(None, description="Softmax probability distribution per class")
    raw_logits: Optional[Dict[str, float]] = Field(None, description="Raw unnormalized transformer logits")
    calibration_statement: str
    scope_limitation: str
    inference_time_ms: Optional[float] = None
    error_message: Optional[str] = None

class ForensicAnalysisResponse(BaseModel):
    status: str = "success"
    mode: str = "genuine_signal_processing"
    id: str
    file_name: str
    media_type: str = "image"
    file_size_bytes: int
    file_size_formatted: str
    sha256_hash: str
    stage_label: str = "Multimodal Image Forensics & AI Classifier"
    metadata_analysis: ImageMetadataSchema
    frequency_analysis: FrequencyAnalysisSchema
    ai_classification: Optional[AIClassificationSchema] = None
    model_status: str
    limitations: List[str]
    recommendations: List[str]
