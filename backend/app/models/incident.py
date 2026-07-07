import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from app.db.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open", index=True)

    # AI-generated content
    threat_narrative: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    executive_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    predicted_next_steps: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    recommendations: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)

    # Affected entities
    affected_assets: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True, default=list)
    affected_users: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True, default=list)
    mitre_techniques: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True, default=list)

    # Metadata
    event_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    assigned_to: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True)
    organization_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False, index=True
    )
    is_simulated: Mapped[bool] = mapped_column(default=False, nullable=False)

    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped["Organization"] = relationship(  # type: ignore[name-defined]
        "Organization", back_populates="incidents"
    )
