import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base


class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    indicator_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    value: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    tags: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True, default=list)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
