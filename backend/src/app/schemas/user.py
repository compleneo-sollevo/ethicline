import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class UserLogin(BaseModel):
    email: str
    password: str


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str


class UserInvite(BaseModel):
    email: str
    full_name: str
    role_key: str = "user"


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    key: str
    name: str


class PermissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: str
    description: str | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: str
    full_name: str
    is_active: bool
    status: str = "active"
    totp_enabled: bool
    roles: list[RoleRead] = []
    created_at: datetime
    last_login_at: datetime | None = None


class UserReadWithPermissions(UserRead):
    permissions: list[str] = []


class UserUpdate(BaseModel):
    full_name: str | None = None
    role_keys: list[str] | None = None


class UserStatusUpdate(BaseModel):
    status: str  # "active" | "disabled"


class PasswordResetRequest(BaseModel):
    temporary_password: str


class PasswordResetResponse(BaseModel):
    detail: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    access_token: str | None = None
    token_type: str | None = None
    requires_2fa: bool = False
    requires_2fa_setup: bool = False
    temp_token: str | None = None


class TwoFactorVerify(BaseModel):
    temp_token: str
    code: str


class TwoFactorSetupResponse(BaseModel):
    secret: str
    qr_code_base64: str
    otpauth_uri: str


class TwoFactorEnableRequest(BaseModel):
    temp_token: str
    code: str


class TwoFactorEnableResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    recovery_codes: list[str]
