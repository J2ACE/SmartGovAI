"""OTP provider abstraction and implementations.

Defines a clean interface for dispatching OTPs and a development mock provider.
The provider factory fails fast if an unknown provider type is configured.
"""

from abc import ABC, abstractmethod
from typing import ClassVar

from app.config.settings import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class BaseOTPProvider(ABC):
    """Abstract interface for OTP delivery mechanisms (SMS, Mock, etc.)."""

    @abstractmethod
    def send_otp(self, phone_number: str, otp: str) -> bool:
        """Deliver the OTP to the specified normalized phone number."""
        pass


class MockOTPProvider(BaseOTPProvider):
    """Development mock provider that logs OTPs and records them in memory for testing."""

    # In-memory record of the last sent OTP per normalized phone number
    last_otps: ClassVar[dict[str, str]] = {}

    def send_otp(self, phone_number: str, otp: str) -> bool:
        MockOTPProvider.last_otps[phone_number] = otp
        logger.info(f"[MOCK OTP PROVIDER] Sent OTP '{otp}' to phone '{phone_number}'")
        return True


def get_otp_provider() -> BaseOTPProvider:
    """Factory returning the configured OTP provider instance.

    Fails fast with ValueError if an unknown provider value is set.
    """
    cfg = get_settings()
    provider_type = (cfg.otp_provider or "").lower().strip()

    if provider_type in ("development", "mock", "test"):
        return MockOTPProvider()

    raise ValueError(f"Unknown or unsupported OTP provider: '{cfg.otp_provider}'")
