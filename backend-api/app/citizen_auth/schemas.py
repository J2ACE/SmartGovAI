"""Pydantic DTO models for citizen authentication endpoints."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class RequestOTPRequest(BaseModel):
    phone_number: str = Field(..., description="Citizen phone number to send OTP")


class RequestOTPResponse(BaseModel):
    message: str
    expires_in: int = Field(..., description="Expiration time in seconds")
    dev_otp: str | None = Field(default=None, description="Included ONLY in development environment")


class VerifyOTPRequest(BaseModel):
    phone_number: str = Field(..., description="Citizen phone number")
    otp: str = Field(..., description="6-digit OTP string received by citizen")


class CitizenMeResponse(BaseModel):
    id: UUID
    phone_number: str
    full_name: str | None = None
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}
