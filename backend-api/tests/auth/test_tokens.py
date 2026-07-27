"""Unit tests for app.auth.tokens — no DB, no network."""

import time
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.auth.tokens import TokenType, create_access_token, create_refresh_token, decode_token

# Use deterministic test secrets so tests are independent of .env
_ACCESS_SECRET = "test-access-secret-32-bytes-long!!"
_REFRESH_SECRET = "test-refresh-secret-32-bytes-lon!"


def _patch_secrets(**kwargs):
    """Context manager that overrides settings for token tests."""
    defaults = {
        "jwt_secret": _ACCESS_SECRET,
        "jwt_refresh_secret": _REFRESH_SECRET,
        "jwt_access_expire_minutes": 15,
        "jwt_refresh_expire_days": 7,
    }
    defaults.update(kwargs)

    class _FakeSettings:
        def __getattr__(self, name):
            return defaults.get(name)

    return patch("app.auth.tokens.get_settings", return_value=_FakeSettings())


class TestAccessToken(unittest.TestCase):
    def test_round_trip(self) -> None:
        with _patch_secrets():
            token = create_access_token(subject="officer-uuid", role="DIVISION_HEAD")
            payload = decode_token(token, TokenType.ACCESS)

        self.assertEqual(payload["sub"], "officer-uuid")
        self.assertEqual(payload["role"], "DIVISION_HEAD")
        self.assertEqual(payload["type"], TokenType.ACCESS)

    def test_wrong_type_rejected(self) -> None:
        """An access token must not be accepted as a refresh token."""
        with _patch_secrets():
            access_token = create_access_token(subject="id", role="DIVISION_HEAD")
            with self.assertRaises(HTTPException) as ctx:
                decode_token(access_token, TokenType.REFRESH)
        self.assertEqual(ctx.exception.status_code, 401)

    def test_tampered_token_rejected(self) -> None:
        with _patch_secrets():
            token = create_access_token(subject="id", role="DIVISION_HEAD")
        tampered = token[:-4] + "XXXX"
        with _patch_secrets():
            with self.assertRaises(HTTPException) as ctx:
                decode_token(tampered, TokenType.ACCESS)
        self.assertEqual(ctx.exception.status_code, 401)


class TestRefreshToken(unittest.TestCase):
    def test_round_trip(self) -> None:
        with _patch_secrets():
            token = create_refresh_token(subject="officer-uuid")
            payload = decode_token(token, TokenType.REFRESH)

        self.assertEqual(payload["sub"], "officer-uuid")
        self.assertEqual(payload["type"], TokenType.REFRESH)

    def test_refresh_rejected_as_access(self) -> None:
        with _patch_secrets():
            refresh_token = create_refresh_token(subject="id")
            with self.assertRaises(HTTPException) as ctx:
                decode_token(refresh_token, TokenType.ACCESS)
        self.assertEqual(ctx.exception.status_code, 401)


class TestExpiredToken(unittest.TestCase):
    def test_expired_access_token_raises_401(self) -> None:
        with _patch_secrets(jwt_access_expire_minutes=0):
            token = create_access_token(subject="id", role="DIVISION_HEAD")
        # Token expires immediately; wait a tick
        time.sleep(1)
        with _patch_secrets():
            with self.assertRaises(HTTPException) as ctx:
                decode_token(token, TokenType.ACCESS)
        self.assertEqual(ctx.exception.status_code, 401)
