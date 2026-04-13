---
name: Login-Flow + 2FA
description: Schrittweiser Login-Ablauf mit JWT + TOTP + Recovery-Codes, Endpoints und Frontend-States
type: reference
tags: [auth, login, 2fa, totp, jwt, recovery-codes, ethicline]
related: [README.md, 01-registrierung.md, 03-admin-funktionen.md]
---

# Login-Flow

## Schritte (Happy Path)

```
┌──────────────┐    POST /auth/login         ┌──────────────┐
│  Credentials │ ─────────────────────────▶ │   Backend    │
│   (Step 1)   │ ◀───────────────────────── │              │
└──────────────┘    { temp_token,            └──────────────┘
                      requires_2fa: true }
        │
        ▼
┌──────────────┐    POST /auth/login/verify-2fa  ┌──────────────┐
│  TOTP-Code   │ ────────────────────────────▶ │   Backend    │
│   (Step 2)   │ ◀──────────────────────────── │              │
└──────────────┘    { access_token,              └──────────────┘
                      user, permissions }
        │
        ▼
    /dashboard
```

## Endpoints

### `POST /api/v1/auth/login`

Request:
```json
{ "email": "user@ethicline.de", "password": "..." }
```

Response (2FA bereits aktiv):
```json
{
  "requires_2fa": true,
  "temp_token": "eyJ...",
  "expires_in": 300
}
```

Response (2FA noch nicht eingerichtet):
```json
{
  "requires_2fa_setup": true,
  "temp_token": "eyJ...",
  "expires_in": 300
}
```

### `POST /api/v1/auth/mfa/setup`

Header: `Authorization: Bearer <temp_token>`. Generiert ein neues TOTP-
Secret für den User und ein QR-Code-PNG (base64).

Response:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code_base64": "iVBORw0KGgoAA...",
  "recovery_codes": null
}
```

### `POST /api/v1/auth/mfa/enable`

Request:
```json
{ "temp_token": "eyJ...", "code": "123456" }
```

Verifiziert den TOTP-Code gegen das bei `setup` gespeicherte Secret,
setzt `totp_enabled=true`, generiert 8 Recovery-Codes, gibt ein
`access_token` zurück.

### `POST /api/v1/auth/login/verify-2fa`

Request:
```json
{ "temp_token": "eyJ...", "code": "123456" }
```

`code` akzeptiert entweder 6-stelligen TOTP-Code oder einen Recovery-Code
(Format `XXXX-XXXX`). Recovery-Codes werden als `used=true` markiert.

### `GET /api/v1/auth/me`

Header: `Authorization: Bearer <access_token>`. Gibt den eingeloggten
User + seine Permissions zurück. Wird vom Frontend-Hook `useCurrentUser`
bei jedem Dashboard-Mount gerufen.

## Frontend-States

Der Login-Component (`frontend/src/app/(auth)/login/page.tsx`) kennt die
States:

- `credentials` — E-Mail + Passwort
- `2fa-verify` — TOTP-Eingabe (wenn `requires_2fa`)
- `2fa-setup` — QR-Code anzeigen (wenn `requires_2fa_setup`)
- `recovery-codes` — Einmal-Anzeige der 8 Codes nach `mfa/enable`

## Token-Handling

- `access_token` wird in `localStorage` unter Key `access_token` abgelegt
  (`frontend/src/lib/auth.ts`).
- Jede API-Request hängt automatisch `Authorization: Bearer <token>` an
  (`frontend/src/lib/api-client.ts`).
- Bei `401` entfernt der ApiClient das Token und leitet auf `/login`.
- Der `(dashboard)/layout.tsx` prüft zusätzlich beim Mount, ob der Token
  existiert und `useCurrentUser` erfolgreich ist.

## Logout

`useAuthStore().logout()` räumt localStorage + Zustand-State auf, dann
`router.push('/login')`. Kein Server-seitiges Logout nötig (stateless JWT).
