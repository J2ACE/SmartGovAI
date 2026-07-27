"""Authorized municipal officer model."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, Enum as SqlEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import OfficerRole

if TYPE_CHECKING:
    from app.models.complaint_status_history import ComplaintStatusHistory
    from app.models.contractor_assignment import ContractorAssignment
    from app.models.department import Department
    from app.models.division import Division


class Officer(Base):
    __tablename__ = "officers"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[OfficerRole] = mapped_column(SqlEnum(OfficerRole), nullable=False)
    division_id: Mapped[UUID] = mapped_column(ForeignKey("divisions.id"), nullable=False)
    department_id: Mapped[UUID | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    division: Mapped["Division"] = relationship(back_populates="officers")
    department: Mapped["Department | None"] = relationship(back_populates="officers")
    status_updates: Mapped[list["ComplaintStatusHistory"]] = relationship(back_populates="updated_by_officer")
    contractor_assignments: Mapped[list["ContractorAssignment"]] = relationship(back_populates="assigned_by_officer")
