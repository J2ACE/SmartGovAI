"""City model."""

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.division import Division


class City(Base):
    __tablename__ = "cities"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    divisions: Mapped[list["Division"]] = relationship(back_populates="city")
