---
name: RBAC-Übersicht
description: Role-Based Access Control in ethicLine — Rollen, Permissions, Dependency-Chain, relevante Dateien
type: reference
tags: [rbac, roles, permissions, authorization, ethicline]
related: [../auth/README.md, 01-rollenkatalog.md, 02-permission-katalog.md, 03-backend-implementation.md]
---

# RBAC — Übersicht

ethicLine verwendet ein klassisches Rollen-Berechtigungs-Modell:

```
User ─┬── Role ─┬── Permission
      └──────── └──────────
```

- **User** kann mehrere **Rollen** haben (`user_roles` Many-to-Many).
- **Rolle** sammelt mehrere **Permissions** (`role_permissions` Many-to-Many).
- **Permission** ist ein String im Format `<domain>:<resource>:<action>`,
  z. B. `users:manage:read`.
- Die Rolle `admin` hat einen **Sonder-Check**: Sie gilt als Wildcard, d. h.
  `hasPermission(x)` gibt für Admins immer `true` zurück. Siehe
  `backend/src/app/services/permission_service.py`.

## Seed-Stand

Aktuell sind zwei Rollen und sieben Permissions per Migration
`002_seed_rbac.py` angelegt. Details:

- [01-rollenkatalog.md](./01-rollenkatalog.md)
- [02-permission-katalog.md](./02-permission-katalog.md)

Der Seed-Admin `marcel.bosse@compleneo.de` hat die Rolle `admin` und damit
effektiv alle Permissions.

## Code-Dateien

| Datei | Zweck |
|---|---|
| `backend/src/app/models/user.py` | `Role`, `Permission`, `user_roles`, `role_permissions` Tables |
| `backend/src/app/services/permission_service.py` | Permission-Lookup inkl. Admin-Wildcard |
| `backend/src/app/api/rbac.py` | `RequirePermission("…")` Dependency-Factory |
| `backend/src/app/api/v1/roles.py` | Rollen-CRUD Endpoints |
| `backend/src/app/crud/crud_roles.py` | DB-Layer für Rollen |
| `backend/src/app/db/migrations/versions/002_seed_rbac.py` | Initialer Seed |
| `frontend/src/stores/auth-store.ts` | Client-seitiges `hasPermission()` |
| `frontend/src/config/navigation.ts` | Nav-Items mit `permission`-Feld werden gefiltert |

## Wie werden Permissions durchgesetzt?

**Backend** — per FastAPI-Dependency:

```python
@router.get("/sensitive")
async def sensitive(
    current_user: CurrentUser,
    _: None = Depends(RequirePermission("settings:system:read")),
):
    ...
```

Das `RequirePermission`-Dependency lädt die User-Permissions via
`PermissionService.get_user_permissions`, prüft auf Admin-Wildcard und
wirft sonst `403` wenn die angeforderte Permission fehlt.

**Frontend** — via Zustand-Store:

```tsx
const { hasPermission } = useAuthStore();
{hasPermission("users:manage:read") && <UsersMenu />}
```

`hasPermission` liest aus dem `user.permissions`-Array, das beim Login
von `/auth/me` kommt. Admins bekommen serverseitig eine spezielle
Markierung (`__admin__`) und der Store gibt für sie überall `true`
zurück.

## Siehe auch

- [03-backend-implementation.md](./03-backend-implementation.md) — Details zur `PermissionService`-Logik und Dependency-Chain.
