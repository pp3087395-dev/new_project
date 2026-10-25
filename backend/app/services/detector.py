import io
import math
import base64
import hashlib
from typing import Dict, List, Tuple
import numpy as np
from PIL import Image, ExifTags

from app.schemas.analysis import (
    ForensicAnalysisResponse,
    ImageMetadataSchema,
    DimensionsSchema,
    FrequencyAnalysisSchema,
    SpectralEnergySchema,
    AIClassificationSchema,
)
from app.services.classifier import classifier_service

class MediaDetectorService:
    """
    Genuine Image Forensics Inspection Service.
    Performs real metadata extraction and mathematical 2D-FFT frequency domain analysis.
    Explicitly indicates that pretrained neural deepfake detection is not yet connected.
    """

    @staticmethod
    def calculate_sha256(file_bytes: bytes) -> str:
        return f"sha256:{hashlib.sha256(file_bytes).hexdigest()}"

    @staticmethod
    def _calculate_aspect_ratio(width: int, height: int) -> str:
        if width <= 0 or height <= 0:
            return "unknown"
        divisor = math.gcd(width, height)
        w_ratio = width // divisor
        h_ratio = height // divisor
        # If the ratio is very large numbers (e.g. 1920x1080 -> 16:9), display standard representation
        if (w_ratio, h_ratio) == (16, 9) or (w_ratio, h_ratio) == (4, 3) or (w_ratio, h_ratio) == (1, 1):
            return f"{w_ratio}:{h_ratio}"
        decimal = width / height
        if abs(decimal - 1.777) < 0.02:
            return "16:9 (~1.78)"
        if abs(decimal - 1.333) < 0.02:
            return "4:3 (~1.33)"
        if abs(decimal - 1.0) < 0.01:
            return "1:1 (Square)"
        return f"{w_ratio}:{h_ratio} ({decimal:.2f}:1)"

    def extract_metadata(self, image: Image.Image, file_size_bytes: int) -> ImageMetadataSchema:
        width, height = image.size
        aspect_ratio = self._calculate_aspect_ratio(width, height)
        total_pixels = width * height

        dimensions = DimensionsSchema(
            width=width,
            height=height,
            aspect_ratio=aspect_ratio,
            total_pixels=total_pixels,
        )

        exif_data: Dict[str, str] = {}
        missing_metadata: List[str] = []
        has_exif = False

        raw_exif = image.getexif()
        if raw_exif:
            has_exif = True
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                # Filter to common readable string fields and exclude raw binary blobs
                if isinstance(value, (str, int, float)):
                    exif_data[tag_name] = str(value)
                elif isinstance(value, bytes):
                    try:
                        exif_data[tag_name] = value.decode("utf-8", errors="ignore").strip()
                    except Exception:
                        pass

        # Identify missing or omitted metadata fields
        if not has_exif or len(exif_data) == 0:
            missing_metadata.append(
                "EXIF container absent: Typical for messaging platforms (WhatsApp, Signal, Instagram) or AI diffusion models (Midjourney, Stable Diffusion)."
            )
            missing_metadata.append("Camera hardware model & manufacturer omitted.")
            missing_metadata.append("Capture timestamp (DateTimeOriginal) omitted.")
            missing_metadata.append("GPS location / Geotagging coordinates omitted.")
        else:
            if "Make" not in exif_data and "Model" not in exif_data:
                missing_metadata.append("Camera hardware model & manufacturer not recorded.")
            if "DateTime" not in exif_data and "DateTimeOriginal" not in exif_data:
                missing_metadata.append("Capture timestamp omitted.")
            if "Software" not in exif_data:
                missing_metadata.append("Processing software tag absent.")
            if "GPSInfo" not in exif_data:
                missing_metadata.append("GPS / Geotagging coordinates absent.")

        return ImageMetadataSchema(
            dimensions=dimensions,
            format=image.format or "UNKNOWN",
            color_mode=image.mode,
            has_exif=has_exif and len(exif_data) > 0,
            exif_data=exif_data,
            missing_metadata=missing_metadata,
        )

    def compute_2d_fft(self, image: Image.Image) -> FrequencyAnalysisSchema:
        """
        Computes the actual 2D Fast Fourier Transform (FFT) on image pixel data.
        Returns the centered log-magnitude spectrum as a Base64-encoded PNG image
        along with radial energy distribution bands.
        """
        # Convert image to single-channel luminance (grayscale)
        gray = image.convert("L")
        
        # Standardize calculation dimensions (512x512) for consistent spectral resolution
        target_size = (512, 512)
        gray_resized = gray.resize(target_size, Image.Resampling.LANCZOS)
        img_arr = np.asarray(gray_resized, dtype=np.float32)

        # 1. Compute 2D Fast Fourier Transform
        f_transform = np.fft.fft2(img_arr)

        # 2. Shift the zero-frequency DC component to the center of the spectrum
        f_shifted = np.fft.fftshift(f_transform)

        # 3. Calculate magnitude spectrum and apply logarithmic compression: log(1 + |F(u, v)|)
        magnitude = np.abs(f_shifted)
        log_magnitude = np.log1p(magnitude)

        # 4. Normalize to 0-255 range for image visualization
        min_val = float(np.min(log_magnitude))
        max_val = float(np.max(log_magnitude))
        range_val = max_val - min_val
        if range_val <= 1e-8:
            normalized = np.zeros(target_size, dtype=np.uint8)
        else:
            normalized = ((log_magnitude - min_val) / range_val * 255.0).astype(np.uint8)

        # 5. Apply high-contrast forensic false-color LUT:
        # 0 (Low energy) -> Deep Navy (#080E24)
        # 128 (Mid energy) -> High-Contrast Cyan (#06B6D4)
        # 255 (Peak energy) -> Brilliant White (#FFFFFF)
        lut = np.zeros((256, 3), dtype=np.uint8)
        for i in range(256):
            t = i / 255.0
            if t < 0.5:
                f = t / 0.5
                lut[i] = [
                    int(8 + (6 - 8) * f),
                    int(14 + (182 - 14) * f),
                    int(36 + (212 - 36) * f),
                ]
            else:
                f = (t - 0.5) / 0.5
                lut[i] = [
                    int(6 + (255 - 6) * f),
                    int(182 + (255 - 182) * f),
                    int(212 + (255 - 212) * f),
                ]

        colored_spectrum = lut[normalized]
        spectrum_image = Image.fromarray(colored_spectrum, mode="RGB")

        # Encode resulting image as Base64 PNG data URI
        buffer = io.BytesIO()
        spectrum_image.save(buffer, format="PNG", optimize=True)
        base64_data = base64.b64encode(buffer.getvalue()).decode("utf-8")
        fft_data_uri = f"data:image/png;base64,{base64_data}"

        # 6. Calculate radial spectral energy distribution
        center_y, center_x = target_size[0] // 2, target_size[1] // 2
        y_coords, x_coords = np.ogrid[:target_size[0], :target_size[1]]
        radial_distance = np.sqrt((x_coords - center_x) ** 2 + (y_coords - center_y) ** 2)

        total_energy = float(np.sum(magnitude))
        if total_energy <= 1e-8:
            energy_dist = SpectralEnergySchema(
                low_frequency_pct=100.0,
                mid_frequency_pct=0.0,
                high_frequency_pct=0.0
            )
        else:
            # Low: r <= 42 (~1/6 radius), Mid: 42 < r <= 128 (~1/2 radius), High: r > 128
            low_mask = radial_distance <= 42
            mid_mask = (radial_distance > 42) & (radial_distance <= 128)
            high_mask = radial_distance > 128

            low_pct = round(float(np.sum(magnitude[low_mask])) / total_energy * 100.0, 2)
            mid_pct = round(float(np.sum(magnitude[mid_mask])) / total_energy * 100.0, 2)
            high_pct = round(float(np.sum(magnitude[high_mask])) / total_energy * 100.0, 2)

            energy_dist = SpectralEnergySchema(
                low_frequency_pct=low_pct,
                mid_frequency_pct=mid_pct,
                high_frequency_pct=high_pct
            )

        description = (
            "Computed 2D Fast Fourier Transform with zero-frequency DC component centered. "
            "The bright central core represents low-frequency global illumination and broad shapes. "
            "Radial spokes and outward dispersion represent mid-to-high frequency transitions, contrast edges, "
            "and camera sensor noise."
        )

        disclaimer = (
            "Frequency visualization is a signal-processing inspection tool. "
            "It visualizes mathematical frequency distribution and potential periodic grid harmonics. "
            "It does NOT constitute an automated authenticity or deepfake verdict."
        )

        return FrequencyAnalysisSchema(
            method="2D Fast Fourier Transform (FFT) with Logarithmic Magnitude Scaling",
            fft_visualization_base64=fft_data_uri,
            energy_distribution=energy_dist,
            description=description,
            disclaimer=disclaimer
        )

    def analyze_image(self, file_bytes: bytes, file_name: str) -> ForensicAnalysisResponse:
        """
        Main image forensics entry point.
        Performs genuine validation, metadata analysis, and 2D-FFT computation.
        """
        # Validate image data integrity using Pillow
        try:
            temp_img = Image.open(io.BytesIO(file_bytes))
            temp_img.verify()
        except Exception as e:
            raise ValueError(f"Invalid or corrupted image data: {str(e)}")

        # Reopen image for data extraction (verify() closes/invalidates the file handle)
        image = Image.open(io.BytesIO(file_bytes))

        # Check image format
        allowed_formats = ["JPEG", "PNG", "WEBP"]
        if image.format not in allowed_formats:
            raise ValueError(
                f"Unsupported image format '{image.format}'. TruthLens supports JPEG, PNG, and WEBP."
            )

        sha256_hash = self.calculate_sha256(file_bytes)
        file_size_bytes = len(file_bytes)
        file_size_formatted = f"{(file_size_bytes / (1024 * 1024)):.2f} MB"

        # 1. Extract genuine metadata & EXIF
        metadata_analysis = self.extract_metadata(image, file_size_bytes)

        # 2. Compute genuine 2D-FFT frequency spectrum
        frequency_analysis = self.compute_2d_fft(image)

        # 3. Perform genuine AI-Generated Image Classification (Vision Transformer ONNX)
        ai_pred = classifier_service.predict(image)
        ai_classification = AIClassificationSchema(**ai_pred)

        # Contextualize status and limitations honestly
        if ai_classification.status == "success":
            model_status = (
                f"Connected and active: {classifier_service.MODEL_NAME}. "
                f"Prediction: {ai_classification.predicted_class} (Scores: Real={ai_classification.scores['REAL']}, Fake={ai_classification.scores['FAKE']}). "
                f"Inference: {ai_classification.inference_time_ms}ms on CPU."
            )
            stage_label = "Image Forensics & Pretrained ViT AI Classifier"
        elif ai_classification.status == "unavailable":
            model_status = (
                f"AI model unavailable: {ai_classification.error_message}. "
                f"Operating in deterministic signal-processing fallback mode."
            )
            stage_label = "Image Forensics — AI Classifier Unavailable"
        else:
            model_status = (
                f"AI model inference error: {ai_classification.error_message}. "
                f"No synthetic prediction generated."
            )
            stage_label = "Image Forensics — AI Inference Error"

        limitations = [
            "AI model classification is statistical and trained across modern generative diffusion outputs and real photography; it does not provide definitive judicial or mathematical proof.",
            "This model is specialized for detecting AI-generated synthetic images and has not been established as a universal face-swap detector.",
            "Scores are raw softmax outputs from Vision Transformer logits and represent model activation strength rather than calibrated Bayesian probabilities.",
            "2D-FFT frequency distributions visualize periodicity and edge energy, but cannot alone prove whether an image is AI-generated.",
            "EXIF metadata is easily stripped by messaging platforms and social networks; absence of EXIF is not definitive evidence of fabrication.",
            "Compression artifacts (e.g., JPEG 8x8 block discrete cosine transforms) introduce high-frequency harmonics that must be distinguished from generative upsampler grids."
        ]

        recommendations = [
            "Evaluate the Vision Transformer prediction alongside the 2D-FFT frequency spectrum and EXIF provenance data for multi-spectral corroboration.",
            "Examine the 2D-FFT magnitude spectrum for abnormal periodic starburst or cross-hatch spikes characteristic of GAN transposed convolutions.",
            "Inspect the EXIF table for software provenance tags (e.g., Photoshop, Midjourney) or missing camera hardware parameters.",
            "Do not label an image definitively authentic or inauthentic based on automated AI model scores alone.",
            "Cross-reference the image with reverse-image search engines (Google Lens, TinEye) to trace publication history."
        ]

        audit_id = f"TL-FOR-{hashlib.md5(file_bytes[:64]).hexdigest()[:6].upper()}"

        return ForensicAnalysisResponse(
            status="success",
            mode="genuine_signal_processing",
            id=audit_id,
            file_name=file_name,
            media_type="image",
            file_size_bytes=file_size_bytes,
            file_size_formatted=file_size_formatted,
            sha256_hash=sha256_hash,
            stage_label=stage_label,
            metadata_analysis=metadata_analysis,
            frequency_analysis=frequency_analysis,
            ai_classification=ai_classification,
            model_status=model_status,
            limitations=limitations,
            recommendations=recommendations,
        )

detector_service = MediaDetectorService()
