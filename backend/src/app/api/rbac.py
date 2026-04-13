from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.models.user import User
from app.services.permission_service import permission_service


class RequirePermission:
    """FastAPI dependency that checks if the current user has a specific permission."""

    def __init__(self, permission: str):
        self.permission = permission

    async def __call__(
        self,
        current_user: Annotated[User, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> None:
        has_perm = await permission_service.has_permission(db, str(current_user.id), self.permission)
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {self.permission}",
            )


class RequireAnyPermission:
    """FastAPI dependency that checks if the current user has at least one of the given permissions."""

    def __init__(self, permissions: list[str]):
        self.permissions = permissions

    async def __call__(
        self,
        current_user: Annotated[User, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> None:
        has_perm = await permission_service.has_any_permission(db, str(current_user.id), self.permissions)
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"One of these permissions required: {', '.join(self.permissions)}",
            )
