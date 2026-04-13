# ethicLine

App-Shell und Auth-Gerüst für ethicLine GmbH. Aktuell nur Login (mit 2FA) und
ein leeres Dummy-Dashboard. Fachliche Funktionen folgen in weiteren Sessions.

- **Repo:** <https://github.com/compleneo-sollevo/ethicline> (public)
- **Lokal:** `/Users/marcelbosse/01_Code/10_ethicLine/`
- **Traefik-Hosts:** `ethicline.localhost` / `ethicline-api.localhost`

## Tech-Stack

- **Backend:** Python 3.13 + FastAPI (uv-managed), SQLAlchemy async, Alembic
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui (pnpm)
- **Datenbank:** PostgreSQL 17 (Host-Port `5437`, siehe unten)
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

## Postgres-Port 5437 (nicht 5432)

Der Host-Port für Postgres steht in `.env.example` auf `5437`, nicht dem
Standard `5432`. Grund: Auf dieser Dev-Maschine laufen parallel mehrere
Postgres-Container aus anderen Projekten (`mh-postgres` → 5432,
`up2date-postgres` → 5433, `compleneo-postgres` → 5434, `jash-postgres`
→ 5436). Innerhalb des Compose-Netzwerks spricht das Backend weiterhin
`db:5432`; nur die Host-Exposition nutzt 5437 für `psql`-Zugriff von außen.

Wenn du von einem anderen Rechner klonst und die Standard-Ports frei sind,
kannst du `POSTGRES_PORT=5432` in deiner lokalen `.env` setzen.

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

## Verwandte Repos

ethicLine war der **Prototyp** für
[`compleneo-sollevo/app-shell-template`](https://github.com/compleneo-sollevo/app-shell-template).
Das Template ist die generische, wiederverwendbare Version dieses Stacks.
Neue Projekte sollten über das Template (bzw. den `/init-app-shell`-Skill in
Claude Code) bootstrappen, **nicht** ethicLine forken. Architektur-
Verbesserungen an ethicLine (Audit-Log, Dev-Stage, Tests, …) sollten
aktiv zurück ins Template fließen, damit Folgeprojekte davon profitieren.
