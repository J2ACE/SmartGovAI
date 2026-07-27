"""Seed predictable development officer accounts."""

import base64
import hashlib
import secrets
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Officer
from app.models.enums import OfficerRole
from app.seeds.master_seed import DEPARTMENT_NAMES, DIVISION_NAMES, MasterData


EMAIL_DOMAIN = "smartgovai.local"


def _slug(value: str) -> str:
    return value.lower().replace(" ", "-")


def _hash_seed_password(password: str) -> str:
    """Return a salted scrypt password hash for development seed accounts.

    TODO(Task 2.5): Replace this seed-local helper with the centralized
    authentication/password utility once that utility is introduced.
    """
    salt = secrets.token_bytes(16)
    derived_key = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=2**14,
        r=8,
        p=1,
    )
    encoded_salt = base64.urlsafe_b64encode(salt).decode("ascii")
    encoded_key = base64.urlsafe_b64encode(derived_key).decode("ascii")
    return f"scrypt$16384$8$1${encoded_salt}${encoded_key}"


def _get_or_create_officer(
    session: Session,
    *,
    email: str,
    password: str,
    role: OfficerRole,
    division_id: UUID,
    department_id: UUID | None,
) -> Officer:
    officer = session.scalar(select(Officer).where(Officer.email == email))
    if officer is None:
        officer = Officer(
            email=email,
            password_hash=_hash_seed_password(password),
            role=role,
            division_id=division_id,
            department_id=department_id,
            is_active=True,
        )
        session.add(officer)
    return officer


def seed_officers(session: Session, master_data: MasterData, password: str) -> None:
    """Create five division heads and twenty department heads without duplicates."""
    for division_name in DIVISION_NAMES:
        division = master_data.divisions[division_name]
        division_slug = _slug(division_name)

        _get_or_create_officer(
            session,
            email=f"{division_slug}.division@{EMAIL_DOMAIN}",
            password=password,
            role=OfficerRole.DIVISION_HEAD,
            division_id=division.id,
            department_id=None,
        )

        for department_name in DEPARTMENT_NAMES:
            department = master_data.departments[department_name]
            _get_or_create_officer(
                session,
                email=f"{division_slug}.{_slug(department_name)}@{EMAIL_DOMAIN}",
                password=password,
                role=OfficerRole.DEPARTMENT_HEAD,
                division_id=division.id,
                department_id=department.id,
            )
