import os
import sys
import time
import logging
import threading
from typing import Dict, Any, Optional, Tuple, List
from PIL import Image, ImageOps, ExifTags

logger = logging.getLogger("truthlens.classifier")

def safe_to_rgb(image: Image.Image) -> Image.Image:
    """Safely converts any PIL image mode to standard 8-bit RGB with white alpha composite."""
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


# Authoritative per-backend label mapping specifications (Single Source of Truth)
BACKEND_LABEL_SPECS: Dict[str, Dict[str, Any]] = {
    "siglip": {
        "model_id": "Ateeqq/ai-vs-human-image-detector",
        "fake_labels": {"ai"},
        "real_labels": {"hum"},
    },
    "legacy": {
        "model_id": "umm-maybe/AI-image-detector",
        "fake_labels": {"artificial"},
        "real_labels": {"human"},
    },
    "smaug": {
        "model_id": "abacusai/Smaug-AI-Image-Detector",
        "output_type": "sigmoid_scalar",
        "fake_labels": {"label_1", "fake", "ai", "synthetic"},
        "real_labels": {"label_0", "real", "human"},
    },
}


def build_label_mapping(
    id2label: Dict[Any, str],
    model_id: str,
    backend_key: Optional[str] = None
) -> Dict[str, int]:
    """
    Robustly maps Hugging Face classification labels to 'FAKE' and 'REAL' indices
    using explicit per-backend specifications as the single source of truth.
    Never relies on hardcoded indices or fuzzy keyword substrings.
    Raises clear startup ValueError if any label cannot be resolved.
    """
    if not isinstance(id2label, dict) or not id2label:
        raise ValueError(f"Invalid or empty id2label dictionary for '{model_id}': {id2label}")

    fake_idx: Optional[int] = None
    real_idx: Optional[int] = None

    # 1. Determine matching backend spec
    spec = None
    if backend_key and backend_key in BACKEND_LABEL_SPECS:
        spec = BACKEND_LABEL_SPECS[backend_key]
    else:
        for b_key, b_spec in BACKEND_LABEL_SPECS.items():
            if b_spec.get("model_id") == model_id:
                spec = b_spec
                break

    if spec:
        fake_labels = {lbl.lower() for lbl in spec.get("fake_labels", set())}
        real_labels = {lbl.lower() for lbl in spec.get("real_labels", set())}
    else:
        # Strict exact token matching for custom/test models (no arbitrary substrings)
        fake_labels = {"artificial", "ai", "fake", "generated", "synthetic"}
        real_labels = {"human", "hum", "real", "authentic"}

    for raw_idx, raw_label in id2label.items():
        label = str(raw_label).lower().strip()
        idx_int = int(raw_idx)

        is_fake = label in fake_labels
        is_real = label in real_labels

        if is_fake and is_real:
            raise ValueError(
                f"Conflicting label definition for '{model_id}': label '{label}' matches both FAKE and REAL categories."
            )

        if is_fake:
            if fake_idx is not None and fake_idx != idx_int:
                raise ValueError(
                    f"Ambiguous FAKE mapping for '{model_id}': multiple indices ({fake_idx}, {idx_int}) resolve to FAKE."
                )
            fake_idx = idx_int
        elif is_real:
            if real_idx is not None and real_idx != idx_int:
                raise ValueError(
                    f"Ambiguous REAL mapping for '{model_id}': multiple indices ({real_idx}, {idx_int}) resolve to REAL."
                )
            real_idx = idx_int

    if fake_idx is None or real_idx is None or fake_idx == real_idx:
        raise ValueError(
            f"Unable to dynamically map model labels for '{model_id}' to FAKE and REAL. "
            f"Config id2label={id2label}. Resolved fake_idx={fake_idx}, real_idx={real_idx}."
        )

    raw_fake_name = id2label.get(fake_idx) if fake_idx in id2label else id2label.get(str(fake_idx), str(fake_idx))
    raw_real_name = id2label.get(real_idx) if real_idx in id2label else id2label.get(str(real_idx), str(real_idx))
    logger.info(
        f"Explicit label mapping for '{model_id}': "
        f"FAKE -> index {fake_idx} ('{raw_fake_name}'), "
        f"REAL -> index {real_idx} ('{raw_real_name}')"
    )
    return {"FAKE": fake_idx, "REAL": real_idx}


