import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser, DbSession
from app.api.rbac import RequirePermission
from app.core.security import (
    create_access_token,
    create_temp_token,
    decode_temp_token,
    generate_qr_code_base64,
    generate_recovery_codes,
    generate_totp_secret,
    generate_totp_uri,
    hash_recovery_code,
    verify_recovery_code,
    verify_totp,
)
from app.crud.crud_users import crud_user
from app.models.user import RecoveryCode, User
from app.schemas.user import (
    LoginResponse,
    RegisterRequest,
    Token,
    TwoFactorEnableRequest,
    TwoFactorEnableResponse,
    TwoFactorSetupResponse,
    TwoFactorVerify,
    UserLogin,
    UserReadWithPermissions,
)
from app.services.permission_service import permission_service

router = APIRouter()


@router.post("/register", response_model=LoginResponse)
async def register(data: RegisterRequest, db: DbSession):
    """Public endpoint. Only works if admin has whitelisted the email (created a pending user)."""
    user = await crud_user.get_by_email(db, data.email)

    # Generic error for both "not found" and "already active" to prevent email enumeration
    if not user or user.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registrierung nicht möglich. Kontaktieren Sie Ihren Administrator.",
        )

    # Activate user: set password + update name if provided
    await crud_user.activate_user(db, user, data.password)
    if data.full_name:
        user.full_name = data.full_name
        await db.flush()

    temp_token = create_temp_token(str(user.id))
    return LoginResponse(requires_2fa_setup=True, temp_token=temp_token)


@router.post("/login", response_model=LoginResponse)
async def login(data: UserLogin, db: DbSession):
    user = await crud_user.authenticate(db, email=data.email, password=data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültige E-Mail oder Passwort")

    if user.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bitte registrieren Sie sich zuerst unter /register.",
        )
    if user.status == "disabled" or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account ist deaktiviert")

    await crud_user.update_last_login(db, user)

    temp_token = create_temp_token(str(user.id))

    if user.totp_enabled:
        return LoginResponse(requires_2fa=True, temp_token=temp_token)

    # 2FA not set up yet — force setup
    return LoginResponse(requires_2fa_setup=True, temp_token=temp_token)


@router.post("/login/verify-2fa", response_model=Token)
async def verify_2fa(data: TwoFactorVerify, db: DbSession):
    try:
        user_id = decode_temp_token(data.temp_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    user = await crud_user.get_with_roles(db, uuid.UUID(user_id))
    if not user or not user.totp_enabled or not user.totp_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA not enabled")

    # Try TOTP code first
    if verify_totp(user.totp_secret, data.code):
        access_token = create_access_token(data={"sub": str(user.id)})
        return Token(access_token=access_token)

    # Try recovery code
    for rc in user.recovery_codes:
        if not rc.used and verify_recovery_code(data.code, rc.code_hash):
            rc.used = True
            await db.flush()
            access_token = create_access_token(data={"sub": str(user.id)})
            return Token(access_token=access_token)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid 2FA code")


@router.post("/mfa/setup", response_model=TwoFactorSetupResponse)
async def mfa_setup(data: TwoFactorVerify, db: DbSession):
    """Generate TOTP secret and QR code. Requires temp_token from login. Code field is ignored."""
    try:
        user_id = decode_temp_token(data.temp_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    user = await crud_user.get_with_roles(db, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    secret = generate_totp_secret()
    user.totp_secret = secret
    await db.flush()

    uri = generate_totp_uri(secret, user.email)
    qr_base64 = generate_qr_code_base64(uri)

    return TwoFactorSetupResponse(secret=secret, qr_code_base64=qr_base64, otpauth_uri=uri)


@router.post("/mfa/enable", response_model=TwoFactorEnableResponse)
async def mfa_enable(data: TwoFactorEnableRequest, db: DbSession):
    """Verify TOTP code and activate 2FA. Returns recovery codes."""
    try:
        user_id = decode_temp_token(data.temp_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    user = await crud_user.get_with_roles(db, uuid.UUID(user_id))
    if not user or not user.totp_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Run /mfa/setup first")

    if not verify_totp(user.totp_secret, data.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid TOTP code")

    # Activate 2FA
    user.totp_enabled = True

    # Generate recovery codes
    codes = generate_recovery_codes()
    for code in codes:
        rc = RecoveryCode(user_id=user.id, code_hash=hash_recovery_code(code))
        db.add(rc)
    await db.flush()

    access_token = create_access_token(data={"sub": str(user.id)})
    return TwoFactorEnableResponse(access_token=access_token, recovery_codes=codes)


@router.post("/mfa/reset/{user_id}", deprecated=True)
async def mfa_reset(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
    _perm: Annotated[None, Depends(RequirePermission("users:manage:write"))],
):
    """Deprecated: Use POST /api/v1/users/{user_id}/reset-mfa instead."""
    await crud_user.reset_totp(db, user_id)
    return {"detail": "2FA wurde zurueckgesetzt"}


@router.get("/me", response_model=UserReadWithPermissions)
async def get_me(current_user: CurrentUser, db: DbSession):
    permissions = await permission_service.get_all_permissions_list(db, str(current_user.id))
    return UserReadWithPermissions(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        status=current_user.status,
        totp_enabled=current_user.totp_enabled,
        roles=[{"id": r.id, "key": r.key, "name": r.name} for r in current_user.roles],
        permissions=permissions,
        created_at=current_user.created_at,
        last_login_at=current_user.last_login_at,
    )
