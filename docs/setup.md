---
name: Lokales Dev-Setup
description: ethicLine lokal starten — Docker Compose, Seed-Admin, Traefik, Troubleshooting
type: reference
tags: [setup, dev, docker, local, ethicline, traefik]
related: [architecture.md, auth/02-login-flow.md]
---

# Lokales Dev-Setup

## Voraussetzungen

- Docker Desktop (aktuell)
- Traefik-Instanz aus `~/docker-infra/` läuft
  (`cd ~/docker-infra && docker compose up -d`)
- `*.localhost` wird vom OS automatisch auf 127.0.0.1 aufgelöst — keine
  `/etc/hosts`-Einträge nötig.

## Erststart

```bash
cd /Users/marcelbosse/01_Code/10_ethicLine
cp .env.example .env
docker compose up -d --build
docker compose logs -f backend    # Migration + Seed beobachten
```

Beim ersten `up` baut Compose:

1. **db** → `postgres:17`, legt Volume `postgres_data` an.
2. **backend** → baut Image aus `backend/Dockerfile` (uv sync, multi-stage
   slim runtime). Container startet mit
   `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`.
   → legt Schema an und seedet Rollen/Permissions/Admin-User.
3. **frontend** → baut Image aus `frontend/Dockerfile` (Stage `runner`,
   Next.js Standalone Build).

## Zugriff

| Dienst | URL |
|---|---|
| Frontend | <http://ethicline.localhost> |
| Backend API | <http://ethicline-api.localhost> |
| Swagger UI | <http://ethicline-api.localhost/docs> |
| Health Check | <http://ethicline-api.localhost/health> |

## Seed-Admin

| Feld | Wert |
|---|---|
| E-Mail | `marcel.bosse@compleneo.de` |
| Passwort | `AmarokLove997` |

Beim ersten Login ist `totp_enabled=false` → die App leitet direkt in den
2FA-Setup-Flow (QR-Code scannen mit Authenticator-App → 6-stelligen Code
bestätigen → Recovery-Codes sichern → Dashboard).

## Alltags-Befehle

```bash
# Logs
docker compose logs -f backend
docker compose logs -f frontend

# Neu bauen nach Dependency-Änderung
docker compose up -d --build backend
docker compose up -d --build frontend

# Backend-Shell (Migrations manuell)
docker compose exec backend alembic upgrade head
docker compose exec backend alembic revision --autogenerate -m "mein_change"

# Postgres-Shell
docker compose exec db psql -U ethicline_user -d ethicline

# Alles stoppen
docker compose down

# Inklusive DB-Volume löschen (frischer Seed)
docker compose down -v
```

## Troubleshooting

### Traefik routet nicht

- `docker network ls | grep traefik` — muss ein externes Netz `traefik`
  zeigen. Falls nicht: `cd ~/docker-infra && docker compose up -d`.
- `http://traefik.localhost` sollte das Traefik-Dashboard zeigen.

### Backend kommt nicht hoch

- `docker compose logs backend` lesen. Häufige Ursachen:
  - Alembic kann DB nicht erreichen → meist `depends_on` healthcheck noch
    nicht durch → 10-20s warten und Logs erneut lesen.
  - `uv.lock` out of sync → lokal `cd backend && uv lock && docker compose
    up -d --build backend`.

### Frontend-Build schlägt fehl

- `pnpm-lock.yaml` out of sync → lokal `cd frontend && pnpm install &&
  docker compose up -d --build frontend`.
- `NEXT_PUBLIC_API_URL` ist ein Build-Arg — nach Änderung von
  `docker-compose.yml` muss das Image neu gebaut werden.

### Login schlägt fehl

- In der DB prüfen, dass der Seed durchgelaufen ist:
  `docker compose exec db psql -U ethicline_user -d ethicline -c "select email, status from users;"`
- Wenn 2FA-Setup vorher abgebrochen wurde: TOTP-Reset via
  `docker compose exec db psql -U ethicline_user -d ethicline -c "update users set totp_enabled=false, totp_secret=null;"`
