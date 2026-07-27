"""Pydantic I/O models for the auth endpoints."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel

from app.models.enums import OfficerRole


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class MeResponse(BaseModel):
    id: UUID
    email: str
    role: OfficerRole
    is_active: bool

    model_config = {"from_attributes": True}
