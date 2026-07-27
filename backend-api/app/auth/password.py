"""Password hashing utilities using bcrypt.

All password operations in SmartGovAI go through this module so the
algorithm can be swapped in one place if needed.
"""

import bcrypt

_WORK_FACTOR = 12


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*.

    The returned string is safe to store directly in the database;
    it embeds the salt and cost factor.
    """
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=_WORK_FACTOR)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches the stored *hashed* value.

    Uses a constant-time comparison internally (bcrypt.checkpw).
    Returns False (never raises) on any mismatch or malformed hash.
    """
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False
