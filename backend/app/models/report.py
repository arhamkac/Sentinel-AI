import uuid
from typing import Optional
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    incident_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    executive_summary: Mapped[str] = mapped_column(Text, nullable=False)
    technical_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timeline: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    recommendations: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    generated_by: Mapped[str] = mapped_column(String(255), nullable=False, default="AI")
