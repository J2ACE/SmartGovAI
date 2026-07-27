"""FastAPI dependency providers for database sessions and authentication."""

from __future__ import annotations

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.auth.tokens import TokenType, decode_token
from app.config.settings import get_settings
from app.models import Officer
from app.models.enums import OfficerRole

# ---------------------------------------------------------------------------
# Database session factory
# Initialised lazily on first import so tests can override settings before
# the engine is built.
# ---------------------------------------------------------------------------

_engine = None
_SessionLocal = None


def _get_session_factory() -> sessionmaker:
    global _engine, _SessionLocal  # noqa: PLW0603
    if _SessionLocal is None:
        cfg = get_settings()
        if not cfg.database_url:
            raise RuntimeError("DATABASE_URL must be set.")
        _engine = create_engine(cfg.database_url)
        _SessionLocal = sessionmaker(bind=_engine, expire_on_commit=False)
    return _SessionLocal


def get_db_session() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy Session; commit on success, rollback on error."""
    factory = _get_session_factory()
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# ---------------------------------------------------------------------------
# OAuth2 bearer scheme (used for OpenAPI docs lock icon)
# ---------------------------------------------------------------------------

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---------------------------------------------------------------------------
# Current officer dependency
# ---------------------------------------------------------------------------

DbSession = Annotated[Session, Depends(get_db_session)]
_BearerToken = Annotated[str, Depends(_oauth2_scheme)]


def get_current_officer(token: _BearerToken, session: DbSession) -> Officer:
    """Decode the bearer token and return the corresponding active Officer."""
    from uuid import UUID as _UUID
    payload = decode_token(token, TokenType.ACCESS)
    officer_id_str: str | None = payload.get("sub")
    if not officer_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject.")
    try:
        officer_id = _UUID(officer_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject.")

    officer = session.scalar(select(Officer).where(Officer.id == officer_id))
    if officer is None or not officer.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Officer not found or inactive.")
    return officer


CurrentOfficer = Annotated[Officer, Depends(get_current_officer)]


# ---------------------------------------------------------------------------
# RBAC dependency factory
# ---------------------------------------------------------------------------

def require_role(*roles: OfficerRole):
    """Return a FastAPI dependency that enforces one of the given *roles*.

    Usage::

        @router.get("/admin", dependencies=[Depends(require_role(OfficerRole.DIVISION_HEAD))])
        def admin_endpoint(officer: CurrentOfficer) -> ...:
            ...
    """
    def _check(officer: CurrentOfficer) -> Officer:
        if officer.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {', '.join(r.value for r in roles)}.",
            )
        return officer

    return _check
