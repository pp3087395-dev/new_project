"""
Tests for honest failure behavior when neural model cannot load (Step 10 Part A).
"""

from PIL import Image
from starlette.testclient import TestClient

from app.main import app
from app.services.classifier import AIClassifierService, BaseClassifierBackend, classifier_service


class NonexistentModelBackend(BaseClassifierBackend):
    backend_key = "nonexistent"
    model_id = "nonexistent/model-that-does-not-exist"
    model_name = "Nonexistent Model"
    model_version = "0.0.0"

    def initialize(self, hf_token=None):
        raise RuntimeError("Repository 'nonexistent/model-that-does-not-exist' not found (404 Client Error)")

    def predict_fake_probability(self, image):
        raise RuntimeError("Model unavailable")


def test_honest_failure_when_model_cannot_load():
    """Verify that if the model cannot load (non-existent model), unavailable state is returned and no scores are invented."""
    service = AIClassifierService()
    service._backend = NonexistentModelBackend()
    service._backend_key = "nonexistent"
    service._is_initialized = False

    img = Image.new("RGB", (64, 64), color=(100, 100, 100))
    result = service.predict(img)

    assert result["status"] == "unavailable"
    assert result["predicted_class"] is None, "Must not predict FAKE or REAL when model unavailable"
    assert result["predicted_label_description"] is None
    assert result["confidence_score"] is None, "Must not invent confidence scores"
    assert result["scores"] is None, "Must not invent class probability distributions"
    assert result["raw_logits"] is None
    assert result["error_message"] is not None
    assert "nonexistent" in result["error_message"]


def test_api_honest_failure_when_classifier_unavailable():
    """Verify that /api/analyze/image returns honest unavailable state when classifier fails to load."""
    prev_backend = classifier_service._backend
    prev_backend_key = classifier_service._backend_key
    prev_initialized = classifier_service._is_initialized
    prev_error = classifier_service._init_error

    try:
        classifier_service._backend = NonexistentModelBackend()
        classifier_service._backend_key = "nonexistent"
        classifier_service._is_initialized = False
        classifier_service._init_error = "Model repository 'nonexistent/model' not found"

        client = TestClient(app)
        import io
        buf = io.BytesIO()
        Image.new("RGB", (64, 64), color=(150, 150, 150)).save(buf, format="JPEG")
        resp = client.post("/api/analyze/image", files={"file": ("test.jpg", buf.getvalue(), "image/jpeg")})
        assert resp.status_code == 200
        data = resp.json()
        ai = data.get("ai_classification")
        assert ai is not None
        assert ai["status"] == "unavailable"
        assert ai["predicted_class"] is None
        assert ai["scores"] is None
        assert ai["confidence_score"] is None
    finally:
        classifier_service._backend = prev_backend
        classifier_service._backend_key = prev_backend_key
        classifier_service._is_initialized = prev_initialized
        classifier_service._init_error = prev_error

