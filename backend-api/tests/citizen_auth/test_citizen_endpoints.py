"""Integration tests for /citizen/auth/* endpoints.

Tests request-otp, verify-otp, citizen profile /me, dev/prod OTP responses,
and cross-role token isolation against officer endpoints.
"""

from __future__ import annotations

import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.dependencies import get_db_session
from app.auth.password import hash_password
from app.auth.tokens import create_access_token
from app.main import app
from app.models import Base, Citizen, Officer
from app.models.enums import OfficerRole

_ACCESS_SECRET = "test-access-secret-32-bytes-long!!"
_REFRESH_SECRET = "test-refresh-secret-32-bytes-lon!"


class _FakeSettings:
    app_name = "SmartGovAI API"
    app_env = "test"
    log_level = "ERROR"
    database_url = "sqlite://"
    seed_officer_password = "irrelevant"
    cors_origins = ["*"]
    jwt_secret = _ACCESS_SECRET
    jwt_refresh_secret = _REFRESH_SECRET
    jwt_access_expire_minutes = 15
    jwt_refresh_expire_days = 7
    otp_provider = "development"
    otp_expire_minutes = 5
    otp_max_attempts = 5
    otp_length = 6

    def __getattr__(self, name):
        return None


_fake_settings = _FakeSettings()

_TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestSession = sessionmaker(bind=_TEST_ENGINE, expire_on_commit=False)

TEST_CITIZEN_PHONE = "+919876543210"
TEST_OFFICER_EMAIL = "officer.test@smartgovai.local"


def _setup_db() -> None:
    Base.metadata.create_all(_TEST_ENGINE)
    with _TestSession() as session:
        import uuid
        officer = session.query(Officer).filter_by(email=TEST_OFFICER_EMAIL).first()
        if officer is None:
            officer = Officer(
                id=uuid.uuid4(),
                email=TEST_OFFICER_EMAIL,
                password_hash=hash_password("Pass123!"),
                role=OfficerRole.DIVISION_HEAD,
                division_id=uuid.uuid4(),
                department_id=None,
                is_active=True,
            )
            session.add(officer)
            session.commit()


def _override_db_session():
    session = _TestSession()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


class TestCitizenEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        _setup_db()
        cls._settings_patcher = patch("app.citizen_auth.router.get_settings", return_value=_fake_settings)
        cls._settings_patcher2 = patch("app.citizen_auth.providers.get_settings", return_value=_fake_settings)
        cls._settings_patcher3 = patch("app.citizen_auth.service.get_settings", return_value=_fake_settings)
        cls._settings_patcher4 = patch("app.auth.tokens.get_settings", return_value=_fake_settings)

        cls._settings_patcher.start()
        cls._settings_patcher2.start()
        cls._settings_patcher3.start()
        cls._settings_patcher4.start()

        app.dependency_overrides[get_db_session] = _override_db_session
        cls.client = TestClient(app, raise_server_exceptions=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls._settings_patcher.stop()
        cls._settings_patcher2.stop()
        cls._settings_patcher3.stop()
        cls._settings_patcher4.stop()
        app.dependency_overrides.clear()

    # ------------------------------------------------------------------
    # Request OTP
    # ------------------------------------------------------------------

    def test_request_otp_dev_mode_includes_dev_otp(self) -> None:
        resp = self.client.post("/citizen/auth/request-otp", json={"phone_number": TEST_CITIZEN_PHONE})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["message"], "OTP sent successfully.")
        self.assertEqual(data["expires_in"], 300)
        self.assertIsNotNone(data["dev_otp"])
        self.assertEqual(len(data["dev_otp"]), 6)

    def test_request_otp_prod_mode_hides_dev_otp(self) -> None:
        prod_settings = _FakeSettings()
        prod_settings.otp_provider = "production"

        from app.citizen_auth.providers import MockOTPProvider

        with patch("app.citizen_auth.router.get_settings", return_value=prod_settings), \
             patch("app.citizen_auth.service.get_settings", return_value=prod_settings), \
             patch("app.citizen_auth.service.get_otp_provider", return_value=MockOTPProvider()):
            resp = self.client.post("/citizen/auth/request-otp", json={"phone_number": "+919123456789"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["message"], "OTP sent successfully.")
            self.assertEqual(data["expires_in"], 300)
            self.assertIsNone(data.get("dev_otp"))

    def test_request_otp_invalid_phone(self) -> None:
        resp = self.client.post("/citizen/auth/request-otp", json={"phone_number": "invalid"})
        self.assertEqual(resp.status_code, 400)

    # ------------------------------------------------------------------
    # Verify OTP & Token Issue
    # ------------------------------------------------------------------

    def test_verify_otp_valid_returns_jwt_tokens(self) -> None:
        req_resp = self.client.post("/citizen/auth/request-otp", json={"phone_number": TEST_CITIZEN_PHONE})
        dev_otp = req_resp.json()["dev_otp"]

        ver_resp = self.client.post("/citizen/auth/verify-otp", json={"phone_number": TEST_CITIZEN_PHONE, "otp": dev_otp})
        self.assertEqual(ver_resp.status_code, 200)
        data = ver_resp.json()
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)
        self.assertEqual(data["token_type"], "bearer")

    def test_verify_otp_invalid_returns_generic_401(self) -> None:
        self.client.post("/citizen/auth/request-otp", json={"phone_number": TEST_CITIZEN_PHONE})

        resp = self.client.post("/citizen/auth/verify-otp", json={"phone_number": TEST_CITIZEN_PHONE, "otp": "000000"})
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()["detail"], "Invalid or expired OTP.")

    # ------------------------------------------------------------------
    # Profile /me & Cross-Role Security
    # ------------------------------------------------------------------

    def test_citizen_me_authenticated(self) -> None:
        req_resp = self.client.post("/citizen/auth/request-otp", json={"phone_number": TEST_CITIZEN_PHONE})
        dev_otp = req_resp.json()["dev_otp"]
        tokens = self.client.post("/citizen/auth/verify-otp", json={"phone_number": TEST_CITIZEN_PHONE, "otp": dev_otp}).json()

        access_token = tokens["access_token"]
        me_resp = self.client.get("/citizen/auth/me", headers={"Authorization": f"Bearer {access_token}"})
        self.assertEqual(me_resp.status_code, 200)
        data = me_resp.json()
        self.assertEqual(data["phone_number"], TEST_CITIZEN_PHONE)
        self.assertTrue(data["is_verified"])

    def test_citizen_token_rejected_on_officer_endpoint(self) -> None:
        """Citizen token must be rejected when attempting to call officer /auth/me."""
        req_resp = self.client.post("/citizen/auth/request-otp", json={"phone_number": TEST_CITIZEN_PHONE})
        dev_otp = req_resp.json()["dev_otp"]
        tokens = self.client.post("/citizen/auth/verify-otp", json={"phone_number": TEST_CITIZEN_PHONE, "otp": dev_otp}).json()

        citizen_access_token = tokens["access_token"]
        officer_me_resp = self.client.get("/auth/me", headers={"Authorization": f"Bearer {citizen_access_token}"})
        self.assertEqual(officer_me_resp.status_code, 401)

    def test_officer_token_rejected_on_citizen_endpoint(self) -> None:
        """Officer token must be rejected when attempting to call /citizen/auth/me."""
        with _TestSession() as session:
            officer = session.query(Officer).filter_by(email=TEST_OFFICER_EMAIL).first()
            officer_token = create_access_token(subject=str(officer.id), role=officer.role.value)

        citizen_me_resp = self.client.get("/citizen/auth/me", headers={"Authorization": f"Bearer {officer_token}"})
        self.assertEqual(citizen_me_resp.status_code, 401)
