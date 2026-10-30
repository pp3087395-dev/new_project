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
    model_id: str = "abacusai/Smaug-AI-Image-Detector"
    model_name: str = "Smaug AI Image Detector (Abacus AI)"
    model_version: str = "1.0.0"
    views_evaluated: Optional[int] = Field(None, description="Number of image views/crops evaluated")
    status: str = Field(..., description="'success', 'unavailable', or 'error'")
    predicted_class: Optional[str] = Field(None, description="'REAL', 'FAKE', or 'INCONCLUSIVE'")
    predicted_label_description: Optional[str] = Field(None, description="Human-readable description of predicted class")
    confidence_score: Optional[float] = Field(None, description="Model confidence percentage (0-100)")
    decision_threshold: Optional[float] = Field(0.50, description="Applied decision cutoff threshold")
    uncertain_band: Optional[float] = Field(0.10, description="Width of uncertain/inconclusive band around threshold")
    scores: Optional[Dict[str, float]] = Field(None, description="Softmax probability distribution per class")
    raw_logits: Optional[Dict[str, float]] = Field(None, description="Raw unnormalized transformer logits")
    calibration_statement: str
    scope_limitation: str
    inference_time_ms: Optional[float] = None
    error_message: Optional[str] = None

class ProvenanceSchema(BaseModel):
    ai_source_declared: bool = Field(False, description="True if metadata explicitly declares AI generation or AI tool")
    declared_source_type: Optional[str] = Field(None, description="IPTC DigitalSourceType if declared (e.g. trainedAlgorithmicMedia)")
    tool_strings: List[str] = Field(default_factory=list, description="Editing or generation tool names discovered in EXIF/XMP")
    c2pa_present: bool = Field(False, description="True if C2PA JUMBF metadata manifest is present")
    c2pa_verified: Optional[bool] = Field(None, description="True if C2PA cryptographic signature was verified; None if unverified")
    watermark_match: Optional[str] = Field(None, description="Matched visual watermark signature, or null")
    notes: List[str] = Field(default_factory=list, description="Explanatory notes and caveats regarding provenance clues")

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
    provenance: Optional[ProvenanceSchema] = None
    model_status: str
    limitations: List[str]
    recommendations: List[str]