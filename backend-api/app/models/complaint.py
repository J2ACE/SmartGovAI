"""Civic complaint model."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, Enum as SqlEnum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ComplaintCategory, ComplaintStatus, Priority

if TYPE_CHECKING:
    from app.models.ai_prediction import AIPrediction
    from app.models.citizen import Citizen
    from app.models.complaint_image import ComplaintImage
    from app.models.complaint_status_history import ComplaintStatusHistory
    from app.models.contractor_assignment import ContractorAssignment
    from app.models.department import Department
    from app.models.division import Division


class Complaint(Base):
    __tablename__ = "complaints"

    tracking_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    citizen_id: Mapped[UUID] = mapped_column(ForeignKey("citizens.id"), nullable=False)
    division_id: Mapped[UUID] = mapped_column(ForeignKey("divisions.id"), nullable=False)
    department_id: Mapped[UUID | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    user_category: Mapped[ComplaintCategory] = mapped_column(SqlEnum(ComplaintCategory), nullable=False)
    ai_category: Mapped[ComplaintCategory | None] = mapped_column(SqlEnum(ComplaintCategory), nullable=True)
    final_category: Mapped[ComplaintCategory | None] = mapped_column(SqlEnum(ComplaintCategory), nullable=True)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_priority: Mapped[Priority | None] = mapped_column(SqlEnum(Priority), nullable=True)
    final_priority: Mapped[Priority | None] = mapped_column(SqlEnum(Priority), nullable=True)
    status: Mapped[ComplaintStatus] = mapped_column(SqlEnum(ComplaintStatus), default=ComplaintStatus.SUBMITTED, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    citizen: Mapped["Citizen"] = relationship(back_populates="complaints")
    division: Mapped["Division"] = relationship(back_populates="complaints")
    department: Mapped["Department | None"] = relationship(back_populates="complaints")
    images: Mapped[list["ComplaintImage"]] = relationship(back_populates="complaint")
    status_history: Mapped[list["ComplaintStatusHistory"]] = relationship(back_populates="complaint")
    assignments: Mapped[list["ContractorAssignment"]] = relationship(back_populates="complaint")
    ai_predictions: Mapped[list["AIPrediction"]] = relationship(back_populates="complaint")
