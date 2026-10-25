import io
import math
import base64
import hashlib
from typing import Dict, List, Tuple, Any
import numpy as np
from PIL import Image, ImageOps, ExifTags

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

    @staticmethod
    def safe_to_rgb(image: Image.Image) -> Image.Image:
        """
        Safely converts any PIL Image mode (RGBA, P, L, CMYK, 16-bit, etc.) to 8-bit RGB.
        Composites alpha channels over a solid white background instead of black.
        """
        if image.mode == "RGB":
            return image

        if image.mode == "P":
            if "transparency" in image.info:
                image = image.convert("RGBA")
            else:
                return image.convert("RGB")

        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            rgba = image.convert("RGBA")
            white_bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
            composite = Image.alpha_composite(white_bg, rgba)
            return composite.convert("RGB")

        if image.mode == "CMYK":
            return image.convert("RGB")

        if image.mode in ("L", "1"):
            return image.convert("RGB")

        if image.mode in ("I", "F", "I;16", "I;16L", "I;16B", "I;16N"):
            return image.convert("L").convert("RGB")

        return image.convert("RGB")

    @staticmethod
    def _add_exif_field(exif_dict: Dict[str, str], tag_name: str, value: Any):
        """Format an EXIF field into a readable string while excluding raw binary blobs."""
        if tag_name in ("MakerNote", "UserComment") and isinstance(value, bytes):
            return
        if isinstance(value, (str, int, float, bool)):
            s = str(value).strip()
            if s:
                exif_dict[tag_name] = s
        elif isinstance(value, bytes):
            try:
                decoded = value.decode("utf-8", errors="ignore").strip()
                if decoded and all(c.isprintable() or c.isspace() for c in decoded):
                    exif_dict[tag_name] = decoded
            except Exception:
                pass
        elif isinstance(value, (tuple, list)):
            exif_dict[tag_name] = str(value)
        elif hasattr(value, "numerator") and hasattr(value, "denominator"):
            if value.denominator != 0:
                float_val = float(value.numerator) / float(value.denominator)
                exif_dict[tag_name] = f"{float_val:.4g}" if float_val != int(float_val) else str(int(float_val))
            else:
                exif_dict[tag_name] = str(value)
        else:
            exif_dict[tag_name] = str(value)

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
            # 1. Read top-level 0th IFD
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                self._add_exif_field(exif_data, tag_name, value)

            # 2. Read Exif Sub-IFD (0x8769) for DateTimeOriginal, Exposure, Focal Length, etc.
            try:
                exif_ifd = raw_exif.get_ifd(0x8769)
                for tag_id, value in exif_ifd.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    self._add_exif_field(exif_data, tag_name, value)
            except Exception:
                pass

            # 3. Read GPS Sub-IFD (0x8825) for GPS coordinates and timestamps
            try:
                gps_ifd = raw_exif.get_ifd(0x8825)
                for tag_id, value in gps_ifd.items():
                    tag_name = ExifTags.GPSTAGS.get(tag_id, ExifTags.TAGS.get(tag_id, str(tag_id)))
                    self._add_exif_field(exif_data, tag_name, value)
            except Exception:
                pass

            if len(exif_data) > 0:
                has_exif = True

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
            if "GPSInfo" not in exif_data and "GPSLatitude" not in exif_data:
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
        # Remove deprecated mode="RGB" argument in Image.fromarray
        spectrum_image = Image.fromarray(colored_spectrum)

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

        # 2. Apply EXIF orientation transpose so rotated camera shots are upright before FFT and inference
        transposed_img = ImageOps.exif_transpose(image)
        if transposed_img is None:
            transposed_img = image

        # 3. Safely convert to standard RGB (compositing alpha on white, handling P, L, CMYK, 16-bit)
        rgb_img = self.safe_to_rgb(transposed_img)

        # 4. Compute genuine 2D-FFT frequency spectrum on upright RGB image
        frequency_analysis = self.compute_2d_fft(rgb_img)

        # 5. Perform genuine AI-Generated Image Classification (Vision Transformer) on upright RGB image
        ai_pred = classifier_service.predict(rgb_img)
        ai_classification = AIClassificationSchema(**ai_pred)

        # Contextualize status and limitations honestly
        if ai_classification.status == "success":
            model_status = (
                f"Connected and active: {classifier_service.MODEL_NAME}. "
                f"Prediction: {ai_classification.predicted_class} (Scores: Real={ai_classification.scores['REAL']}, Fake={ai_classification.scores['FAKE']}). "
                f"Inference: {ai_classification.inference_time_ms}ms on CPU."
            )
            stage_label = f"Image Forensics & {classifier_service.MODEL_NAME}"
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

        # Audit ID: TL- followed by first 10 uppercase hex characters of the file SHA-256 hash
        hex_digest = sha256_hash.replace("sha256:", "")
        audit_id = f"TL-{hex_digest[:10].upper()}"

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
