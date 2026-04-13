---
name: ethicLine Architektur
description: System-Architektur, Tech-Stack, Datenfluss Frontend ↔ Backend ↔ DB
type: reference
tags: [architecture, tech-stack, overview, ethicline, fastapi, nextjs]
related: [setup.md, auth/02-login-flow.md]
---

# Architektur

## Überblick

```
┌────────────┐   HTTPS    ┌────────────┐   HTTP    ┌────────────┐
│  Browser   │ ─────────▶ │  Traefik   │ ────────▶ │  Frontend  │
│            │            │ (~/docker- │           │  Next.js   │
│            │            │   infra/)  │           │  (3000)    │
└────────────┘            └────────────┘           └─────┬──────┘
                                │                        │
                                │ /api                   │ fetch
                                ▼                        ▼
                          ┌────────────┐           ┌────────────┐
                          │  Backend   │ ────────▶ │  Postgres  │
                          │  FastAPI   │  asyncpg  │     17     │
                          │  (8000)    │           │  (5432)    │
                          └────────────┘           └────────────┘
```

Routing:

- `ethicline.localhost` → Frontend-Container (Port 3000)
- `ethicline-api.localhost` → Backend-Container (Port 8000)

Beide Hosts laufen über den globalen Traefik aus `~/docker-infra/`, der
als externes Docker-Netzwerk `traefik` eingebunden ist.

## Tech-Stack

### Backend

- **FastAPI** (≥ 0.115) mit `uvicorn --reload` im Dev-Mode
- **SQLAlchemy** 2.x (async, asyncpg-Driver)
- **Alembic** für Migrations (siehe `backend/src/app/db/migrations/`)
- **Pydantic v2** + **pydantic-settings** für Config
- **python-jose** (JWT HS256) + **bcrypt** (Password-Hash) + **pyotp** (TOTP)
- **uv** als Package-Manager (`pyproject.toml` + `uv.lock`)

### Frontend

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS v4** + **shadcn/ui** (Komponenten in `frontend/src/components/ui/`)
- **Zustand** für Auth-Client-State (`stores/auth-store.ts`)
- **TanStack Query** für Server-State (Auth-Hooks in `hooks/use-auth.ts`)
- **pnpm** als Package-Manager

### Infrastruktur

- **Postgres 17** (Docker-Image `postgres:17`)
- **Docker Compose** (`docker-compose.yml`)
- **Traefik v3** global in `~/docker-infra/`

## Verzeichnis-Struktur (Highlights)

```
backend/src/app/
├── main.py                   # FastAPI-App, CORS, Lifespan, /health
├── api/
│   ├── dependencies.py       # get_db, get_current_user, CurrentUser/DbSession
│   ├── rbac.py               # RequirePermission-Dependency
│   └── v1/
│       ├── router.py         # Sammel-Router (auth, users, roles)
│       ├── auth.py           # Login, Register, 2FA, /me
│       ├── users.py          # CRUD + invite + mfa-reset
│       └── roles.py          # Rollen-CRUD
├── core/
│   ├── config.py             # pydantic-settings
│   ├── security.py           # bcrypt, JWT, TOTP-Helper
│   └── logging.py
├── models/user.py            # User, Role, Permission, RecoveryCode
├── schemas/{user,role}.py
├── crud/{crud_users,crud_roles,base}.py
├── services/
│   ├── permission_service.py # Permission-Lookup inkl. Admin-Marker
│   └── audit_service.py      # No-Op-Stub (siehe Hinweis unten)
└── db/
    ├── base.py, engine.py
    └── migrations/versions/
        ├── 001_initial_schema.py
        └── 002_seed_rbac.py

frontend/src/
├── app/
│   ├── layout.tsx, globals.css, manifest.ts
│   ├── (auth)/{login,register}/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx         # Auth-Gate + AppShell
│       └── dashboard/page.tsx # Dummy-Dashboard
├── components/
│   ├── layout/{app-shell,app-sidebar,top-bar}.tsx
│   ├── providers/{query,theme}-provider.tsx
│   └── ui/                    # shadcn-Komponenten
├── config/navigation.ts
├── hooks/use-auth.ts
├── lib/{auth,api-client,utils}.ts
└── stores/auth-store.ts
```

## Hinweise

- **audit_service** ist aktuell ein No-Op-Stub in
  `backend/src/app/services/audit_service.py`. Die Call-Sites in
  `api/v1/users.py` und `api/v1/roles.py` bleiben erhalten, aber Writes
  gehen nirgendwo hin. Sobald Audit-Bedarf konkret wird → ECHTES Backend
  mit `audit_log`-Tabelle restaurieren.
- **Docker-Hot-Reload**: `backend/src` ist in den Backend-Container als
  Volume gemountet, Uvicorn läuft mit `--reload`. Änderungen im Python-Code
  triggern automatisch einen Reload. Das Frontend wird aktuell als
  `runner`-Image gebaut (Production-Build, kein Hot-Reload). Wenn Hot-Reload
  nötig wird, Dockerfile-Stage `dev` ergänzen oder `pnpm dev` lokal fahren.
