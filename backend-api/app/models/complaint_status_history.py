"""Complaint status transition audit model."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Enum as SqlEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ComplaintStatus

if TYPE_CHECKING:
    from app.models.complaint import Complaint
    from app.models.officer import Officer


class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    complaint_id: Mapped[UUID] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    old_status: Mapped[ComplaintStatus | None] = mapped_column(SqlEnum(ComplaintStatus), nullable=True)
    new_status: Mapped[ComplaintStatus] = mapped_column(SqlEnum(ComplaintStatus), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_by: Mapped[UUID | None] = mapped_column(ForeignKey("officers.id"), nullable=True)
    complaint: Mapped["Complaint"] = relationship(back_populates="status_history")
    updated_by_officer: Mapped["Officer | None"] = relationship(back_populates="status_updates")
