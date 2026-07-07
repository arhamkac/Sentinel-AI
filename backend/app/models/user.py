import uuid
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)

    users: Mapped[list["User"]] = relationship("User", back_populates="organization")
    incidents: Mapped[list["Incident"]] = relationship(  # type: ignore[name-defined]
        "Incident", back_populates="organization"
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="analyst")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    organization_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("organizations.id"), nullable=False
    )

    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")
