---
name: Registrierung (Whitelist)
description: Admin lädt per Invite ein, User beendet Registrierung und 2FA-Setup selbst
type: reference
tags: [auth, registrierung, invite, whitelist, 2fa-setup, ethicline]
related: [README.md, 02-login-flow.md, 03-admin-funktionen.md]
---

# Registrierung

ethicLine nutzt ein **Whitelist-Modell**: Niemand kann sich selbst anlegen.
Ein Admin invited die E-Mail-Adresse, der User führt die Registrierung zu Ende.

## Flow

### 1. Admin invited

Backend-Endpoint: `POST /api/v1/users/invite` (Permission: `users:manage:write`)

```json
{
  "email": "neue.person@ethicline.de",
  "full_name": "Neue Person",
  "role_key": "user"
}
```

Das legt einen User mit `status=pending`, ohne Passwort an. Der User
erhält (manuell oder per späterer Email-Integration) den Link auf
`/register` und seine E-Mail-Adresse.

### 2. User registriert sich

Frontend: `/register`. Der User gibt E-Mail, gewünschtes Passwort und
Anzeigenamen ein. Backend: `POST /api/v1/auth/register`.

- Wenn die E-Mail kein `pending`-User ist → **401**.
- Sonst: Passwort wird gehasht, `status` auf `active` gesetzt, ein
  `temp_token` zurückgegeben.

### 3. 2FA-Setup

Der Frontend-Flow ruft danach automatisch `POST /api/v1/auth/mfa/setup`
mit dem `temp_token` auf und zeigt den QR-Code + das Secret an. Der User
scannt mit seiner Authenticator-App, gibt einen 6-stelligen Code ein,
Frontend sendet `POST /api/v1/auth/mfa/enable` → Server verifiziert,
speichert `totp_enabled=true`, generiert **8 Recovery Codes** und gibt
einen regulären `access_token` zurück.

### 4. Recovery Codes sichern

Die 8 Codes werden einmalig angezeigt. Der User muss sie runterladen oder
abschreiben. Jeder Code kann nur einmal verwendet werden. Reset siehe
[03-admin-funktionen.md](./03-admin-funktionen.md).

## Seed-Admin

Für die initiale Inbetriebnahme wird ein Admin via Migration
(`002_seed_rbac.py`) gesetzt — er hat bereits `status=active`, aber
`totp_enabled=false`, sodass sein **erster Login** direkt in den
2FA-Setup-Flow leitet (Schritt 3+4).