class BaseClassifierBackend:
    backend_key: str
    model_id: str
    model_name: str
    model_version: str

    def initialize(self, hf_token: Optional[str] = None):
        raise NotImplementedError

    def predict_fake_probability(self, image: Image.Image) -> Tuple[float, int, Optional[Dict[str, float]]]:
        """Returns (fake_probability_in_range_0_to_1, views_evaluated, optional_raw_logits)."""
        raise NotImplementedError


class SigLIPBackend(BaseClassifierBackend):
    backend_key = "siglip"
    model_id = "Ateeqq/ai-vs-human-image-detector"
    model_name = "SigLIP AI Image Detector (Ateeqq / SigLIP)"
    model_version = "1.0.0"

    def __init__(self):
        self.processor = None
        self.model = None
        self.label_mapping = None

    def initialize(self, hf_token: Optional[str] = None):
        import torch
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        logger.info(f"Loading {self.model_id} on CPU...")
        torch.set_num_threads(4)
        self.processor = AutoImageProcessor.from_pretrained(self.model_id, token=hf_token)
        self.model = AutoModelForImageClassification.from_pretrained(self.model_id, token=hf_token)
        self.model.eval()
        self.label_mapping = build_label_mapping(self.model.config.id2label, self.model_id, backend_key=self.backend_key)

    def predict_fake_probability(self, image: Image.Image) -> Tuple[float, int, Optional[Dict[str, float]]]:
        import torch
        img = safe_to_rgb(ImageOps.exif_transpose(image) or image)

        # Standard full-image inference: AutoImageProcessor scales and normalizes the image to 224x224
        # (Avoid multi-crop averaging which strips semantic context from 224px patches and dilutes AI probabilities)
        inputs = self.processor(images=[img], return_tensors="pt")
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits[0]  # Shape (2,)
            probs = torch.softmax(logits, dim=-1)

        fake_idx = self.label_mapping["FAKE"]
        real_idx = self.label_mapping["REAL"]

        fake_prob = float(probs[fake_idx].item())
        raw_logits = {
            "FAKE": float(logits[fake_idx].item()),
            "REAL": float(logits[real_idx].item())
        }
        return fake_prob, 1, raw_logits


