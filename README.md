# ethicLine

App-Shell und Auth-Gerüst für ethicLine GmbH. Aktuell nur Login (mit 2FA) und
ein leeres Dummy-Dashboard. Fachliche Funktionen folgen in weiteren Sessions.

## Tech-Stack

- **Backend:** Python 3.13 + FastAPI (uv-managed), SQLAlchemy async, Alembic
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui (pnpm)
- **Datenbank:** PostgreSQL 17
- **Auth:** JWT + TOTP-2FA + Recovery Codes + rollenbasierte Permissions
- **Infrastruktur:** Docker Compose + globaler Traefik (`~/docker-infra`)

## Quick Start

```bash
# 1. Traefik läuft (einmalig)
cd ~/docker-infra && docker compose up -d

# 2. ethicLine starten
cd /Users/marcelbosse/01_Code/10_ethicLine
cp .env.example .env
docker compose up -d --build
```

Nach dem Start:

- Frontend: <http://ethicline.localhost>
- Backend Swagger: <http://ethicline-api.localhost/docs>
- Health: <http://ethicline-api.localhost/health>

## Seed-Zugang

| Feld     | Wert                          |
|----------|-------------------------------|
| E-Mail   | `marcel.bosse@compleneo.de`   |
| Passwort | `AmarokLove997`               |
| Rolle    | `admin`                       |

Beim ersten Login wird der 2FA-Flow durchlaufen (QR-Code → TOTP-App →
Recovery-Codes sichern → Dashboard).

## Projektstruktur

```
10_ethicLine/
├── backend/           # FastAPI + Alembic + uv
├── frontend/          # Next.js + shadcn/ui
├── docs/              # Laufende Dokumentation
├── docker-compose.yml
└── .env.example
```

Details zu einzelnen Bereichen siehe [`docs/README.md`](./docs/README.md).
