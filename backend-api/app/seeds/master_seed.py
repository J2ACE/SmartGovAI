"""Seed the SmartGovAI city, division, and department master data."""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import City, Department, Division


CITY_NAME = "Nagpur"
DIVISION_NAMES = ("North", "South", "East", "West", "Central")
DEPARTMENT_NAMES = ("Garbage", "Roads", "Water Drainage", "Street Lighting")


@dataclass(frozen=True)
class MasterData:
    """Database entities required by the officer seed."""

    city: City
    divisions: dict[str, Division]
    departments: dict[str, Department]


def seed_master_data(session: Session) -> MasterData:
    """Create required master data once and return the persisted entities."""
    city = session.scalar(select(City).where(City.name == CITY_NAME))
    if city is None:
        city = City(name=CITY_NAME)
        session.add(city)
        session.flush()

    divisions: dict[str, Division] = {}
    for name in DIVISION_NAMES:
        division = session.scalar(
            select(Division).where(
                Division.city_id == city.id,
                Division.name == name,
            )
        )
        if division is None:
            division = Division(city_id=city.id, name=name)
            session.add(division)
            session.flush()
        divisions[name] = division

    departments: dict[str, Department] = {}
    for name in DEPARTMENT_NAMES:
        department = session.scalar(select(Department).where(Department.name == name))
        if department is None:
            department = Department(name=name)
            session.add(department)
            session.flush()
        departments[name] = department

    return MasterData(city=city, divisions=divisions, departments=departments)
