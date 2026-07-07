import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)

    # Network context
    source_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    destination_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    source_port: Mapped[Optional[int]] = mapped_column(nullable=True)
    destination_port: Mapped[Optional[int]] = mapped_column(nullable=True)

    # Host context
    hostname: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    user: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    process: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Content
    description: Mapped[str] = mapped_column(Text, nullable=False)
    raw_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # AI enrichment
    anomaly_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    mitre_technique_id: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    mitre_technique_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relations
    incident_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    organization_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), nullable=False, index=True
    )
    is_simulated: Mapped[bool] = mapped_column(default=False, nullable=False)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    __table_args__ = (
        Index("idx_events_org_timestamp", "organization_id", "timestamp"),
        Index("idx_events_severity_timestamp", "severity", "timestamp"),
    )
