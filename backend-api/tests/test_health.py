import unittest

from fastapi.testclient import TestClient

from app.main import app


class HealthCheckTests(unittest.TestCase):
    def test_health_returns_healthy(self) -> None:
        with TestClient(app) as client:
            response = client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "healthy"})
