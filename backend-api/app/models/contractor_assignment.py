"""Contractor assignment model."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import AssignmentStatus

if TYPE_CHECKING:
    from app.models.complaint import Complaint
    from app.models.contractor import Contractor
    from app.models.officer import Officer


class ContractorAssignment(Base):
    __tablename__ = "contractor_assignments"

    complaint_id: Mapped[UUID] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    contractor_id: Mapped[UUID] = mapped_column(ForeignKey("contractors.id"), nullable=False)
    assigned_by: Mapped[UUID | None] = mapped_column(ForeignKey("officers.id"), nullable=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status: Mapped[AssignmentStatus] = mapped_column(
        SqlEnum(AssignmentStatus), default=AssignmentStatus.ASSIGNED, nullable=False
    )
    complaint: Mapped["Complaint"] = relationship(back_populates="assignments")
    contractor: Mapped["Contractor"] = relationship(back_populates="assignments")
    assigned_by_officer: Mapped["Officer | None"] = relationship(back_populates="contractor_assignments")
