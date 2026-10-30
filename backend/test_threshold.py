import os
import sys
import unittest
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.schemas.analysis import AIClassificationSchema
from app.services.classifier import AIClassifierService


class TestThresholdCalibration(unittest.TestCase):
    """
    Unit tests for Step 5: Decision threshold calibration and inconclusive band logic.
    """

    def setUp(self):
        # Clean env vars before each test
        for key in ["CLASSIFIER_BACKEND", "CLASSIFIER_FAKE_THRESHOLD", "CLASSIFIER_UNCERTAIN_BAND"]:
            if key in os.environ:
                del os.environ[key]

    def test_default_thresholds(self):
        service = AIClassifierService()
        # Default backend is smaug
        self.assertEqual(service.backend_key, "smaug")
        self.assertAlmostEqual(service.threshold, 0.50)
        self.assertAlmostEqual(service.uncertain_band, 0.10)

    def test_siglip_default_threshold(self):
        os.environ["CLASSIFIER_BACKEND"] = "siglip"
        service = AIClassifierService()
        self.assertEqual(service.backend_key, "siglip")
        self.assertAlmostEqual(service.threshold, 0.40)
        self.assertAlmostEqual(service.uncertain_band, 0.10)

    def test_env_var_overrides(self):
        os.environ["CLASSIFIER_FAKE_THRESHOLD"] = "0.35"
        os.environ["CLASSIFIER_UNCERTAIN_BAND"] = "0.15"
        service = AIClassifierService()
        self.assertAlmostEqual(service.threshold, 0.35)
        self.assertAlmostEqual(service.uncertain_band, 0.15)

    def _classify(self, fake_prob: float, threshold: float = 0.50, band: float = 0.10) -> str:
        if band > 0.0 and abs(fake_prob - threshold) <= band:
            return "INCONCLUSIVE"
        elif fake_prob > threshold + band:
            return "FAKE"
        else:
            return "REAL"

    def test_inconclusive_boundary_conditions(self):
        threshold = 0.50
        band = 0.10
        # Lower bound = 0.40, Upper bound = 0.60

        # Strictly above upper boundary
        self.assertEqual(self._classify(0.75, threshold, band), "FAKE")
        self.assertEqual(self._classify(0.61, threshold, band), "FAKE")

        # Upper boundary exact match
        self.assertEqual(self._classify(0.60, threshold, band), "INCONCLUSIVE")

        # Within the uncertainty window
        self.assertEqual(self._classify(0.55, threshold, band), "INCONCLUSIVE")
        self.assertEqual(self._classify(0.50, threshold, band), "INCONCLUSIVE")
        self.assertEqual(self._classify(0.45, threshold, band), "INCONCLUSIVE")

        # Lower boundary exact match
        self.assertEqual(self._classify(0.40, threshold, band), "INCONCLUSIVE")

        # Strictly below lower boundary
        self.assertEqual(self._classify(0.39, threshold, band), "REAL")
        self.assertEqual(self._classify(0.10, threshold, band), "REAL")
        self.assertEqual(self._classify(0.00, threshold, band), "REAL")

    def test_zero_uncertain_band(self):
        threshold = 0.50
        band = 0.0
        self.assertEqual(self._classify(0.51, threshold, band), "FAKE")
        self.assertEqual(self._classify(0.49, threshold, band), "REAL")

    def test_pydantic_schema_validation(self):
        # Validates that 'INCONCLUSIVE' is accepted by Pydantic schema
        for verdict in ["REAL", "FAKE", "INCONCLUSIVE"]:
            schema = AIClassificationSchema(
                model_id="abacusai/Smaug-AI-Image-Detector",
                model_name="Smaug AI Image Detector (Abacus AI)",
                status="success",
                predicted_class=verdict,
                calibration_statement="Test statement",
                scope_limitation="Test scope limitation",
                decision_threshold=0.50,
                uncertain_band=0.10,
            )
            self.assertEqual(schema.predicted_class, verdict)
            self.assertEqual(schema.decision_threshold, 0.50)
            self.assertEqual(schema.uncertain_band, 0.10)


if __name__ == "__main__":
    unittest.main()
