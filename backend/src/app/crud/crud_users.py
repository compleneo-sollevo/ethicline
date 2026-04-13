import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from sqlalchemy import delete as sa_delete

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import RecoveryCode, Role, User, user_roles


class CRUDUser(CRUDBase[User]):
    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_with_roles(self, db: AsyncSession, user_id: uuid.UUID) -> User | None:
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_multi_with_roles(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> list[User]:
        result = await db.execute(
            select(User).options(selectinload(User.roles)).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def authenticate(self, db: AsyncSession, *, email: str, password: str) -> User | None:
        user = await self.get_by_email(db, email)
        if not user or not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def create_user(
        self, db: AsyncSession, *, email: str, password: str, full_name: str, role_key: str = "user"
    ) -> User:
        hashed = get_password_hash(password)
        user = User(email=email, hashed_password=hashed, full_name=full_name)
        db.add(user)
        await db.flush()

        role = await db.execute(select(Role).where(Role.key == role_key))
        role_obj = role.scalar_one_or_none()
        if role_obj:
            from app.models.user import user_roles
            await db.execute(user_roles.insert().values(user_id=user.id, role_id=role_obj.id))
            await db.flush()

        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user.id)
        )
        return result.scalar_one()

    async def create_pending_user(
        self, db: AsyncSession, *, email: str, full_name: str, role_key: str = "user"
    ) -> User:
        """Create a user without password (pending status). Admin whitelists the email."""
        user = User(email=email, hashed_password=None, full_name=full_name, status="pending")
        db.add(user)
        await db.flush()

        role = await db.execute(select(Role).where(Role.key == role_key))
        role_obj = role.scalar_one_or_none()
        if role_obj:
            # Insert into join table directly — avoids lazy-load on user.roles
            from app.models.user import user_roles
            await db.execute(user_roles.insert().values(user_id=user.id, role_id=role_obj.id))
            await db.flush()

        # Re-fetch with eager-loaded roles to avoid lazy-load greenlet errors
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user.id)
        )
        return result.scalar_one()

    async def activate_user(self, db: AsyncSession, user: User, password: str) -> User:
        """Set password and activate a pending user."""
        user.hashed_password = get_password_hash(password)
        user.status = "active"
        await db.flush()
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user.id)
        )
        return result.scalar_one()

    async def update_user(self, db: AsyncSession, user: User, *, full_name: str | None = None, role_keys: list[str] | None = None) -> User:
        if full_name is not None:
            user.full_name = full_name
        if role_keys is not None:
            result = await db.execute(select(Role).where(Role.key.in_(role_keys)))
            roles = list(result.scalars().all())
            user.roles = roles
        await db.flush()
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user.id)
        )
        return result.scalar_one()

    async def deactivate_user(self, db: AsyncSession, user: User) -> User:
        user.status = "disabled"
        user.is_active = False
        await db.flush()
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user.id)
        )
        return result.scalar_one()

    async def reactivate_user(self, db: AsyncSession, user: User) -> User:
        user.status = "active"
        user.is_active = True
        await db.flush()
        result = await db.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user.id)
        )
        return result.scalar_one()

    async def hard_delete_user(self, db: AsyncSession, user: User) -> None:
        await db.delete(user)
        await db.flush()

    async def reset_password(self, db: AsyncSession, user: User, temporary_password: str) -> None:
        user.hashed_password = get_password_hash(temporary_password)
        await db.flush()

    async def update_last_login(self, db: AsyncSession, user: User) -> None:
        user.last_login_at = datetime.now(UTC)
        await db.flush()

    async def count_admins(self, db: AsyncSession) -> int:
        result = await db.execute(
            select(func.count()).select_from(user_roles).join(Role, Role.id == user_roles.c.role_id).where(Role.key == "admin")
        )
        return result.scalar_one()

    async def reset_totp(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        """Remove TOTP secret and recovery codes so user must re-setup 2FA."""
        user = await self.get_with_roles(db, user_id)
        if user:
            user.totp_secret = None
            user.totp_enabled = False
            await db.execute(sa_delete(RecoveryCode).where(RecoveryCode.user_id == user_id))
            await db.flush()


crud_user = CRUDUser(User)
