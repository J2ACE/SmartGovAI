"""Citizen account model."""

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint


class Citizen(Base):
    __tablename__ = "citizens"

    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    complaints: Mapped[list["Complaint"]] = relationship(back_populates="citizen")
