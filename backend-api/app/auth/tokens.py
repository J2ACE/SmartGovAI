"""JWT access and refresh token utilities.

Tokens carry a *type* claim so access tokens cannot be used as refresh
tokens and vice-versa.  Both are signed with separate secrets.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from enum import Enum

import jwt
from fastapi import HTTPException, status

from app.config.settings import get_settings


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


def create_access_token(subject: str, role: str) -> str:
    """Return a signed HS256 access token valid for *jwt_access_expire_minutes*."""
    cfg = get_settings()
    if not cfg.jwt_secret:
        raise RuntimeError("JWT_SECRET must be set to create tokens.")
    expires = _utcnow() + timedelta(minutes=cfg.jwt_access_expire_minutes)
    payload = {
        "sub": subject,
        "role": role,
        "type": TokenType.ACCESS,
        "exp": expires,
        "iat": _utcnow(),
    }
    return jwt.encode(payload, cfg.jwt_secret, algorithm="HS256")


def create_refresh_token(subject: str) -> str:
    """Return a signed HS256 refresh token valid for *jwt_refresh_expire_days*."""
    cfg = get_settings()
    if not cfg.jwt_refresh_secret:
        raise RuntimeError("JWT_REFRESH_SECRET must be set to create tokens.")
    expires = _utcnow() + timedelta(days=cfg.jwt_refresh_expire_days)
    payload = {
        "sub": subject,
        "type": TokenType.REFRESH,
        "exp": expires,
        "iat": _utcnow(),
    }
    return jwt.encode(payload, cfg.jwt_refresh_secret, algorithm="HS256")


def decode_token(token: str, expected_type: TokenType) -> dict:
    """Decode and validate a JWT.

    Raises HTTP 401 if the token is expired, malformed, or the wrong type.
    """
    cfg = get_settings()
    secret = cfg.jwt_secret if expected_type is TokenType.ACCESS else cfg.jwt_refresh_secret
    if not secret:
        raise RuntimeError("JWT secret must be set to decode tokens.")

    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise _invalid
    except jwt.PyJWTError:
        raise _invalid

    if payload.get("type") != expected_type:
        raise _invalid

    return payload
