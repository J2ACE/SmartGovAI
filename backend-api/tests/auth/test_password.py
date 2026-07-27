"""Unit tests for app.auth.password — no DB, no network."""

import unittest

from app.auth.password import hash_password, verify_password


class TestHashPassword(unittest.TestCase):
    def test_hash_is_bcrypt_format(self) -> None:
        hashed = hash_password("secret")
        # bcrypt hashes always start with $2b$ (or $2a$)
        self.assertTrue(hashed.startswith("$2"), f"Expected bcrypt hash, got: {hashed[:10]}")

    def test_hash_is_not_plain_text(self) -> None:
        hashed = hash_password("secret")
        self.assertNotEqual(hashed, "secret")

    def test_same_password_produces_different_hashes(self) -> None:
        """bcrypt uses a random salt each call."""
        self.assertNotEqual(hash_password("same"), hash_password("same"))


class TestVerifyPassword(unittest.TestCase):
    def test_correct_password_returns_true(self) -> None:
        hashed = hash_password("correct-horse-battery-staple")
        self.assertTrue(verify_password("correct-horse-battery-staple", hashed))

    def test_wrong_password_returns_false(self) -> None:
        hashed = hash_password("right-password")
        self.assertFalse(verify_password("wrong-password", hashed))

    def test_empty_password_does_not_raise(self) -> None:
        hashed = hash_password("nonempty")
        self.assertFalse(verify_password("", hashed))

    def test_malformed_hash_returns_false(self) -> None:
        self.assertFalse(verify_password("anything", "not-a-valid-hash"))
