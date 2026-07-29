"""Phone number normalization utility.

Provides a clean, isolated function to convert arbitrary phone number string inputs
into a single canonical format (E.164 standard format, e.g., +919876543210).
"""

import re


def normalize_phone_number(phone_number: str, default_country_code: str = "+91") -> str:
    """Normalize a phone number string into E.164 canonical format.

    Examples:
        "+919876543210"   -> "+919876543210"
        "9876543210"      -> "+919876543210"
        "09876543210"     -> "+919876543210"
        "+91 98765 43210" -> "+919876543210"
        "+1 (555) 019-28" -> "+155501928"

    Raises:
        ValueError: If the input is empty or cannot be parsed into a valid phone number.
    """
    if not phone_number or not isinstance(phone_number, str):
        raise ValueError("Invalid phone number format.")

    cleaned = phone_number.strip()
    if not cleaned:
        raise ValueError("Invalid phone number format.")

    has_leading_plus = cleaned.startswith("+")

    # Remove all non-digit characters
    digits_only = re.sub(r"\D", "", cleaned)

    if not digits_only:
        raise ValueError("Invalid phone number format.")

    # Handle Indian 10-digit / 11-digit (leading 0) phone numbers if no country code provided
    if not has_leading_plus:
        if len(digits_only) == 10:
            canonical = f"{default_country_code}{digits_only}"
        elif len(digits_only) == 11 and digits_only.startswith("0"):
            canonical = f"{default_country_code}{digits_only[1:]}"
        elif len(digits_only) == 12 and digits_only.startswith("91"):
            canonical = f"+{digits_only}"
        else:
            canonical = f"+{digits_only}"
    else:
        canonical = f"+{digits_only}"

    # Basic length validation for E.164 (country code + subscriber number: 8 to 15 digits total)
    pure_digits = canonical[1:]
    if len(pure_digits) < 8 or len(pure_digits) > 15:
        raise ValueError("Invalid phone number length.")

    return canonical
