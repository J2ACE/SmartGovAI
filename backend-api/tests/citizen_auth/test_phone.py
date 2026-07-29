"""Unit tests for phone number normalization utility."""

import unittest

from app.utils.phone import normalize_phone_number


class TestPhoneNormalization(unittest.TestCase):
    def test_normalize_valid_indian_formats(self) -> None:
        expected = "+919876543210"

        inputs = [
            "+919876543210",
            "9876543210",
            "09876543210",
            "+91 98765 43210",
            "+91-98765-43210",
            "919876543210",
            "  +91 9876543210 ",
        ]

        for phone in inputs:
            with self.subTest(phone=phone):
                self.assertEqual(normalize_phone_number(phone), expected)

    def test_normalize_international_formats(self) -> None:
        self.assertEqual(normalize_phone_number("+1 (555) 019-2831"), "+15550192831")
        self.assertEqual(normalize_phone_number("+44 20 7946 0958"), "+442079460958")

    def test_normalize_invalid_inputs_raises_value_error(self) -> None:
        invalid_inputs = [
            "",
            "   ",
            "abcd",
            "123",  # Too short
            "+12345678901234567",  # Too long
            None,
        ]

        for invalid in invalid_inputs:
            with self.subTest(invalid=invalid):
                with self.assertRaises(ValueError):
                    normalize_phone_number(invalid)  # type: ignore[arg-type]
