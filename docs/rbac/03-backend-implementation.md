---
name: RBAC Backend-Implementation
description: PermissionService, RequirePermission-Dependency, Admin-Wildcard, Dependency-Chain
type: reference
tags: [rbac, backend, fastapi, dependency-injection, permission-service, ethicline]
related: [README.md, 02-permission-katalog.md]
---

# Backend-Implementation

## `PermissionService`

Datei: `backend/src/app/services/permission_service.py`

Zwei Haupt-Methoden:

```python
async def get_user_permissions(db, user_id) -> frozenset[str]:
    # 1. Check ob User Admin ist → return frozenset({"__admin__"})
    # 2. Sonst: alle Permissions über user_roles ∪ role_permissions laden
    # 3. Als frozenset zurückgeben (hashbar, immutable)
```

```python
def has_permission(permissions: frozenset[str], required: str) -> bool:
    return "__admin__" in permissions or required in permissions
```

Der `__admin__`-Marker ist ein interner String, kein echter Permission-
Eintrag in der DB. Er entsteht aus dem Shortcut in `get_user_permissions`
und wird vom `has_permission`-Check als Wildcard behandelt.

## `RequirePermission`-Dependency

Datei: `backend/src/app/api/rbac.py`

```python
def RequirePermission(permission: str):
    async def _checker(
        current_user: Annotated[User, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> None:
        perms = await permission_service.get_user_permissions(db, current_user.id)
        if not permission_service.has_permission(perms, permission):
            raise HTTPException(status_code=403, detail=f"Permission required: {permission}")
    return _checker
```

Verwendung im Route-Handler:

```python
@router.get("/")
async def list_users(
    current_user: CurrentUser,
    db: DbSession,
    _: None = Depends(RequirePermission("users:manage:read")),
) -> list[UserRead]:
    ...
```

## Dependency-Chain

```
FastAPI Request
    │
    ▼
OAuth2PasswordBearer (extrahiert Bearer-Token aus Authorization-Header)
    │
    ▼
get_current_user (decodiert JWT, lädt User mit Rollen via crud_user.get_with_roles)
    │
    ▼
RequirePermission("...") (fragt PermissionService, wirft 403)
    │
    ▼
Route-Handler
```

Jede dieser Dependencies kann selbst `401` (Token fehlt/ungültig) oder
`403` (keine Permission) werfen, die Fehler werden vom globalen
`error_handler` in `middleware/error_handler.py` gefangen und als
JSON-Response formatiert.

## `get_current_user` im Detail

Datei: `backend/src/app/api/dependencies.py`

- Extrahiert JWT via `OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")`.
- Decodiert HS256 mit `SECRET_KEY`, prüft Expiry.
- **Wichtig:** Wenn der Payload `"type": "temp_2fa"` enthält → `401`.
  Temp-Tokens sind ausschließlich für die 2FA-Schritte, sie dürfen keine
  geschützten Endpoints aufrufen.
- Lädt User via `crud_user.get_with_roles(user_id)` — eager-loaded Rollen
  und Permissions (über `lazy="selectin"`), damit nachfolgende Checks
  keine N+1-Queries produzieren.

## `__init__` und Singleton

`permission_service` ist in `services/permission_service.py` als
Modul-level-Singleton `permission_service = PermissionService()`
exportiert. Das erlaubt einfachen Import in `rbac.py` und `auth.py` ohne
Dependency-Injection-Aufwand.
