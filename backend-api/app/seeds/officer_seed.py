"""Seed predictable development officer accounts."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.password import hash_password
from app.models import Officer
from app.models.enums import OfficerRole
from app.seeds.master_seed import DEPARTMENT_NAMES, DIVISION_NAMES, MasterData


EMAIL_DOMAIN = "smartgovai.local"


def _slug(value: str) -> str:
    return value.lower().replace(" ", "-")





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
            password_hash=hash_password(password),
            role=role,
            division_id=division_id,
            department_id=department_id,
            is_active=True,
        )
        session.add(officer)
    elif not officer.password_hash.startswith("$2"):
        # Migrate legacy hash format (e.g., scrypt) to bcrypt on next seed run.
        officer.password_hash = hash_password(password)
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