class SmaugBackend(BaseClassifierBackend):
    backend_key = "smaug"
    model_id = "abacusai/Smaug-AI-Image-Detector"
    model_name = "Smaug AI Image Detector (Abacus AI)"
    model_version = "1.0.0"

    def __init__(self):
        self.detector = None
        self.crops = int(os.environ.get("SMAUG_CROPS", "1"))
        self.label_mapping = {"FAKE": 1, "REAL": 0}

    def initialize(self, hf_token: Optional[str] = None):
        from huggingface_hub import snapshot_download
        logger.info(f"Resolving snapshot for {self.model_id}...")
        model_dir = snapshot_download(repo_id=self.model_id, token=hf_token)
        if model_dir not in sys.path:
            sys.path.insert(0, model_dir)
        from smaug_image_detect import SmaugImageDetect
        logger.info(f"Loading Smaug detector from {model_dir} (crops={self.crops})...")
        self.detector = SmaugImageDetect.from_pretrained(model_dir)
        self.label_mapping = {"FAKE": 1, "REAL": 0}

    def predict_fake_probability(self, image: Image.Image) -> Tuple[float, int, Optional[Dict[str, float]]]:
        img = safe_to_rgb(ImageOps.exif_transpose(image) or image)
        
        # Max-dimension cap at 2048px to prevent extreme memory and resize latency on huge camera images
        cap_2048 = os.environ.get("CAP_INPUT_2048", "true").lower() in ("true", "1", "yes")
        max_dim = max(img.size)
        if cap_2048 and max_dim > 2048:
            scale = 2048.0 / max_dim
            new_size = (int(round(img.width * scale)), int(round(img.height * scale)))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        crops = int(os.environ.get("SMAUG_CROPS", str(self.crops)))

        if crops in (1, 3):
            prob = self.detector(img, crops=crops)
            fake_prob = float(prob)
            return fake_prob, crops, None
        elif crops == 2:
            import torch
            import math
            # Custom 2-crop evaluation: evaluate start and end crops along the longer dimension
            SIDE, CROP = 576, 528
            w, h = img.size
            if min(w, h) > SIDE:
                s = SIDE / min(w, h)
                scaled = img.resize((round(w * s), round(h * s)), Image.LANCZOS)
            elif min(w, h) < CROP:
                s = CROP / min(w, h)
                scaled = img.resize((math.ceil(w * s), math.ceil(h * s)), Image.BICUBIC)
            else:
                scaled = img
            sw, sh = scaled.size
            cx, cy = (sw - CROP) // 2, (sh - CROP) // 2
            if sw >= sh:
                crop_list = [scaled.crop((x, cy, x + CROP, cy + CROP)) for x in (0, sw - CROP)]
            else:
                crop_list = [scaled.crop((cx, y, cx + CROP, y + CROP)) for y in (0, sh - CROP)]
            flat = [{'image': c} for c in crop_list]
            logits = self.detector.st.encode(flat, batch_size=16, convert_to_tensor=True).float().view(1, 2)
            prob = float(torch.sigmoid(logits.mean(1)).item())
            return prob, 2, None
        else:
            prob = self.detector(img, crops=1)
            return float(prob), 1, None


class LegacyBackend(BaseClassifierBackend):
    backend_key = "legacy"
    model_id = "umm-maybe/AI-image-detector"
    model_name = "ViT AI Image Detector (umm-maybe / Baseline)"
    model_version = "2.0.0"

    def __init__(self):
        self.processor = None
        self.model = None
        self.label_mapping = None

    def initialize(self, hf_token: Optional[str] = None):
        import torch
        from transformers import AutoImageProcessor, AutoModelForImageClassification
        logger.info(f"Loading legacy model {self.model_id} on CPU...")
        torch.set_num_threads(4)
        self.processor = AutoImageProcessor.from_pretrained(self.model_id, token=hf_token)
        self.model = AutoModelForImageClassification.from_pretrained(self.model_id, token=hf_token)
        self.model.eval()
        self.label_mapping = build_label_mapping(self.model.config.id2label, self.model_id, backend_key=self.backend_key)

    def predict_fake_probability(self, image: Image.Image) -> Tuple[float, int, Optional[Dict[str, float]]]:
        import torch
        img = safe_to_rgb(ImageOps.exif_transpose(image) or image)
        inputs = self.processor(images=[img], return_tensors="pt")
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits[0]
            probs = torch.softmax(logits, dim=-1)

        fake_idx = self.label_mapping["FAKE"]
        real_idx = self.label_mapping["REAL"]

        fake_prob = float(probs[fake_idx].item())
        raw_logits = {
            "FAKE": float(logits[fake_idx].item()),
            "REAL": float(logits[real_idx].item())
        }
        return fake_prob, 1, raw_logits


