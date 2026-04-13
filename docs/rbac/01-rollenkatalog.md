---
name: Rollen-Katalog
description: Seed-Rollen in ethicLine — admin, user
type: reference
tags: [rbac, roles, katalog, ethicline]
related: [README.md, 02-permission-katalog.md]
---

# Rollen-Katalog

## Seed-Rollen

| Key | Name | Beschreibung | Permissions |
|---|---|---|---|
| `admin` | Administrator | Voller Systemzugriff | **alle** (Wildcard) |
| `user` | Benutzer | Lesender Standardzugriff | `dashboard:read` |

Die Rolle `admin` ist eine **Wildcard-Rolle**: Der `PermissionService`
erkennt sie per Key-Vergleich und gibt bei jeder `hasPermission()`-Abfrage
`true` zurück, unabhängig vom konkreten Permission-String. Das heißt:
neue Permissions müssen nicht manuell der Admin-Rolle zugeordnet werden,
sie greifen automatisch.

Die Rolle `user` ist bewusst minimal. Aktuell gibt es für sie nur
`dashboard:read`, damit ein frisch eingeladener User das Dashboard sehen
kann — nichts darüber hinaus.

## Neue Rollen anlegen

Über Alembic-Migration (bevorzugt, damit reproduzierbar):

```python
conn.execute(text(
    "INSERT INTO roles (key, name, description, created_at) "
    "VALUES ('editor', 'Editor', 'Darf Inhalte bearbeiten', NOW())"
))
```

Oder zur Laufzeit via `POST /api/v1/roles/` (erfordert
`roles:manage:write`).

## Rollen zuweisen

`PATCH /api/v1/users/{user_id}` akzeptiert ein `role_keys`-Array:

```json
{ "role_keys": ["user", "editor"] }
```

Die User-Role-Zuordnung ist N:M — ein User kann beliebig viele Rollen
haben. Die effektiven Permissions sind die Vereinigung aller Rollen-
Permissions (bzw. Wildcard, falls `admin` dabei ist).
