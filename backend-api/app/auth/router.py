"""Auth router — /auth/login, /auth/refresh, /auth/me."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import CurrentOfficer, get_db_session
from app.auth.schemas import LoginRequest, MeResponse, RefreshRequest, TokenResponse
from app.auth.service import AuthService
from app.auth.tokens import TokenType, create_access_token, create_refresh_token, decode_token
from app.models.enums import OfficerRole

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(
    body: LoginRequest,
    session: Session = Depends(get_db_session),
) -> TokenResponse:
    """Authenticate an officer and return access + refresh tokens."""
    officer = AuthService.authenticate_officer(session, email=body.email, password=body.password)
    access_token = create_access_token(subject=str(officer.id), role=officer.role.value)
    refresh_token = create_refresh_token(subject=str(officer.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def refresh(
    body: RefreshRequest,
    session: Session = Depends(get_db_session),
) -> TokenResponse:
    """Issue a new access token from a valid refresh token.

    The refresh token itself is *not* rotated in this task — rotation
    is a future concern once a token-revocation store is in place.
    """
    payload = decode_token(body.refresh_token, TokenType.REFRESH)
    officer_id_str: str | None = payload.get("sub")
    if not officer_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject.")

    from uuid import UUID as _UUID
    from sqlalchemy import select
    from app.models import Officer

    try:
        officer_id = _UUID(officer_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject.")

    officer = session.scalar(select(Officer).where(Officer.id == officer_id))
    if officer is None or not officer.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Officer not found or inactive.")

    access_token = create_access_token(subject=str(officer.id), role=officer.role.value)
    return TokenResponse(access_token=access_token, refresh_token=body.refresh_token)


@router.get("/me", response_model=MeResponse, status_code=status.HTTP_200_OK)
def me(officer: CurrentOfficer) -> MeResponse:
    """Return the profile of the currently authenticated officer."""
    return MeResponse.model_validate(officer)
