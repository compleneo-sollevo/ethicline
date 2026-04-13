from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.user import PermissionRead


class RoleReadWithPermissions(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    key: str
    name: str
    description: str | None = None
    created_at: datetime
    permissions: list[PermissionRead] = []


class RoleCreate(BaseModel):
    key: str
    name: str
    description: str | None = None
    permission_ids: list[int] = []


class RoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    permission_ids: list[int] | None = None
