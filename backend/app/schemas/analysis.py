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

class ForensicAnalysisResponse(BaseModel):
    status: str = "success"
    mode: str = "genuine_signal_processing"
    id: str
    file_name: str
    media_type: str = "image"
    file_size_bytes: int
    file_size_formatted: str
    sha256_hash: str
    stage_label: str = "Image Forensics — AI Detector Not Yet Connected"
    metadata_analysis: ImageMetadataSchema
    frequency_analysis: FrequencyAnalysisSchema
    model_status: str = "Pretrained neural deepfake model is not yet connected. Results represent genuine deterministic signal processing."
    limitations: List[str]
    recommendations: List[str]
