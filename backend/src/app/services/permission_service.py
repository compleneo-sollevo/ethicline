from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger

logger = get_logger(__name__)

ADMIN_MARKER = "__admin__"


class PermissionService:
    async def get_user_permissions(self, db: AsyncSession, user_id: str) -> frozenset[str]:
        """Load all permissions for a user from DB. Admin users get ADMIN_MARKER."""
        # Check admin role first
        is_admin = (
            await db.execute(
                text(
                    "SELECT 1 FROM user_roles ur "
                    "JOIN roles r ON r.id = ur.role_id "
                    "WHERE ur.user_id = :uid AND r.key = 'admin' "
                    "LIMIT 1"
                ),
                {"uid": user_id},
            )
        ).fetchone()

        if is_admin:
            return frozenset([ADMIN_MARKER])

        rows = (
            await db.execute(
                text(
                    "SELECT DISTINCT p.name "
                    "FROM user_roles ur "
                    "JOIN role_permissions rp ON rp.role_id = ur.role_id "
                    "JOIN permissions p ON p.id = rp.permission_id "
                    "WHERE ur.user_id = :uid"
                ),
                {"uid": user_id},
            )
        ).fetchall()

        return frozenset(row[0] for row in rows)

    async def has_permission(self, db: AsyncSession, user_id: str, permission: str) -> bool:
        perms = await self.get_user_permissions(db, user_id)
        if ADMIN_MARKER in perms:
            return True
        return permission in perms

    async def has_any_permission(self, db: AsyncSession, user_id: str, permissions: list[str]) -> bool:
        perms = await self.get_user_permissions(db, user_id)
        if ADMIN_MARKER in perms:
            return True
        return any(p in perms for p in permissions)

    async def get_all_permissions_list(self, db: AsyncSession, user_id: str) -> list[str]:
        """Get permissions as a list (for API responses). Admin gets all permissions from DB."""
        perms = await self.get_user_permissions(db, user_id)
        if ADMIN_MARKER in perms:
            # Load all permissions for admin
            rows = (await db.execute(text("SELECT name FROM permissions"))).fetchall()
            return [row[0] for row in rows]
        return list(perms)


permission_service = PermissionService()
