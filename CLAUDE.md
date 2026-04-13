# ethicLine — AI Instructions

## Projekt-Kontext

ethicLine ist ein neues Produkt der ethicLine GmbH. Der aktuelle Stand ist ein
Bootstrap aus der mh-sales-forecasting-Referenz: App-Shell, Auth-Flow
(JWT + TOTP-2FA + Recovery Codes + RBAC), Docker-Setup, sonst nichts.
Fachliche Features kommen in Folge-Sessions.

## Tech-Stack

- **Backend**: FastAPI (Python 3.13), SQLAlchemy async, Alembic, Pydantic v2,
  uv als Package-Manager. Code unter `backend/src/app/`.
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui,
  Zustand (nur auth-store), TanStack Query, pnpm. Code unter `frontend/src/`.
- **DB**: Postgres 17.
- **Reverse-Proxy**: Globaler Traefik aus `~/docker-infra/`. Hosts:
  `ethicline.localhost` (Frontend), `ethicline-api.localhost` (Backend).

## Konventionen

- **Neues Next.js**: Siehe `frontend/AGENTS.md` — vor Next.js-Code bitte in
  `node_modules/next/dist/docs/` den relevanten Guide lesen. APIs und File-
  Conventions können von Training-Daten abweichen.
- **Dokumentation**: Jede nicht-triviale Änderung wird parallel in `docs/`
  festgehalten (Struktur siehe `docs/README.md`). Markdown mit Frontmatter
  nach dem globalen Schema aus der User-CLAUDE.md.
- **Migrations**: Alembic in `backend/src/app/db/migrations/versions/`.
  Beim Anlegen neuer Migrations Revision-IDs nummerisch fortführen
  (`003_...`, `004_...`).
- **Branding**: Primärfarbe `#151515` (schwarz), Sekundärfarben neutral grau.
  Keine Möhlenhoff-Rotakzente.

## Seed-Admin

- `marcel.bosse@compleneo.de` / `AmarokLove997`
- Rolle `admin`, status `active`, `totp_enabled=false` → erster Login
  triggert 2FA-Setup.

## Lokale Dev-Kommandos

```bash
# Alles via Docker (empfohlen)
docker compose up -d --build
docker compose logs -f backend
docker compose exec backend alembic upgrade head   # falls manuell nötig

# Backend direkt (ohne Docker)
cd backend
uv sync
uv run uvicorn app.main:app --reload

# Frontend direkt (ohne Docker)
cd frontend
pnpm install
pnpm dev
```

## Auth-Flow in Kürze

1. `POST /api/v1/auth/login` mit `{email, password}` → liefert `temp_token`.
2. Wenn `totp_enabled=false`: `POST /api/v1/auth/mfa/setup` mit `temp_token`
   → QR + secret. User scannt, sendet Code an `POST /api/v1/auth/mfa/enable`
   → Recovery-Codes + `access_token`.
3. Wenn `totp_enabled=true`: `POST /api/v1/auth/login/verify-2fa` mit
   `temp_token` + TOTP/Recovery-Code → `access_token`.
4. `access_token` im localStorage (`access_token`), wird vom `ApiClient` in
   `frontend/src/lib/api-client.ts` automatisch als Bearer-Header gesetzt.
5. 401-Response löst Redirect auf `/login` aus.

## Non-Goals (bis zur nächsten Session)

- Fachfeatures (Dashboards, Reports, Workflows)
- Echte Produktionsdeployment (kein CI/CD, keine Let's Encrypt)
- E-Mail-Versand / Admin-Invite-UI
- Umfangreiches Test-Coverage
