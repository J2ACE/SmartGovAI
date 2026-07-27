"""Authentication service — officer credential verification."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.password import verify_password
from app.models import Officer


# Single reusable 401 response; identical for "not found" and "wrong password"
# to prevent user-enumeration via timing or error message differences.
_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid email or password.",
    headers={"WWW-Authenticate": "Bearer"},
)


class AuthService:
    """Stateless service; pass a session per call."""

    @staticmethod
    def authenticate_officer(session: Session, *, email: str, password: str) -> Officer:
        """Return the matching active *Officer* or raise HTTP 401.

        Deliberately uses a uniform error message and always runs
        verify_password (even when the officer does not exist) to
        prevent timing side-channels.
        """
        officer = session.scalar(select(Officer).where(Officer.email == email))

        # Always call verify_password to avoid timing oracle even when not found.
        dummy_hash = "$2b$12$00000000000000000000000000000000000000000000000000000000"
        candidate_hash = officer.password_hash if officer is not None else dummy_hash

        if not verify_password(password, candidate_hash):
            raise _INVALID_CREDENTIALS

        if officer is None or not officer.is_active:
            raise _INVALID_CREDENTIALS

        return officer
