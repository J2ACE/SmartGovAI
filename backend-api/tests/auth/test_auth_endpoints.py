"""Integration tests for /auth endpoints using an in-memory SQLite DB.

No network connection to Neon is needed.  The tests override:
  - get_db_session → SQLite in-memory session (StaticPool, shared connection)
  - get_settings   → fixed secrets (so tokens are verifiable without .env)
"""

from __future__ import annotations

import unittest
from collections.abc import Generator
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.dependencies import get_db_session
from app.auth.password import hash_password
from app.main import app
from app.models import Base, Officer
from app.models.enums import OfficerRole

# ---------------------------------------------------------------------------
# Fixed test configuration — independent of .env
# ---------------------------------------------------------------------------

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

    def __getattr__(self, name):
        return None


_fake_settings = _FakeSettings()

# ---------------------------------------------------------------------------
# In-memory SQLite test engine — StaticPool shares one connection across
# all sessions so tables created in setUpClass are visible to every request.
# ---------------------------------------------------------------------------

_TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestSession = sessionmaker(bind=_TEST_ENGINE, expire_on_commit=False)

TEST_EMAIL = "north.division@smartgovai.local"
TEST_PASSWORD = "TestPass@123"
TEST_ROLE = OfficerRole.DIVISION_HEAD


def _setup_db() -> None:
    """Create tables and insert a test officer."""
    Base.metadata.create_all(_TEST_ENGINE)
    with _TestSession() as session:
        existing = session.query(Officer).filter_by(email=TEST_EMAIL).first()
        if existing is None:
            # We need a minimal valid division reference; SQLite has no FK enforcement by default.
            import uuid
            officer = Officer(
                id=uuid.uuid4(),
                email=TEST_EMAIL,
                password_hash=hash_password(TEST_PASSWORD),
                role=TEST_ROLE,
                division_id=uuid.uuid4(),  # FK not enforced in SQLite
                department_id=None,
                is_active=True,
            )
            session.add(officer)
            session.commit()


def _override_db_session() -> Generator[Session, None, None]:
    session = _TestSession()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Test class
# ---------------------------------------------------------------------------

class TestAuthEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        _setup_db()
        # Patch settings everywhere tokens and dependencies read them
        cls._settings_patcher = patch("app.auth.tokens.get_settings", return_value=_fake_settings)
        cls._settings_patcher.start()
        # Override the DB session dependency
        app.dependency_overrides[get_db_session] = _override_db_session
        cls.client = TestClient(app, raise_server_exceptions=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls._settings_patcher.stop()
        app.dependency_overrides.clear()

    # ------------------------------------------------------------------
    # Login
    # ------------------------------------------------------------------

    def test_login_valid_credentials(self) -> None:
        resp = self.client.post("/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)
        self.assertEqual(data["token_type"], "bearer")

    def test_login_invalid_password(self) -> None:
        resp = self.client.post("/auth/login", json={"email": TEST_EMAIL, "password": "wrong!"})
        self.assertEqual(resp.status_code, 401)

    def test_login_unknown_email(self) -> None:
        resp = self.client.post("/auth/login", json={"email": "nobody@example.com", "password": "x"})
        self.assertEqual(resp.status_code, 401)

    def test_login_missing_fields(self) -> None:
        resp = self.client.post("/auth/login", json={"email": TEST_EMAIL})
        self.assertEqual(resp.status_code, 422)

    # ------------------------------------------------------------------
    # /me
    # ------------------------------------------------------------------

    def _get_access_token(self) -> str:
        resp = self.client.post("/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        return resp.json()["access_token"]

    def test_me_authenticated(self) -> None:
        token = self._get_access_token()
        resp = self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["email"], TEST_EMAIL)
        self.assertEqual(data["role"], TEST_ROLE.value)
        self.assertTrue(data["is_active"])

    def test_me_unauthenticated(self) -> None:
        resp = self.client.get("/auth/me")
        self.assertEqual(resp.status_code, 401)

    def test_me_invalid_token(self) -> None:
        resp = self.client.get("/auth/me", headers={"Authorization": "Bearer not.a.token"})
        self.assertEqual(resp.status_code, 401)

    def test_me_with_refresh_token_rejected(self) -> None:
        """Refresh token must not work on /me (access-only endpoint)."""
        resp = self.client.post("/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        refresh_token = resp.json()["refresh_token"]
        resp2 = self.client.get("/auth/me", headers={"Authorization": f"Bearer {refresh_token}"})
        self.assertEqual(resp2.status_code, 401)

    # ------------------------------------------------------------------
    # /refresh
    # ------------------------------------------------------------------

    def test_refresh_valid(self) -> None:
        login_resp = self.client.post("/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        refresh_token = login_resp.json()["refresh_token"]

        resp = self.client.post("/auth/refresh", json={"refresh_token": refresh_token})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # New access token must be present and be a well-formed JWT (three dot-separated parts)
        self.assertIn("access_token", data)
        self.assertEqual(data["access_token"].count("."), 2, "Expected a JWT with three parts")
        # Refresh token is re-issued unchanged (no rotation yet)
        self.assertEqual(data["refresh_token"], refresh_token)

    def test_refresh_with_access_token_rejected(self) -> None:
        access_token = self._get_access_token()
        resp = self.client.post("/auth/refresh", json={"refresh_token": access_token})
        self.assertEqual(resp.status_code, 401)

    def test_refresh_with_garbage_rejected(self) -> None:
        resp = self.client.post("/auth/refresh", json={"refresh_token": "garbage"})
        self.assertEqual(resp.status_code, 401)
