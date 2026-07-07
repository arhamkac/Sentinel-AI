import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    scenario_id: Mapped[str] = mapped_column(String(100), nullable=False)
    scenario_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    events_generated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    incident_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), nullable=True
    )
    organization_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    config: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
