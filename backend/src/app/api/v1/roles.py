from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import CurrentUser, DbSession
from app.api.rbac import RequirePermission
from app.crud.crud_roles import crud_role
from app.schemas.role import RoleCreate, RoleReadWithPermissions, RoleUpdate
from app.schemas.user import PermissionRead
from app.services.audit_service import audit_service

router = APIRouter()


@router.get("/", response_model=list[RoleReadWithPermissions])
async def list_roles(
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("roles:manage:read"))],
):
    return await crud_role.get_all_with_permissions(db)


@router.get("/permissions", response_model=list[PermissionRead])
async def list_permissions(
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("roles:manage:read"))],
):
    return await crud_role.get_all_permissions(db)


@router.get("/{role_id}", response_model=RoleReadWithPermissions)
async def get_role(
    role_id: int,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("roles:manage:read"))],
):
    role = await crud_role.get_with_permissions(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rolle nicht gefunden")
    return role


@router.post("/", response_model=RoleReadWithPermissions, status_code=status.HTTP_201_CREATED)
async def create_role(
    data: RoleCreate,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("roles:manage:write"))],
):
    existing = await crud_role.get_by_key(db, data.key)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Rolle mit diesem Key existiert bereits")

    role = await crud_role.create_role(
        db, key=data.key, name=data.name, description=data.description, permission_ids=data.permission_ids
    )
    await audit_service.log_role_action(
        db, actor_id=current_user.id, action="role.created", target=role,
        details={"permission_ids": data.permission_ids},
    )
    return await crud_role.get_with_permissions(db, role.id)


@router.put("/{role_id}", response_model=RoleReadWithPermissions)
async def update_role(
    role_id: int,
    data: RoleUpdate,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("roles:manage:write"))],
):
    role = await crud_role.get_with_permissions(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rolle nicht gefunden")

    updated = await crud_role.update_role(
        db, role, name=data.name, description=data.description, permission_ids=data.permission_ids
    )
    await audit_service.log_role_action(
        db, actor_id=current_user.id, action="role.updated", target=updated,
        details={"name": data.name, "permission_ids": data.permission_ids},
    )
    return await crud_role.get_with_permissions(db, updated.id)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: int,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("roles:manage:write"))],
):
    role = await crud_role.get_with_permissions(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rolle nicht gefunden")

    if role.key == "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Die Admin-Rolle kann nicht geloescht werden.")

    user_count = await crud_role.count_users_with_role(db, role_id)
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rolle hat {user_count} zugewiesene Benutzer und kann nicht geloescht werden.",
        )

    await audit_service.log_role_action(
        db, actor_id=current_user.id, action="role.deleted", target=role
    )
    await db.delete(role)
    await db.flush()
