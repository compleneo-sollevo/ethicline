from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.user import Permission, Role, role_permissions, user_roles


class CRUDRole(CRUDBase[Role]):
    async def get_with_permissions(self, db: AsyncSession, role_id: int) -> Role | None:
        result = await db.execute(
            select(Role).options(selectinload(Role.permissions)).where(Role.id == role_id)
        )
        return result.scalar_one_or_none()

    async def get_all_with_permissions(self, db: AsyncSession) -> list[Role]:
        result = await db.execute(
            select(Role).options(selectinload(Role.permissions))
        )
        return list(result.scalars().all())

    async def get_by_key(self, db: AsyncSession, key: str) -> Role | None:
        result = await db.execute(select(Role).where(Role.key == key))
        return result.scalar_one_or_none()

    async def create_role(
        self, db: AsyncSession, *, key: str, name: str, description: str | None = None, permission_ids: list[int] | None = None
    ) -> Role:
        role = Role(key=key, name=name, description=description)
        db.add(role)
        await db.flush()

        if permission_ids:
            result = await db.execute(select(Permission).where(Permission.id.in_(permission_ids)))
            role.permissions = list(result.scalars().all())
            await db.flush()

        await db.refresh(role)
        return role

    async def update_role(
        self, db: AsyncSession, role: Role, *, name: str | None = None, description: str | None = None, permission_ids: list[int] | None = None
    ) -> Role:
        if name is not None:
            role.name = name
        if description is not None:
            role.description = description
        if permission_ids is not None:
            result = await db.execute(select(Permission).where(Permission.id.in_(permission_ids)))
            role.permissions = list(result.scalars().all())
        await db.flush()
        await db.refresh(role)
        return role

    async def count_users_with_role(self, db: AsyncSession, role_id: int) -> int:
        result = await db.execute(
            select(func.count()).select_from(user_roles).where(user_roles.c.role_id == role_id)
        )
        return result.scalar_one()

    async def get_all_permissions(self, db: AsyncSession) -> list[Permission]:
        result = await db.execute(select(Permission).order_by(Permission.category, Permission.name))
        return list(result.scalars().all())


crud_role = CRUDRole(Role)
