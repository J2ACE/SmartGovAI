"""Complaint image metadata model."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint


class ComplaintImage(Base):
    __tablename__ = "complaint_images"

    complaint_id: Mapped[UUID] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    media_type: Mapped[str] = mapped_column(String(100), nullable=False)
    complaint: Mapped["Complaint"] = relationship(back_populates="images")
