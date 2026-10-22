import logging
import threading
import time
from typing import Dict, Any, Optional
import numpy as np
from PIL import Image

try:
    import onnxruntime as ort
    from huggingface_hub import hf_hub_download
except ImportError:
    ort = None
    hf_hub_download = None

logger = logging.getLogger("truthlens.classifier")

class AIClassifierService:
    """
    Dedicated AI-Generated Image Classification Service using ONNX Runtime on CPU.
    Model: onnx-community/ai-image-detection-ONNX (fine-tuned ViT on CIFAKE dataset).
    
    Architecture:
    - Base: Vision Transformer (google/vit-base-patch16-224-in21k)
    - Fine-tuned: dima806/ai_vs_real_image_detection on CIFAKE dataset
    - Model: capcheck/ai-image-detection (Apache 2.0)
    - Converted: onnx-community/ai-image-detection-ONNX (model_quantized.onnx)
    """

    MODEL_REPO_ID = "onnx-community/ai-image-detection-ONNX"
    MODEL_FILENAME = "onnx/model_quantized.onnx"
    MODEL_ID = "onnx-community/ai-image-detection-ONNX"
    MODEL_NAME = "CapCheck ViT AI-Generated Image Detector (ONNX Quantized)"
    MODEL_VERSION = "1.0.0"

    # Documented class mapping from config.json:
    # "id2label": {"0": "REAL", "1": "FAKE"}
    ID2LABEL = {0: "REAL", 1: "FAKE"}

    # Documented preprocessing from preprocessor_config.json:
    # size: (224, 224), resample: 2 (Bilinear), rescale: 1/255.0, mean: [0.5, 0.5, 0.5], std: [0.5, 0.5, 0.5]
    TARGET_SIZE = (224, 224)
    IMAGE_MEAN = np.array([0.5, 0.5, 0.5], dtype=np.float32)
    IMAGE_STD = np.array([0.5, 0.5, 0.5], dtype=np.float32)

    CALIBRATION_STATEMENT = (
        "Scores are computed via softmax normalization of raw Vision Transformer output logits. "
        "These represent relative model activations and are not calibrated Bayesian or frequentist probabilities."
    )
    SCOPE_LIMITATION = (
        "This model is specialized for detecting AI-generated synthetic imagery versus real photographs (CIFAKE benchmark). "
        "It has NOT been trained or verified as a universal facial manipulation or face-swap detector. "
        "Novel generative diffusion models, heavy social media compression, or adversarial artifacts may degrade accuracy."
    )

    def __init__(self):
        self._session: Optional[Any] = None
        self._model_path: Optional[str] = None
        self._is_initialized: bool = False
        self._init_error: Optional[str] = None
        self._lock = threading.Lock()

    @property
    def is_available(self) -> bool:
        return self._is_initialized and self._session is not None

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
        Loads and initializes the ONNX inference session once.
        Reuses cached weights if available, or downloads from Hugging Face Hub if missing.
        Thread-safe singleton pattern.
        """
        if self._is_initialized:
            return True

        with self._lock:
            if self._is_initialized:
                return True

            if ort is None or hf_hub_download is None:
                self._init_error = "onnxruntime or huggingface_hub is not installed."
                logger.error(self._init_error)
                return False

            try:
                logger.info(f"Resolving model weights for {self.MODEL_REPO_ID} ({self.MODEL_FILENAME})...")
                # hf_hub_download checks local cache before attempting download
                model_path = hf_hub_download(
                    repo_id=self.MODEL_REPO_ID,
                    filename=self.MODEL_FILENAME
                )
                self._model_path = model_path
                logger.info(f"Model file verified at {model_path}")

                # Configure CPU execution provider
                sess_options = ort.SessionOptions()
                sess_options.intra_op_num_threads = 4
                sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

                self._session = ort.InferenceSession(
                    model_path,
                    sess_options=sess_options,
                    providers=["CPUExecutionProvider"]
                )

                self._is_initialized = True
                self._init_error = None
                logger.info("CapCheck ViT ONNX Classifier initialized successfully on CPU.")
                return True

            except Exception as e:
                self._init_error = f"Failed to initialize AI model: {str(e)}"
                self._is_initialized = False
                self._session = None
                logger.error(self._init_error, exc_info=True)
                return False

    def preprocess_image(self, image: Image.Image) -> np.ndarray:
        """
        Executes documented ViTFeatureExtractor preprocessing:
        1. Convert image to RGB (stripping alpha or grayscale if needed)
        2. Resize to 224x224 with Bilinear resampling (PIL code 2)
        3. Convert to float32 NumPy array
        4. Rescale: pixel / 255.0
        5. Standardize: (arr - [0.5, 0.5, 0.5]) / [0.5, 0.5, 0.5] (range [-1.0, 1.0])
        6. Transpose to NCHW layout: (1, 3, 224, 224)
        """
        # 1. Convert to RGB
        rgb_img = image.convert("RGB")

        # 2. Resize to 224x224 with Bilinear interpolation
        resized = rgb_img.resize(self.TARGET_SIZE, Image.Resampling.BILINEAR)

        # 3. Convert to float32
        arr = np.asarray(resized, dtype=np.float32)

        # 4 & 5. Rescale and Normalize
        arr = (arr / 255.0 - self.IMAGE_MEAN) / self.IMAGE_STD

        # 6. Transpose (H, W, C) -> (C, H, W) and expand batch dimension
        transposed = np.transpose(arr, (2, 0, 1))
        input_tensor = np.expand_dims(transposed, axis=0)

        return input_tensor

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        """
        Performs genuine neural inference on the preprocessed image.
        Never invents predictions or confidence scores.
        Returns honest status, actual class logits, and softmax scores.
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
            input_tensor = self.preprocess_image(image)

            # Run ONNX inference
            outputs = self._session.run(None, {"pixel_values": input_tensor})
            logits = outputs[0][0]  # Shape: (2,)

            # Stable softmax computation
            shifted_logits = logits - np.max(logits)
            exp_logits = np.exp(shifted_logits)
            softmax_probs = exp_logits / np.sum(exp_logits)

            real_score = float(softmax_probs[0])
            fake_score = float(softmax_probs[1])
            real_logit = float(logits[0])
            fake_logit = float(logits[1])

            # Class mapping: 0 -> REAL, 1 -> FAKE
            predicted_class = "FAKE" if fake_score >= real_score else "REAL"
            predicted_desc = (
                "AI-Generated Media (Synthetic)"
                if predicted_class == "FAKE"
                else "Authentic Photograph / Real-World Media"
            )

            # Primary confidence score corresponds to predicted class probability
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
