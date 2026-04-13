---
name: ethicLine Roadmap
description: Session-Log + geplante Features — wird pro Session fortgeschrieben
type: project
tags: [roadmap, todo, planning, ethicline, sessions]
---

# Roadmap

## Session-Log

### Session 0 — 2026-04-13: App-Shell-Bootstrap + Template-Extraktion

**Was passiert ist:**

1. `/Users/marcelbosse/01_Code/10_ethicLine/` manuell aus
   `mh-sales-forecasting` gebootstrappt: Copy, Strip aller Domain-Module,
   Rebrand auf ethicLine, Farbe `#151515` (happyfoie-inspiriert),
   Logo-Tag `EL`, Seed-Admin `marcel.bosse@compleneo.de / AmarokLove997`,
   Docker-Compose mit Traefik-Hosts `ethicline.localhost` +
   `ethicline-api.localhost`, Postgres-Host-Port `5437` wegen Port-
   Kollisionen mit anderen Dev-Containern.
2. Smoke-Test: `docker compose up -d --build` → Health OK, Login mit
   Seed-Admin → `requires_2fa_setup=true` → Frontend rendert "ethicLine".
3. Git-Repo initialisiert und gepusht nach
   <https://github.com/compleneo-sollevo/ethicline> (public).
4. **Parallel**: Aus dem ethicLine-Setup wurde das generische Template
   <https://github.com/compleneo-sollevo/app-shell-template> extrahiert +
   der Claude-Code-Skill `/init-app-shell` geschrieben, der Bootstrap in
   ~2 Minuten automatisiert (siehe
   `~/.claude/skills/init-app-shell/SKILL.md`). E2E-getestet mit einem
   Wegwerfprojekt `testbootstrap`.

**Stand am Sessionende:**

- App-Shell funktioniert, Docker-Stack ist gestoppt, Remote ist aktuell.
- ethicLine enthält keinerlei Fachlogik — nur Login + leeres
  Dummy-Dashboard.
- Keine E-Mails, keine Users-Management-UI, kein Audit-Log-Backend
  (No-Op-Stub).

## Offen — nächste Schritte (ethicLine-spezifisch)

Noch nicht priorisiert. Bitte in der nächsten Session mit Marcel abstimmen:

- [ ] Fachliche Domäne definieren (welche Entitäten? welche Workflows?)
- [ ] Echtes Logo / Markenrichtlinien (aktuell: generiertes `EL`-Text-SVG)
- [ ] Users-Management-UI im Frontend (Invite, Deaktivierung, Rollen)
- [ ] Production-Deployment-Setup (Hetzner / Tailscale / Let's Encrypt)
- [ ] CI/CD via GitHub Actions
- [ ] E-Mail-Versand (Invite, Password-Reset) — SMTP oder Resend

## Template-Feedback-Loop

ethicLine ist der **Prototyp** des `app-shell-template`. Folgende TODOs
sind **generisch** und sollten erst im Template verbessert werden, dann
per Cherry-Pick oder Re-Sync zurück in ethicLine:

- [ ] Echtes Audit-Log-Backend statt No-Op-Stub in
      `backend/src/app/services/audit_service.py` (neues Model +
      Migration nötig)
- [ ] Frontend-Dev-Stage im `frontend/Dockerfile` für Hot-Reload
      (aktuell läuft nur `target: runner` = Production-Build)
- [ ] Test-Coverage (pytest für Auth-Endpoints, Playwright/Vitest für
      Frontend)
- [ ] Seed-Migration so refactorn, dass das Admin-Passwort aus einer
      Env-Var gelesen wird, nicht hardcoded in der Migration committet

**Workflow für generische Verbesserungen:**

1. Änderung erst im `app-shell-template`-Repo machen + testen.
2. Commit + Push im Template.
3. In ethicLine per Diff prüfen und cherry-picken (kein automatischer
   Re-Sync — würde evtl. Fach-Code zerstören).

## Offen — nächste Schritte (Template-spezifisch)

Siehe <https://github.com/compleneo-sollevo/app-shell-template/blob/main/docs/roadmap.md>
für die Template-Roadmap. Änderungen dort landen nicht automatisch in
ethicLine.
