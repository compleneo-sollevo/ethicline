---
name: Auth Admin-Funktionen
description: User einladen, Rollen zuweisen, TOTP zurücksetzen, User deaktivieren — Backend-Endpoints
type: reference
tags: [auth, admin, invite, totp-reset, deaktivierung, ethicline]
related: [README.md, 01-registrierung.md, 02-login-flow.md, ../rbac/README.md]
---

# Admin-Funktionen

Alle Endpoints liegen unter `/api/v1/users` und erfordern die entsprechende
Permission. Aktuell gibt es dafür **kein UI** — die Endpoints sind in
Swagger (`/docs`) aufrufbar oder per `curl`/`httpie` ansteuerbar.

## Benutzer einladen

`POST /api/v1/users/invite` — Permission: `users:manage:write`

```json
{
  "email": "neu@ethicline.de",
  "full_name": "Neue Person",
  "role_key": "user"
}
```

Legt einen User mit `status=pending` und **ohne Passwort** an. Der User
schließt die Registrierung über `/register` ab (siehe
[01-registrierung.md](./01-registrierung.md)).

## User auflisten / aktualisieren

- `GET /api/v1/users/` — Liste aller User (Permission: `users:manage:read`)
- `PATCH /api/v1/users/{user_id}` — Namen oder Rollen aktualisieren
- `DELETE /api/v1/users/{user_id}` — User hart löschen

## Aktivieren / Deaktivieren

`PATCH /api/v1/users/{user_id}/status`

```json
{ "status": "disabled" }
```

Setzt `status=disabled` und `is_active=false`. Reaktivierung mit
`status=active`.

## Passwort-Reset (temporäres Passwort)

`POST /api/v1/users/{user_id}/reset-password`

```json
{ "temporary_password": "..." }
```

Setzt ein neues Passwort. Der User muss sich normalerweise beim nächsten
Login ein neues setzen — dieser Flow ist aktuell nicht UI-seitig
erzwungen, sondern nur serverseitig möglich.

## TOTP zurücksetzen

`POST /api/v1/users/{user_id}/reset-totp`

Setzt `totp_enabled=false` und `totp_secret=null`. Beim nächsten Login
landet der User wieder im 2FA-Setup-Flow.

## Fallback: direktes SQL

Im Dev-Setup kann man die obigen Funktionen auch per SQL ausführen:

```bash
docker compose exec db psql -U ethicline_user -d ethicline
```

```sql
-- TOTP zurücksetzen
UPDATE users SET totp_enabled = false, totp_secret = NULL WHERE email = 'x@ethicline.de';

-- User deaktivieren
UPDATE users SET status = 'disabled', is_active = false WHERE email = 'x@ethicline.de';

-- User löschen (inkl. CASCADE auf recovery_codes, user_roles)
DELETE FROM users WHERE email = 'x@ethicline.de';
```
