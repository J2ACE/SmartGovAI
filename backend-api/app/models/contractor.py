"""Contractor model."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, Enum as SqlEnum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ContractorType

if TYPE_CHECKING:
    from app.models.contractor_assignment import ContractorAssignment
    from app.models.department import Department
    from app.models.division import Division


class Contractor(Base):
    __tablename__ = "contractors"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    type: Mapped[ContractorType] = mapped_column(SqlEnum(ContractorType), nullable=False)
    availability: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    division_id: Mapped[UUID] = mapped_column(ForeignKey("divisions.id"), nullable=False)
    department_id: Mapped[UUID] = mapped_column(ForeignKey("departments.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    division: Mapped["Division"] = relationship(back_populates="contractors")
    department: Mapped["Department"] = relationship(back_populates="contractors")
    assignments: Mapped[list["ContractorAssignment"]] = relationship(back_populates="contractor")
