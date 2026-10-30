"""
Unit tests for AI-edit provenance clues and honest verdict decoupling (Step 8b).

Checks required:
(a) a JPEG with an XMP packet containing `trainedAlgorithmicMedia` is flagged
(b) a JPEG with `Software = "Adobe Photoshop"` shows the tool string
(c) a plain image with no metadata returns the "stripped" note
(d) the classifier verdict is identical with and without provenance data
"""

import io
import struct
import unittest
import pytest
from PIL import Image

from app.services.provenance import inspect_provenance
from app.services.detector import detector_service


class TestProvenanceAndHonestLabels(unittest.TestCase):

    def _inject_xmp_into_jpeg(self, raw_jpeg: bytes, xmp_str: str) -> bytes:
        """Helper to inject an embedded APP1 XMP packet into existing JPEG bytes."""
        payload = b"http://ns.adobe.com/xap/1.0/\x00" + xmp_str.encode("utf-8")
        length = len(payload) + 2
        app1_segment = b"\xff\xe1" + struct.pack(">H", length) + payload
        # Insert right after SOI marker (0xFFD8)
        return raw_jpeg[:2] + app1_segment + raw_jpeg[2:]

    def test_a_xmp_trained_algorithmic_media_flagged(self):
        """Check (a): a JPEG with XMP containing trainedAlgorithmicMedia is flagged."""
        xmp_xml = """<x:xmpmeta xmlns:x="adobe:ns:meta/">
          <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/">
              <Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>
            </rdf:Description>
          </rdf:RDF>
        </x:xmpmeta>"""

        buf = io.BytesIO()
        Image.new("RGB", (64, 64), color=(120, 150, 180)).save(buf, format="JPEG")
        jpeg_bytes = self._inject_xmp_into_jpeg(buf.getvalue(), xmp_xml)
        pil_img = Image.open(io.BytesIO(jpeg_bytes))

        prov = inspect_provenance(jpeg_bytes, pil_img)

        self.assertTrue(prov.ai_source_declared, "ai_source_declared must be True")
        self.assertEqual(prov.declared_source_type, "trainedAlgorithmicMedia")
        self.assertTrue(any("trainedAlgorithmicMedia" in note for note in prov.notes))

    def test_b_jpeg_software_photoshop_shows_tool_string(self):
        """Check (b): a JPEG with Software = 'Adobe Photoshop' shows the tool string."""
        img = Image.new("RGB", (64, 64), color=(200, 180, 160))
        exif = Image.Exif()
        # EXIF Tag 305 is Software
        exif[305] = "Adobe Photoshop 2024 (Windows)"

        buf = io.BytesIO()
        img.save(buf, format="JPEG", exif=exif)
        jpeg_bytes = buf.getvalue()
        pil_img = Image.open(io.BytesIO(jpeg_bytes))

        prov = inspect_provenance(jpeg_bytes, pil_img)

        self.assertTrue(any("Adobe Photoshop" in t for t in prov.tool_strings), 
                        f"Expected Photoshop in tool_strings, got: {prov.tool_strings}")
        # Also, since Photoshop is detected, ai_source_declared may be True or false depending on keyword
        # "Photoshop" is in AI_TOOL_KEYWORDS as potential editing tool

    def test_c_plain_image_no_metadata_returns_stripped_note(self):
        """Check (c): a plain image with no metadata returns the 'stripped' note."""
        img = Image.new("RGB", (64, 64), color=(100, 100, 100))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_bytes = buf.getvalue()
        pil_img = Image.open(io.BytesIO(png_bytes))

        prov = inspect_provenance(png_bytes, pil_img)

        expected_note = "No provenance data found. This is common after WhatsApp, screenshots or re-saving, and does not show the image is real or fake."
        self.assertIn(expected_note, prov.notes)
        self.assertFalse(prov.ai_source_declared)
        self.assertFalse(prov.c2pa_present)

    @pytest.mark.model
    def test_d_verdict_identical_with_and_without_provenance_data(self):
        """Check (d): the classifier verdict is identical with and without provenance data."""
        # 1. Plain image without any provenance
        base_img = Image.new("RGB", (128, 128), color=(150, 140, 130))
        buf_plain = io.BytesIO()
        base_img.save(buf_plain, format="JPEG")
        plain_bytes = buf_plain.getvalue()

        # 2. Same image with AI metadata injected
        xmp_xml = """<x:xmpmeta xmlns:x="adobe:ns:meta/">
          <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/">
              <Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>
            </rdf:Description>
          </rdf:RDF>
        </x:xmpmeta>"""
        prov_bytes = self._inject_xmp_into_jpeg(plain_bytes, xmp_xml)

        # Run full analysis on both
        resp_plain = detector_service.analyze_image(plain_bytes, "test_plain.jpg")
        resp_prov = detector_service.analyze_image(prov_bytes, "test_prov.jpg")

        # Provenance should differ
        self.assertFalse(resp_plain.provenance.ai_source_declared)
        self.assertTrue(resp_prov.provenance.ai_source_declared)

        # Verdict and classifier outputs MUST be identical
        if resp_plain.ai_classification and resp_prov.ai_classification:
            self.assertEqual(resp_plain.ai_classification.predicted_class, 
                             resp_prov.ai_classification.predicted_class)
            self.assertEqual(resp_plain.ai_classification.predicted_label_description, 
                             resp_prov.ai_classification.predicted_label_description)
            self.assertAlmostEqual(resp_plain.ai_classification.scores["FAKE"], 
                                   resp_prov.ai_classification.scores["FAKE"], places=4)
            self.assertAlmostEqual(resp_plain.ai_classification.scores["REAL"], 
                                   resp_prov.ai_classification.scores["REAL"], places=4)
            self.assertEqual(resp_plain.ai_classification.confidence_score, 
                             resp_prov.ai_classification.confidence_score)



if __name__ == "__main__":
    unittest.main()