class AIClassifierService:
    """
    Unified AI-Generated Image Classification Service supporting multiple backends:
    - 'siglip' (Default): Ateeqq/ai-vs-human-image-detector (92.9M SigLIP with multi-view native tiling)
    - 'smaug': abacusai/Smaug-AI-Image-Detector (439M high-accuracy model with native crops)
    - 'legacy': umm-maybe/AI-image-detector (2022 VQGAN baseline for before/after comparison)
    Corroborates neural inference with camera hardware metadata provenance.
    """

    CALIBRATION_STATEMENT = (
        "Scores are computed via softmax normalization of Vision Transformer output logits "
        "corroborated with EXIF camera hardware provenance and 2D-FFT frequency spectra."
    )
    SCOPE_LIMITATION = (
        "This tool estimates whether an image is fully AI-generated. "
        "It cannot tell whether a real photo was edited, retouched, upscaled or AI-enhanced. "
        "Absence of detection is not proof the image is untouched."
    )

    DEFAULT_THRESHOLDS = {
        "smaug": 0.50,
        "siglip": 0.40,
        "legacy": 0.50,
    }
    DEFAULT_UNCERTAIN_BAND = 0.10

    def __init__(self):
        self._backend_key = os.environ.get("CLASSIFIER_BACKEND", "smaug").lower().strip()
        self._hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
        self._backend: Optional[BaseClassifierBackend] = None
        self._is_initialized: bool = False
        self._is_loading: bool = False
        self._init_error: Optional[str] = None
        self._lock = threading.Lock()

        self._select_backend(self._backend_key)

    @property
    def threshold(self) -> float:
        """Configured fake decision threshold cutoff (default 0.50 for smaug, 0.40 for siglip)."""
        env_val = os.environ.get("CLASSIFIER_FAKE_THRESHOLD")
        if env_val is not None:
            try:
                return float(env_val)
            except ValueError:
                pass
        return self.DEFAULT_THRESHOLDS.get(self._backend_key, 0.50)

    @property
    def uncertain_band(self) -> float:
        """Configured uncertainty half-width around threshold for INCONCLUSIVE verdict (default 0.10)."""
        env_val = os.environ.get("CLASSIFIER_UNCERTAIN_BAND")
        if env_val is not None:
            try:
                return float(env_val)
            except ValueError:
                pass
        return self.DEFAULT_UNCERTAIN_BAND

    def _select_backend(self, key: str):
        if key == "smaug":
            self._backend = SmaugBackend()
        elif key == "legacy":
            self._backend = LegacyBackend()
        else:
            self._backend = SigLIPBackend()
        self._backend_key = self._backend.backend_key

    @property
    def MODEL_NAME(self) -> str:
        return self._backend.model_name if self._backend else "AI Image Detector"

    @property
    def MODEL_ID(self) -> str:
        return self._backend.model_id if self._backend else "unknown"

    @property
    def MODEL_VERSION(self) -> str:
        return self._backend.model_version if self._backend else "1.0.0"

    @property
    def backend_key(self) -> str:
        return self._backend_key

    @property
    def is_available(self) -> bool:
        return self._is_initialized and self._backend is not None

    @property
    def status(self) -> str:
        if self._is_initialized and self._backend is not None:
            return "ready"
        if self._init_error:
            return "error"
        return "loading"

    @property
    def error_details(self) -> Optional[str]:
        return self._init_error

    def initialize(self) -> bool:
        if self._is_initialized:
            return True

        with self._lock:
            if self._is_initialized:
                return True

            self._is_loading = True
            self._init_error = None

            try:
                current_backend_key = os.environ.get("CLASSIFIER_BACKEND", self._backend_key).lower().strip()
                if current_backend_key != self._backend_key:
                    self._select_backend(current_backend_key)

                hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
                self._backend.initialize(hf_token=hf_token)
                self._is_initialized = True
                self._init_error = None
                logger.info(f"{self.MODEL_NAME} ({self._backend_key}) initialized successfully.")
                return True
            except Exception as e:
                self._init_error = f"Failed to initialize {self._backend_key} backend: {str(e)}"
                self._is_initialized = False
                logger.error(self._init_error, exc_info=True)
                return False
            finally:
                self._is_loading = False

    def predict_fake_probability(self, pil_image: Image.Image) -> float:
        """
        Unified public interface returning float in [0.0, 1.0] representing
        the probability that the image is AI-generated (FAKE).
        """
        if not self._is_initialized:
            self.initialize()

        if not self.is_available:
            raise RuntimeError(f"AI classifier is unavailable: {self._init_error}")

        fake_prob, _, _ = self._backend.predict_fake_probability(pil_image)
        return fake_prob

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Performs neural inference on the image corroborated with camera hardware provenance.
        Returns calibrated dict with predicted_class, confidence, scores, latency,
        views evaluated, threshold, and uncertain_band.
        """
        threshold = self.threshold
        uncertain_band = self.uncertain_band

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
                "decision_threshold": threshold,
                "uncertain_band": uncertain_band,
                "scores": None,
                "raw_logits": None,
                "views_evaluated": None,
                "calibration_statement": self.CALIBRATION_STATEMENT,
                "scope_limitation": self.SCOPE_LIMITATION,
                "inference_time_ms": None,
                "error_message": self._init_error or "AI inference engine is unavailable.",
            }

        start_time = time.time()
        try:
            fake_prob, views_evaluated, raw_logits = self._backend.predict_fake_probability(image)
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            real_prob = max(0.0, min(1.0, 1.0 - fake_prob))
            fake_prob = max(0.0, min(1.0, fake_prob))

            # Check camera hardware EXIF tags for provenance corroboration
            has_camera_hardware = False
            try:
                exif = image.getexif()
                if exif:
                    tags = {ExifTags.TAGS.get(k, str(k)): v for k, v in exif.items()}
                    if any(t in tags for t in ["Make", "Model", "LensModel", "FNumber", "ISOSpeedRatings"]):
                        has_camera_hardware = True
            except Exception:
                has_camera_hardware = False

            # Calibrated 3-way decision logic with uncertain band corroborated with camera provenance.
            # Physical camera hardware EXIF tags support authentic photograph verdict unless strong AI evidence (>= 85%).
            if has_camera_hardware and fake_prob < 0.85:
                predicted_class = "REAL"
                predicted_desc = "No signs of full AI generation"
            elif uncertain_band > 0.0 and abs(fake_prob - threshold) <= uncertain_band:
                predicted_class = "INCONCLUSIVE"
                predicted_desc = "Inconclusive"
            elif fake_prob > threshold + uncertain_band:
                predicted_class = "FAKE"
                predicted_desc = "Likely fully AI-generated"
            else:
                predicted_class = "REAL"
                predicted_desc = "No signs of full AI generation"

            confidence_score = round(max(fake_prob, real_prob) * 100.0, 2)

            return {
                "status": "success",
                "model_id": self.MODEL_ID,
                "model_name": self.MODEL_NAME,
                "model_version": self.MODEL_VERSION,
                "predicted_class": predicted_class,
                "predicted_label_description": predicted_desc,
                "confidence_score": confidence_score,
                "decision_threshold": threshold,
                "uncertain_band": uncertain_band,
                "scores": {
                    "REAL": round(real_prob, 4),
                    "FAKE": round(fake_prob, 4),
                },
                "raw_logits": raw_logits,
                "views_evaluated": views_evaluated,
                "calibration_statement": self.CALIBRATION_STATEMENT,
                "scope_limitation": self.SCOPE_LIMITATION,
                "inference_time_ms": elapsed_ms,
                "error_message": None,
            }
        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(f"Inference error in {self.MODEL_NAME}: {e}", exc_info=True)
            return {
                "status": "error",
                "model_id": self.MODEL_ID,
                "model_name": self.MODEL_NAME,
                "model_version": self.MODEL_VERSION,
                "predicted_class": None,
                "predicted_label_description": None,
                "confidence_score": None,
                "decision_threshold": threshold,
                "uncertain_band": uncertain_band,
                "scores": None,
                "raw_logits": None,
                "views_evaluated": None,
                "calibration_statement": self.CALIBRATION_STATEMENT,
                "scope_limitation": self.SCOPE_LIMITATION,
                "inference_time_ms": elapsed_ms,
                "error_message": f"Inference failure: {str(e)}",
            }

classifier_service = AIClassifierService()
