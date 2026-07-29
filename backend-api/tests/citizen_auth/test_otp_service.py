"""Unit tests for app.citizen_auth.service.OTPService.

Tests bcrypt hashing, 5-minute expiry, failed attempts lockout, and anti-reuse.
"""

from datetime import datetime, timedelta, timezone
import unittest

from fastapi import HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.password import verify_password
from app.citizen_auth.service import OTPService
from app.models import Base, OTPRecord


class TestOTPService(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine, expire_on_commit=False)

    def setUp(self) -> None:
        # Clean OTP records between tests
        with self.Session.begin() as session:
            session.query(OTPRecord).delete()

    def test_request_otp_creates_bcrypt_hashed_record(self) -> None:
        phone = "+919876543210"
        with self.Session() as session:
            norm_phone, plain_otp = OTPService.request_otp(session, phone)
            session.commit()

            self.assertEqual(norm_phone, phone)
            self.assertEqual(len(plain_otp), 6)
            self.assertTrue(plain_otp.isdigit())

            rec = session.scalar(select(OTPRecord).where(OTPRecord.phone_number == phone))
            self.assertIsNotNone(rec)
            self.assertTrue(rec.otp_hash.startswith("$2"))
            self.assertTrue(verify_password(plain_otp, rec.otp_hash))
            self.assertFalse(rec.is_used)
            self.assertEqual(rec.failed_attempts, 0)

    def test_verify_otp_success_consumes_record(self) -> None:
        phone = "+919876543210"
        with self.Session() as session:
            _, plain_otp = OTPService.request_otp(session, phone)
            session.commit()

        with self.Session() as session:
            verified_phone = OTPService.verify_otp(session, phone, plain_otp)
            session.commit()
            self.assertEqual(verified_phone, phone)

            rec = session.scalar(select(OTPRecord).where(OTPRecord.phone_number == phone))
            self.assertTrue(rec.is_used)

    def test_verify_otp_reused_record_rejected(self) -> None:
        phone = "+919876543210"
        with self.Session() as session:
            _, plain_otp = OTPService.request_otp(session, phone)
            session.commit()

        with self.Session() as session:
            OTPService.verify_otp(session, phone, plain_otp)
            session.commit()

        # Second verification attempt must fail with 401
        with self.Session() as session:
            with self.assertRaises(HTTPException) as ctx:
                OTPService.verify_otp(session, phone, plain_otp)
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertEqual(ctx.exception.detail, "Invalid or expired OTP.")

    def test_verify_otp_wrong_otp_increments_failed_attempts(self) -> None:
        phone = "+919876543210"
        with self.Session() as session:
            OTPService.request_otp(session, phone)
            session.commit()

        with self.Session() as session:
            with self.assertRaises(HTTPException):
                OTPService.verify_otp(session, phone, "000000")
            session.commit()

            rec = session.scalar(select(OTPRecord).where(OTPRecord.phone_number == phone))
            self.assertEqual(rec.failed_attempts, 1)
            self.assertFalse(rec.is_used)

    def test_verify_otp_lockout_after_max_failed_attempts(self) -> None:
        phone = "+919876543210"
        with self.Session() as session:
            _, plain_otp = OTPService.request_otp(session, phone)
            session.commit()

        # Perform 5 wrong attempts
        for i in range(5):
            with self.Session() as session:
                with self.assertRaises(HTTPException):
                    OTPService.verify_otp(session, phone, "000000")
                session.commit()

        with self.Session() as session:
            rec = session.scalar(select(OTPRecord).where(OTPRecord.phone_number == phone))
            self.assertEqual(rec.failed_attempts, 5)
            self.assertTrue(rec.is_used)

            # Even correct OTP must now fail
            with self.assertRaises(HTTPException) as ctx:
                OTPService.verify_otp(session, phone, plain_otp)
            self.assertEqual(ctx.exception.status_code, 401)

    def test_verify_otp_expired_record_rejected(self) -> None:
        phone = "+919876543210"
        with self.Session() as session:
            _, plain_otp = OTPService.request_otp(session, phone)
            # Expire record
            rec = session.scalar(select(OTPRecord).where(OTPRecord.phone_number == phone))
            rec.expires_at = datetime.now(tz=timezone.utc) - timedelta(minutes=10)
            session.commit()

        with self.Session() as session:
            with self.assertRaises(HTTPException) as ctx:
                OTPService.verify_otp(session, phone, plain_otp)
            self.assertEqual(ctx.exception.status_code, 401)
