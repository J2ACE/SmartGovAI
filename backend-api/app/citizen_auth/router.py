"""API router for citizen authentication endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db_session
from app.auth.schemas import TokenResponse
from app.auth.tokens import create_access_token, create_refresh_token
from app.citizen_auth.dependencies import CurrentCitizen
from app.citizen_auth.schemas import (
    CitizenMeResponse,
    RequestOTPRequest,
    RequestOTPResponse,
    VerifyOTPRequest,
)
from app.citizen_auth.service import CitizenAuthService, OTPService
from app.config.settings import get_settings

router = APIRouter(prefix="/citizen/auth", tags=["citizen-auth"])


@router.post("/request-otp", response_model=RequestOTPResponse, status_code=status.HTTP_200_OK)
def request_otp(
    body: RequestOTPRequest,
    session: Session = Depends(get_db_session),
) -> RequestOTPResponse:
    """Request a 6-digit OTP for citizen phone authentication."""
    normalized_phone, plain_otp = OTPService.request_otp(session, body.phone_number)
    cfg = get_settings()

    expires_in_seconds = cfg.otp_expire_minutes * 60
    is_development = (cfg.otp_provider or "").lower().strip() == "development"
    dev_otp = plain_otp if is_development else None

    return RequestOTPResponse(
        message="OTP sent successfully.",
        expires_in=expires_in_seconds,
        dev_otp=dev_otp,
    )


@router.post("/verify-otp", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def verify_otp(
    body: VerifyOTPRequest,
    session: Session = Depends(get_db_session),
) -> TokenResponse:
    """Verify citizen 6-digit OTP and issue JWT access + refresh tokens."""
    normalized_phone = OTPService.verify_otp(session, body.phone_number, body.otp)
    citizen = CitizenAuthService.get_or_create_citizen(session, normalized_phone)

    access_token = create_access_token(subject=str(citizen.id), role="CITIZEN")
    refresh_token = create_refresh_token(subject=str(citizen.id), role="CITIZEN")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.get("/me", response_model=CitizenMeResponse, status_code=status.HTTP_200_OK)
def citizen_me(citizen: CurrentCitizen) -> CitizenMeResponse:
    """Return the profile of the currently authenticated citizen."""
    return CitizenMeResponse.model_validate(citizen)
