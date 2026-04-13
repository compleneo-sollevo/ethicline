import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import CurrentUser, DbSession
from app.api.rbac import RequirePermission
from app.crud.crud_users import crud_user
from app.schemas.user import PasswordResetRequest, PasswordResetResponse, UserInvite, UserRead, UserStatusUpdate, UserUpdate
from app.services.audit_service import audit_service

router = APIRouter()


def _to_read(user) -> UserRead:
    """Convert ORM User to Pydantic inside async context to avoid greenlet errors."""
    return UserRead.model_validate(user)


@router.get("/")
async def list_users(
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:read"))],
) -> list[UserRead]:
    users = await crud_user.get_multi_with_roles(db)
    return [_to_read(u) for u in users]


@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_user(
    data: UserInvite,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:write"))],
):
    """Admin whitelists an email. Creates a pending user (no password). User must register at /register."""
    existing = await crud_user.get_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-Mail bereits registriert")
    user = await crud_user.create_pending_user(
        db, email=data.email, full_name=data.full_name, role_key=data.role_key
    )
    # Materialize ALL attributes NOW while still in async DB context
    result = {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "status": user.status,
        "totp_enabled": user.totp_enabled,
        "roles": [{"id": r.id, "key": r.key, "name": r.name} for r in user.roles],
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login_at": None,
    }
    await audit_service.log_user_action(
        db, actor_id=current_user.id, action="user.invited", target=user, details={"role_key": data.role_key}
    )
    await db.commit()
    return result


@router.get("/{user_id}")
async def get_user(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:read"))],
) -> UserRead:
    user = await crud_user.get_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")
    return _to_read(user)


@router.put("/{user_id}")
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:write"))],
):
    user = await crud_user.get_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")

    # Last-admin protection when changing roles
    if data.role_keys is not None:
        old_is_admin = any(r.key == "admin" for r in user.roles)
        new_is_admin = "admin" in data.role_keys
        if old_is_admin and not new_is_admin:
            admin_count = await crud_user.count_admins(db)
            if admin_count <= 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Der letzte Administrator kann nicht entfernt werden.")

    details = {}
    if data.full_name is not None:
        details["full_name"] = data.full_name
    if data.role_keys is not None:
        details["old_roles"] = [r.key for r in user.roles]
        details["new_roles"] = data.role_keys

    updated = await crud_user.update_user(db, user, full_name=data.full_name, role_keys=data.role_keys)
    await audit_service.log_user_action(db, actor_id=current_user.id, action="user.updated", target=updated, details=details)
    return _to_read(updated)


@router.put("/{user_id}/status")
async def update_user_status(
    user_id: uuid.UUID,
    data: UserStatusUpdate,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:delete"))],
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sie koennen sich nicht selbst deaktivieren.")

    user = await crud_user.get_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")

    if data.status == "disabled":
        is_admin = any(r.key == "admin" for r in user.roles)
        if is_admin:
            admin_count = await crud_user.count_admins(db)
            if admin_count <= 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Der letzte Administrator kann nicht deaktiviert werden.")
        updated = await crud_user.deactivate_user(db, user)
        await audit_service.log_user_action(
            db, actor_id=current_user.id, action="user.deactivated", target=updated, details={"old_status": "active"}
        )
    elif data.status == "active":
        updated = await crud_user.reactivate_user(db, user)
        await audit_service.log_user_action(
            db, actor_id=current_user.id, action="user.reactivated", target=updated, details={"old_status": user.status}
        )
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ungueltiger Status. Erlaubt: active, disabled")

    return _to_read(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)

async def delete_user(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:delete"))],
    confirm: bool = Query(False),
):
    if not confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bestaetigung erforderlich (?confirm=true)")

    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sie koennen sich nicht selbst loeschen.")

    user = await crud_user.get_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")

    is_admin = any(r.key == "admin" for r in user.roles)
    if is_admin:
        admin_count = await crud_user.count_admins(db)
        if admin_count <= 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Der letzte Administrator kann nicht geloescht werden.")

    await audit_service.log_user_action(
        db, actor_id=current_user.id, action="user.deleted", target=user
    )
    await crud_user.hard_delete_user(db, user)


@router.post("/{user_id}/reset-password", response_model=PasswordResetResponse)
async def reset_password(
    user_id: uuid.UUID,
    data: PasswordResetRequest,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:write"))],
):
    user = await crud_user.get_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")

    if len(data.temporary_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwort muss mindestens 8 Zeichen lang sein.")

    await crud_user.reset_password(db, user, data.temporary_password)
    await audit_service.log_user_action(
        db, actor_id=current_user.id, action="user.password_reset", target=user
    )
    return PasswordResetResponse(detail="Passwort wurde zurueckgesetzt")


@router.post("/{user_id}/reset-mfa")
async def reset_mfa(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:write"))],
):
    user = await crud_user.get_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Benutzer nicht gefunden")

    await crud_user.reset_totp(db, user_id)
    await audit_service.log_user_action(
        db, actor_id=current_user.id, action="user.mfa_reset", target=user
    )
    return {"detail": "2FA wurde zurueckgesetzt"}
