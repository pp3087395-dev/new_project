import logging
import threading
import time
from typing import Dict, Any, Optional
import numpy as np
from PIL import Image

try:
    import torch
    from transformers import AutoImageProcessor, AutoModelForImageClassification
except ImportError:
    torch = None
    AutoImageProcessor = None
    AutoModelForImageClassification = None

logger = logging.getLogger("truthlens.classifier")

class AIClassifierService:
    """
    Dedicated AI-Generated Image Classification Service running on CPU.
    Model: umm-maybe/AI-image-detector (fine-tuned Vision Transformer).
    
    Trained across diverse modern generative outputs (Midjourney, Stable Diffusion,
    DALL-E) and authentic human photography. Evaluates both whole-image composition
    and native-resolution central grain to prevent downsampling false positives.
    """

    MODEL_REPO_ID = "umm-maybe/AI-image-detector"
    MODEL_ID = "umm-maybe/AI-image-detector"
    MODEL_NAME = "ViT AI Image Detector (umm-maybe / Multi-Generator)"
    MODEL_VERSION = "2.0.0"

    # Model class mapping:
    # 0 -> "artificial" (FAKE / Synthetic)
    # 1 -> "human" (REAL / Authentic photograph)
    ID2LABEL = {0: "artificial", 1: "human"}

    CALIBRATION_STATEMENT = (
        "Scores are computed via softmax normalization of Vision Transformer output logits. "
        "These represent relative model activations and are not calibrated Bayesian or frequentist probabilities."
    )
    SCOPE_LIMITATION = (
        "This model evaluates structural, texture, and latent artifact patterns across generative diffusion "
        "and real photography. While significantly more generalizable than toy benchmark models, extreme compression "
        "or novel adversarial synthesis may still introduce statistical uncertainty."
    )

    def __init__(self):
        self._model: Optional[Any] = None
        self._processor: Optional[Any] = None
        self._is_initialized: bool = False
        self._init_error: Optional[str] = None
        self._lock = threading.Lock()

    @property
    def _session(self) -> Optional[Any]:
        """Backward compatibility alias for test suite and external references."""
        return self._model

    @property
    def is_available(self) -> bool:
        return self._is_initialized and self._model is not None

    @property
    def status(self) -> str:
        if self._is_initialized:
            return "ready"
        if self._init_error:
            return "error"
        return "uninitialized"

    @property
    def error_details(self) -> Optional[str]:
        return self._init_error

    def initialize(self) -> bool:
        """
        Loads and initializes the Hugging Face model and processor once on CPU.
        Reuses cached weights if available. Thread-safe singleton pattern.
        """
        if self._is_initialized:
            return True

        with self._lock:
            if self._is_initialized:
                return True

            if torch is None or AutoImageProcessor is None or AutoModelForImageClassification is None:
                self._init_error = "PyTorch or HuggingFace transformers is not installed."
                logger.error(self._init_error)
                return False

            try:
                logger.info(f"Loading weights for {self.MODEL_REPO_ID} on CPU...")
                # Set multi-threading CPU threads
                torch.set_num_threads(4)

                processor = AutoImageProcessor.from_pretrained(self.MODEL_REPO_ID)
                model = AutoModelForImageClassification.from_pretrained(self.MODEL_REPO_ID)
                model.eval()

                self._processor = processor
                self._model = model
                self._is_initialized = True
                self._init_error = None
                logger.info(f"{self.MODEL_NAME} initialized successfully on CPU.")
                return True

            except Exception as e:
                self._init_error = f"Failed to initialize AI model: {str(e)}"
                self._is_initialized = False
                self._model = None
                self._processor = None
                logger.error(self._init_error, exc_info=True)
                return False

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Performs genuine neural inference on the image.
        Uses dual-view inspection (full image + native central crop for high-res images)
        to protect against downsampling false-positives.
        """
        if not self._is_initialized:
            self.initialize()

        if not self.is_available:
            return {
                "status": "unavailable",
                "model_id": self.MODEL_ID,
                "model_name": self.MODEL_NAME,
                "model_version": self.MODEL_VERSION,
                "predicted_class": None,
                "predicted_label_description": None,
                "confidence_score": None,
                "scores": None,
                "raw_logits": None,
                "calibration_statement": self.CALIBRATION_STATEMENT,
                "scope_limitation": self.SCOPE_LIMITATION,
                "inference_time_ms": None,
                "error_message": self._init_error or "AI inference engine is unavailable.",
            }

        start_time = time.time()

        try:
            rgb_img = image.convert("RGB")
            w, h = rgb_img.size

            # Build dual-view representation:
            # 1. Full image (for global composition)
            # 2. Native-resolution center crop (to preserve original sensor grain if image is large)
            images_to_process = [rgb_img]
            if w >= 384 and h >= 384:
                crop_size = min(w, h, 512)
                left = (w - crop_size) // 2
                top = (h - crop_size) // 2
                center_crop = rgb_img.crop((left, top, left + crop_size, top + crop_size))
                images_to_process.append(center_crop)

            inputs = self._processor(images=images_to_process, return_tensors="pt")

            with torch.no_grad():
                outputs = self._model(**inputs)
                logits = outputs.logits  # Shape: (N, 2)
                probs = torch.nn.functional.softmax(logits, dim=-1)

                # Average probabilities and logits across views
                avg_probs = torch.mean(probs, dim=0)
                avg_logits = torch.mean(logits, dim=0)

            # Class mapping: 0 -> "artificial" (FAKE), 1 -> "human" (REAL)
            fake_score = float(avg_probs[0])
            real_score = float(avg_probs[1])
            fake_logit = float(avg_logits[0])
            real_logit = float(avg_logits[1])

            predicted_class = "FAKE" if fake_score >= real_score else "REAL"
            predicted_desc = (
                "AI-Generated Media (Synthetic)"
                if predicted_class == "FAKE"
                else "Authentic Photograph / Real-World Media"
            )

            confidence_score = round((fake_score if predicted_class == "FAKE" else real_score) * 100.0, 2)
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            return {
                "status": "success",
                "model_id": self.MODEL_ID,
                "model_name": self.MODEL_NAME,
                "model_version": self.MODEL_VERSION,
                "predicted_class": predicted_class,
                "predicted_label_description": predicted_desc,
                "confidence_score": confidence_score,
                "scores": {
                    "REAL": round(real_score, 4),
                    "FAKE": round(fake_score, 4),
                },
                "raw_logits": {
                    "REAL": round(real_logit, 4),
                    "FAKE": round(fake_logit, 4),
                },
                "calibration_statement": self.CALIBRATION_STATEMENT,
                "scope_limitation": self.SCOPE_LIMITATION,
                "inference_time_ms": elapsed_ms,
                "error_message": None,
            }

        except Exception as e:
            logger.error(f"Inference error: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "model_id": self.MODEL_ID,
                "model_name": self.MODEL_NAME,
                "model_version": self.MODEL_VERSION,
                "predicted_class": None,
                "predicted_label_description": None,
                "confidence_score": None,
                "scores": None,
                "raw_logits": None,
                "calibration_statement": self.CALIBRATION_STATEMENT,
                "scope_limitation": self.SCOPE_LIMITATION,
                "inference_time_ms": None,
                "error_message": f"Inference execution failed: {str(e)}",
            }

# Global singleton instance
classifier_service = AIClassifierService()
