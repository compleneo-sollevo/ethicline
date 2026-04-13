import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

# Association tables
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="active")  # pending | active | disabled
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    totp_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    totp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC)
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # IMPORTANT: lazy="selectin" only works when loading FROM the DB, not on new objects.
    # Never use user.roles.append() on newly created User objects — it triggers a sync
    # lazy-load that crashes with MissingGreenlet. Use direct insert into user_roles instead.
    roles: Mapped[list["Role"]] = relationship(secondary=user_roles, back_populates="users", lazy="selectin")
    recovery_codes: Mapped[list["RecoveryCode"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class RecoveryCode(Base):
    __tablename__ = "recovery_codes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    code_hash: Mapped[str] = mapped_column(String(255))
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    user: Mapped["User"] = relationship(back_populates="recovery_codes")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    users: Mapped[list["User"]] = relationship(secondary=user_roles, back_populates="roles")
    permissions: Mapped[list["Permission"]] = relationship(
        secondary=role_permissions, back_populates="roles", lazy="selectin"
    )


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)  # e.g. "data:sales:read"
    category: Mapped[str] = mapped_column(String(50))  # e.g. "data", "users", "settings"
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    roles: Mapped[list["Role"]] = relationship(secondary=role_permissions, back_populates="permissions")
