"""Municipal department model."""

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint
    from app.models.contractor import Contractor
    from app.models.officer import Officer


class Department(Base):
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    officers: Mapped[list["Officer"]] = relationship(back_populates="department")
    contractors: Mapped[list["Contractor"]] = relationship(back_populates="department")
    complaints: Mapped[list["Complaint"]] = relationship(back_populates="department")
