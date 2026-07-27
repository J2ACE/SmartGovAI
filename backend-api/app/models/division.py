"""Administrative division model."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.city import City
    from app.models.complaint import Complaint
    from app.models.contractor import Contractor
    from app.models.officer import Officer


class Division(Base):
    __tablename__ = "divisions"

    city_id: Mapped[UUID] = mapped_column(ForeignKey("cities.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped["City"] = relationship(back_populates="divisions")
    officers: Mapped[list["Officer"]] = relationship(back_populates="division")
    contractors: Mapped[list["Contractor"]] = relationship(back_populates="division")
    complaints: Mapped[list["Complaint"]] = relationship(back_populates="division")
