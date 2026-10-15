from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120), default="My farm")
    state: Mapped[str] = mapped_column(String(80))
    district: Mapped[str] = mapped_column(String(100))
    village: Mapped[str | None] = mapped_column(String(100), nullable=True)
    area_acres: Mapped[float] = mapped_column(Float)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    soil_ph: Mapped[float | None] = mapped_column(Float, nullable=True)
    season: Mapped[str | None] = mapped_column(String(20), nullable=True)
    nitrogen: Mapped[float | None] = mapped_column(Float, nullable=True)
    phosphorus: Mapped[float | None] = mapped_column(Float, nullable=True)
    potassium: Mapped[float | None] = mapped_column(Float, nullable=True)
    irrigation: Mapped[str | None] = mapped_column(String(40), nullable=True)
    previous_crops: Mapped[str | None] = mapped_column(String(255), nullable=True)
    budget_inr: Mapped[float | None] = mapped_column(Float, nullable=True)
    owner: Mapped["User"] = relationship(back_populates="farms")
