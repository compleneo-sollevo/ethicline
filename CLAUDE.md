# ethicLine — AI Instructions

## Projekt-Kontext

ethicLine ist ein neues Produkt der ethicLine GmbH.

- **Repo:** <https://github.com/compleneo-sollevo/ethicline> (public)
- **Aktueller Stand:** App-Shell + Auth-Flow (JWT + TOTP-2FA + Recovery
  Codes + RBAC) + Docker-Setup. Kein Fachcode. Fachliche Features kommen
  in Folge-Sessions.
- **Historie:** ethicLine wurde manuell aus `mh-sales-forecasting`
  gebootstrappt (Copy-und-Strip) — bevor das `app-shell-template` existierte.
  Strukturell ist das Repo 1:1 das, was aus dem Template kommt, nur früher
  entstanden.

## Beziehung zu `app-shell-template`

ethicLine ist der **Prototyp** für
[`compleneo-sollevo/app-shell-template`](https://github.com/compleneo-sollevo/app-shell-template).
Das Template ist die generische, wiederverwendbare Version dieses Stacks.

**Regel für künftige Arbeit:**

- **Neue Projekte** (Sibling-Apps) werden **nicht aus ethicLine** geforkt,
  sondern über den Claude-Code-Skill `/init-app-shell` (siehe
  `~/.claude/skills/init-app-shell/SKILL.md`) aus dem Template bootstrapp't.
- **Architekturelle Verbesserungen** an ethicLine, die generisch und nicht
  ethicLine-spezifisch sind (z.B. echtes Audit-Log-Backend, Frontend-
  Dev-Stage mit Hot-Reload, Pytest/Playwright-Setup, Production-Deployment-
  Playbooks), sollten **aktiv zurück ins Template** geportet werden.
  Template-Roadmap steht in
  <https://github.com/compleneo-sollevo/app-shell-template/blob/main/docs/roadmap.md>.
- **Bei größeren Template-Updates** kann ein Re-Sync in die andere Richtung
  sinnvoll werden (Template → ethicLine), um nicht zu divergieren. Das
  läuft nicht automatisiert; man muss per Diff prüfen, welche Template-
  Verbesserungen übernehmbar sind, ohne ethicLine-spezifische Fachlogik zu
  überschreiben.

## Tech-Stack

- **Backend:** FastAPI (Python 3.13), SQLAlchemy async, Alembic, Pydantic v2,
  uv als Package-Manager. Code unter `backend/src/app/`.
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui,
  Zustand (nur auth-store), TanStack Query, pnpm. Code unter `frontend/src/`.
- **DB:** Postgres 17 (Host-Port **5437**, siehe unten).
- **Reverse-Proxy:** Globaler Traefik aus `~/docker-infra/`. Hosts:
  `ethicline.localhost` (Frontend), `ethicline-api.localhost` (Backend).

## Postgres-Port 5437

Die `.env.example` pinnt `POSTGRES_PORT=5437`, nicht den Postgres-Default
`5432`. Grund: Auf dem Haupt-Dev-Rechner laufen bereits
`mh-postgres` (5432), `up2date-postgres` (5433), `compleneo-postgres` (5434),
`jash-postgres` (5436). 5437 war der nächste freie Slot. Innerhalb des
Compose-Netzwerks spricht das Backend weiterhin `db:5432`; nur die Host-
Exposition nutzt 5437 (für `psql`-Zugriff oder GUI-Clients von außen).

Wenn du beim Klonen auf einer anderen Maschine bist und 5432 frei ist,
kannst du das lokal überschreiben in deiner `.env`. Nicht committen.

## Konventionen

- **Neues Next.js:** Siehe `frontend/AGENTS.md` — vor Next.js-Code bitte in
  `node_modules/next/dist/docs/` den relevanten Guide lesen. APIs und File-
  Conventions können von Training-Daten abweichen.
- **Dokumentation:** Jede nicht-triviale Änderung wird parallel in `docs/`
  festgehalten (Struktur siehe `docs/README.md`). Markdown mit Frontmatter
  nach dem globalen Schema aus der User-CLAUDE.md.
- **Migrations:** Alembic in `backend/src/app/db/migrations/versions/`.
  Beim Anlegen neuer Migrations Revision-IDs nummerisch fortführen
  (`003_...`, `004_...`).
- **Branding:** Primärfarbe `#151515` (near-black, inspiriert von
  happyfoie.com), Sekundärfarben neutral grau. Keine Möhlenhoff-Rotakzente.

## Seed-Admin

- E-Mail: `marcel.bosse@compleneo.de`
- Passwort: `AmarokLove997`
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

# Git
git push origin main
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

## Bekannte Vereinfachungen

- **`audit_service`** ist ein No-Op-Stub (`backend/src/app/services/audit_service.py`).
  Call-Sites in `api/v1/users.py` und `api/v1/roles.py` bleiben, aber Writes
  gehen ins Leere. Für Audit-Trails muss ein echter Backing-Store +
  Migration her. Auch im Template so — gemeinsamer TODO.
- **Frontend läuft als Production-Build** (`target: runner`), kein
  Hot-Reload. Für schnelle UI-Iteration entweder `pnpm dev` lokal außerhalb
  Docker oder neue `dev`-Stage im `frontend/Dockerfile` ergänzen. Template-
  TODO.

## Non-Goals (bis zur nächsten Session)

- Fachfeatures (Dashboards, Reports, Workflows)
- Echtes Produktions-Deployment (kein CI/CD, keine Let's Encrypt)
- E-Mail-Versand / Admin-Invite-UI im Frontend
- Umfangreiches Test-Coverage
