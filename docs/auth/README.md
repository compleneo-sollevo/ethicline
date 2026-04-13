---
name: Auth-Übersicht
description: ethicLine Auth-System — JWT, 2FA (TOTP + Recovery Codes), User-Status, relevante Code-Dateien
type: reference
tags: [auth, jwt, 2fa, totp, recovery-codes, ethicline]
related: [../architecture.md, 01-registrierung.md, 02-login-flow.md, 03-admin-funktionen.md, ../rbac/README.md]
---

# Auth — Übersicht

ethicLine nutzt den Auth-Stack aus der mh-sales-forecasting-Referenz unverändert.

## Prinzipien

- **JWT HS256** für Access-Tokens (8h Lifetime), Secret aus `SECRET_KEY`.
- **Temp-Tokens** (5 min) als Brücke zwischen Credential-Check und 2FA.
- **TOTP** (RFC 6238) als zweiter Faktor, QR-Code-basierte Einrichtung.
- **8 Recovery-Codes** pro User als Backup für verlorenen Authenticator.
- **Whitelist-Registrierung**: Admin legt den User-Datensatz als `pending`
  an, der User beendet Registrierung und 2FA-Setup selbst.

## User-Status

| Status | Bedeutung |
|---|---|
| `pending` | Admin hat invited, User hat noch kein Passwort gesetzt |
| `active` | Regulärer Login möglich |
| `disabled` | Login blockiert, Admin kann reaktivieren |

`is_active` (Bool) wird zusätzlich gesetzt und gespiegelt die Negation von
`disabled`.

## Code-Dateien

### Backend

| Datei | Zweck |
|---|---|
| `backend/src/app/api/v1/auth.py` | `/auth/login`, `/auth/register`, `/auth/mfa/setup`, `/auth/mfa/enable`, `/auth/login/verify-2fa`, `/auth/me` |
| `backend/src/app/core/security.py` | bcrypt, `create_access_token`, `create_temp_token`, TOTP-Helper, QR-Code-Generator |
| `backend/src/app/api/dependencies.py` | `get_current_user`, `CurrentUser`, `DbSession` Aliases |
| `backend/src/app/crud/crud_users.py` | `authenticate`, `create_user`, `activate_user`, `reset_totp` |
| `backend/src/app/models/user.py` | `User`, `RecoveryCode`, `Role`, `Permission`, Association-Tables |
| `backend/src/app/schemas/user.py` | Pydantic-Schemas (Login/Register/Token/2FA) |

### Frontend

| Datei | Zweck |
|---|---|
| `frontend/src/app/(auth)/login/page.tsx` | Multi-Step Login (Credentials → 2FA → Recovery Codes) |
| `frontend/src/app/(auth)/register/page.tsx` | Multi-Step Register |
| `frontend/src/hooks/use-auth.ts` | React-Query-Mutations für alle Auth-Endpoints |
| `frontend/src/lib/auth.ts` | `getToken`/`setToken`/`removeToken`/`isAuthenticated` (localStorage) |
| `frontend/src/lib/api-client.ts` | Fetch-Wrapper mit Bearer-Header, 401 → Redirect `/login` |
| `frontend/src/stores/auth-store.ts` | Zustand-Store: `user`, `hasPermission`, `logout` |
| `frontend/src/app/(dashboard)/layout.tsx` | Client-seitiges Auth-Gate |

## Weiterführend

- [01-registrierung.md](./01-registrierung.md)
- [02-login-flow.md](./02-login-flow.md)
- [03-admin-funktionen.md](./03-admin-funktionen.md)
