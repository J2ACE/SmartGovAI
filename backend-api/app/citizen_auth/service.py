"""OTP and Citizen Authentication services.

Handles 6-digit OTP generation, bcrypt hashing, 5-minute expiration,
atomic single-use verification with 5-attempt brute-force protection,
and automatic citizen account provisioning.
"""

from datetime import datetime, timedelta, timezone
import secrets

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.password import hash_password, verify_password
from app.citizen_auth.providers import get_otp_provider
from app.config.settings import get_settings
from app.models import Citizen, OTPRecord
from app.utils.phone import normalize_phone_number

_INVALID_OTP_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired OTP.",
    headers={"WWW-Authenticate": "Bearer"},
)


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


class OTPService:
    """Service handling OTP lifecycle: creation, dispatch, and atomic verification."""

    @staticmethod
    def request_otp(session: Session, raw_phone_number: str) -> tuple[str, str]:
        """Normalize phone, generate OTP, store bcrypt hash, and dispatch via provider.

        Returns tuple of (normalized_phone_number, plain_otp).
        """
        try:
            phone_number = normalize_phone_number(raw_phone_number)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format.",
            )

        cfg = get_settings()

        # Invalidate any previous unexpired unused OTP records for this phone
        previous_records = session.scalars(
            select(OTPRecord).where(
                OTPRecord.phone_number == phone_number,
                OTPRecord.is_used == False,  # noqa: E712
            )
        ).all()
        for rec in previous_records:
            rec.is_used = True

        # Generate a random numeric OTP of configured length
        digits = cfg.otp_length
        plain_otp = f"{secrets.randbelow(10**digits):0{digits}d}"
        hashed_otp = hash_password(plain_otp)
        expires_at = _utcnow() + timedelta(minutes=cfg.otp_expire_minutes)

        otp_record = OTPRecord(
            phone_number=phone_number,
            otp_hash=hashed_otp,
            expires_at=expires_at,
            failed_attempts=0,
            is_used=False,
        )
        session.add(otp_record)
        session.flush()

        # Dispatch via configured provider
        provider = get_otp_provider()
        provider.send_otp(phone_number, plain_otp)

        return phone_number, plain_otp

    @staticmethod
    def verify_otp(session: Session, raw_phone_number: str, otp: str) -> str:
        """Atomically verify an OTP for a normalized phone number.

        Enforces 5-minute expiration, max 5 failed attempts lockout,
        and immediate consumption upon success/lockout.
        Returns the normalized phone number. Always raises uniform 401 on any failure.
        """
        try:
            phone_number = normalize_phone_number(raw_phone_number)
        except ValueError:
            raise _INVALID_OTP_EXCEPTION

        cfg = get_settings()
        now = _utcnow()

        # Retrieve active unused OTP record for the phone number
        query = (
            select(OTPRecord)
            .where(
                OTPRecord.phone_number == phone_number,
                OTPRecord.is_used == False,  # noqa: E712
                OTPRecord.expires_at > now,
            )
            .order_by(OTPRecord.created_at.desc())
        )
        if session.bind and getattr(session.bind.dialect, "name", None) == "postgresql":
            query = query.with_for_update()

        record = session.scalar(query)

        if record is None:
            # Run dummy verify to mitigate timing side-channel
            dummy_hash = "$2b$12$00000000000000000000000000000000000000000000000000000000"
            verify_password(otp, dummy_hash)
            raise _INVALID_OTP_EXCEPTION

        # Lockout check
        if record.failed_attempts >= cfg.otp_max_attempts:
            record.is_used = True
            session.commit()
            raise _INVALID_OTP_EXCEPTION

        # Check bcrypt hash
        if not verify_password(otp, record.otp_hash):
            record.failed_attempts += 1
            if record.failed_attempts >= cfg.otp_max_attempts:
                record.is_used = True
            session.commit()
            raise _INVALID_OTP_EXCEPTION

        # Success: consume OTP immediately to prevent reuse
        record.is_used = True
        session.flush()
        return phone_number


class CitizenAuthService:
    """Service handling citizen entity retrieval and automatic registration."""

    @staticmethod
    def get_or_create_citizen(session: Session, phone_number: str) -> Citizen:
        """Find or create a verified Citizen record for the normalized phone number."""
        normalized_phone = normalize_phone_number(phone_number)
        citizen = session.scalar(select(Citizen).where(Citizen.phone_number == normalized_phone))
        if citizen is None:
            citizen = Citizen(
                phone_number=normalized_phone,
                full_name=None,
                is_verified=True,
            )
            session.add(citizen)
            session.flush()
        elif not citizen.is_verified:
            citizen.is_verified = True
            session.flush()

        return citizen
