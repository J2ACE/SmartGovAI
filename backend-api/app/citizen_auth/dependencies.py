"""FastAPI dependencies for citizen authentication and role verification."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db_session
from app.auth.tokens import TokenType, decode_token
from app.models import Citizen

_oauth2_citizen_scheme = OAuth2PasswordBearer(tokenUrl="/citizen/auth/verify-otp")

DbSession = Annotated[Session, Depends(get_db_session)]
_BearerToken = Annotated[str, Depends(_oauth2_citizen_scheme)]


def get_current_citizen(token: _BearerToken, session: DbSession) -> Citizen:
    """Decode the bearer token, verify role == 'CITIZEN', and return the Citizen instance."""
    payload = decode_token(token, TokenType.ACCESS)

    # Cross-role token security: strictly enforce role == "CITIZEN"
    if payload.get("role") != "CITIZEN":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject or role.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    citizen_id_str: str | None = payload.get("sub")
    if not citizen_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        citizen_id = UUID(citizen_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    citizen = session.scalar(select(Citizen).where(Citizen.id == citizen_id))
    if citizen is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Citizen not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return citizen


CurrentCitizen = Annotated[Citizen, Depends(get_current_citizen)]
