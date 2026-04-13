---
name: Permission-Katalog
description: Alle seed-Permissions in ethicLine inkl. Zuordnung zu Endpoints
type: reference
tags: [rbac, permissions, katalog, ethicline]
related: [README.md, 01-rollenkatalog.md, 03-backend-implementation.md]
---

# Permission-Katalog

## Seed-Permissions

| Permission | Kategorie | Beschreibung |
|---|---|---|
| `dashboard:read` | `dashboard` | Dashboard einsehen |
| `users:manage:read` | `users` | Benutzer auflisten und Details lesen |
| `users:manage:write` | `users` | Benutzer einladen, bearbeiten, löschen |
| `roles:manage:read` | `roles` | Rollen auflisten |
| `roles:manage:write` | `roles` | Rollen anlegen, bearbeiten, löschen |
| `settings:system:read` | `settings` | Systemeinstellungen einsehen |
| `settings:system:write` | `settings` | Systemeinstellungen ändern |

Gesamt: **7 Permissions** als minimaler Start-Satz. Erweiterung über neue
Alembic-Migration.

## Rolle ↔ Permission

| | `dashboard:read` | `users:manage:*` | `roles:manage:*` | `settings:system:*` |
|---|---|---|---|---|
| `admin` | ✓ (Wildcard) | ✓ | ✓ | ✓ |
| `user` | ✓ | – | – | – |

## Endpoint-Mapping

| Endpoint | Benötigte Permission |
|---|---|
| `GET /api/v1/auth/me` | (authentifiziert, keine spezielle Permission) |
| `GET /api/v1/users/` | `users:manage:read` |
| `POST /api/v1/users/invite` | `users:manage:write` |
| `PATCH /api/v1/users/{id}` | `users:manage:write` |
| `DELETE /api/v1/users/{id}` | `users:manage:write` |
| `PATCH /api/v1/users/{id}/status` | `users:manage:write` |
| `POST /api/v1/users/{id}/reset-password` | `users:manage:write` |
| `POST /api/v1/users/{id}/reset-totp` | `users:manage:write` |
| `GET /api/v1/roles/` | `roles:manage:read` |
| `POST /api/v1/roles/` | `roles:manage:write` |
| `PATCH /api/v1/roles/{id}` | `roles:manage:write` |
| `DELETE /api/v1/roles/{id}` | `roles:manage:write` |

Dashboard-Permissionen (`dashboard:read`) werden aktuell **nur im
Frontend** für Nav-Filtering verwendet. Das leere Dummy-Dashboard selbst
prüft lediglich, ob der User überhaupt eingeloggt ist.

## Neue Permission hinzufügen

1. Neue Alembic-Migration `003_add_perm_<name>.py`:

   ```python
   conn.execute(text(
     "INSERT INTO permissions (name, category, description) "
     "VALUES ('reports:read', 'reports', 'Reports einsehen')"
   ))
   ```

2. Ggf. zu einer Nicht-Admin-Rolle hinzufügen:

   ```python
   conn.execute(text(
     "INSERT INTO role_permissions (role_id, permission_id) "
     "SELECT r.id, p.id FROM roles r, permissions p "
     "WHERE r.key = 'user' AND p.name = 'reports:read'"
   ))
   ```

3. Im Endpoint verwenden: `RequirePermission("reports:read")`.

4. Im Frontend-Navigation filtern:
   `{ permission: "reports:read" }` im `NavItem`.
