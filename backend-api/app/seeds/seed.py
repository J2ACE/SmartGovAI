"""Command-line entry point for SmartGovAI master-data seeding."""

from dataclasses import dataclass

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from app.config.settings import get_settings
from app.models import City, Department, Division, Officer
from app.seeds.master_seed import seed_master_data
from app.seeds.officer_seed import seed_officers


@dataclass(frozen=True)
class SeedCounts:
    cities: int
    divisions: int
    departments: int
    officers: int


def _get_counts(session: Session) -> SeedCounts:
    return SeedCounts(
        cities=session.scalar(select(func.count()).select_from(City)) or 0,
        divisions=session.scalar(select(func.count()).select_from(Division)) or 0,
        departments=session.scalar(select(func.count()).select_from(Department)) or 0,
        officers=session.scalar(select(func.count()).select_from(Officer)) or 0,
    )


def run() -> SeedCounts:
    """Run master data then officer seeds in one transaction."""
    settings = get_settings()
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL must be set before running seeds.")
    if not settings.seed_officer_password:
        raise RuntimeError("SEED_OFFICER_PASSWORD must be set before running seeds.")

    engine = create_engine(settings.database_url)
    session_factory = sessionmaker(bind=engine)

    with session_factory.begin() as session:
        master_data = seed_master_data(session)
        seed_officers(session, master_data, settings.seed_officer_password)
        session.flush()
        return _get_counts(session)


def main() -> None:
    """Execute seeds and print the final record counts."""
    counts = run()
    print(
        "Seed complete: "
        f"cities={counts.cities}, divisions={counts.divisions}, "
        f"departments={counts.departments}, officers={counts.officers}"
    )


if __name__ == "__main__":
    main()
