"""Unit tests for OTP provider abstraction and implementations."""

import unittest
from unittest.mock import patch

from app.citizen_auth.providers import MockOTPProvider, get_otp_provider


class TestOTPProviders(unittest.TestCase):
    def test_mock_provider_records_otp(self) -> None:
        provider = MockOTPProvider()
        phone = "+919876543210"
        otp = "654321"

        res = provider.send_otp(phone, otp)
        self.assertTrue(res)
        self.assertEqual(MockOTPProvider.last_otps.get(phone), otp)

    @patch("app.citizen_auth.providers.get_settings")
    def test_provider_factory_supported_values(self, mock_settings) -> None:
        for val in ["development", "mock", "test", "DEVELOPMENT"]:
            mock_settings.return_value.otp_provider = val
            provider = get_otp_provider()
            self.assertIsInstance(provider, MockOTPProvider)

    @patch("app.citizen_auth.providers.get_settings")
    def test_provider_factory_unknown_fails_fast(self, mock_settings) -> None:
        mock_settings.return_value.otp_provider = "unknown_sms_gateway"
        with self.assertRaises(ValueError) as ctx:
            get_otp_provider()
        self.assertIn("Unknown or unsupported OTP provider", str(ctx.exception))
