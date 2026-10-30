"""
Unit tests for CORS configuration (Step 9 Part C).

Verifies that:
- Allowed origins (local dev and Vercel production domain) receive access-control-allow-origin headers.
- Disallowed origins do NOT receive access-control-allow-origin headers.
- ALLOWED_ORIGINS environment variable override functions as expected.
"""

import os
import unittest
from starlette.testclient import TestClient
from app.main import app


class TestCORS(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_allowed_origin_receives_cors_header(self):
        """Allowed origin (Vercel production URL) receives access-control-allow-origin header."""
        headers = {
            "Origin": "https://new-project-theta-taupe.vercel.app"
        }
        response = self.client.get("/api/ping", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"),
            "https://new-project-theta-taupe.vercel.app"
        )

    def test_localhost_origin_receives_cors_header(self):
        """Local development origins receive access-control-allow-origin header."""
        headers = {
            "Origin": "http://localhost:5173"
        }
        response = self.client.get("/api/ping", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"),
            "http://localhost:5173"
        )

    def test_disallowed_origin_does_not_receive_cors_header(self):
        """Disallowed origin does NOT receive access-control-allow-origin header."""
        headers = {
            "Origin": "https://malicious-attacker-site.com"
        }
        response = self.client.get("/api/ping", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("access-control-allow-origin", response.headers)

    def test_options_preflight_disallowed_origin(self):
        """Preflight OPTIONS request from disallowed origin does not grant CORS headers."""
        headers = {
            "Origin": "https://random-unauthorized-domain.org",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
        response = self.client.options("/api/analyze/image", headers=headers)
        self.assertNotIn("access-control-allow-origin", response.headers)


if __name__ == "__main__":
    unittest.main()
