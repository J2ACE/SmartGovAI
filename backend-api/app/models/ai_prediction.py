"""AI inference result model."""

from datetime import datetime
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import DateTime, Enum as SqlEnum, Float, ForeignKey, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import ComplaintCategory, Priority

if TYPE_CHECKING:
    from app.models.complaint import Complaint


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    complaint_id: Mapped[UUID] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[ComplaintCategory] = mapped_column(SqlEnum(ComplaintCategory), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[Priority] = mapped_column(SqlEnum(Priority), nullable=False)
    bounding_boxes: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, nullable=True)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    complaint: Mapped["Complaint"] = relationship(back_populates="ai_predictions")
