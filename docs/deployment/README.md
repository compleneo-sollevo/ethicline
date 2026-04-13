---
name: Deployment (Platzhalter)
description: Platzhalter für Prod-Deployment von ethicLine — wird gefüllt sobald Hosting-Entscheidung getroffen ist
type: reference
tags: [deployment, production, todo, ethicline]
---

# Deployment

> ⚠️ **Noch nicht befüllt.** Für die aktuelle Session wurde ethicLine
> ausschließlich als lokales Dev-Setup aufgebaut. Produktions-Deployment
> kommt in einer späteren Session.

## Offene Fragen

- Hosting: Hetzner CX33 (wie mh-sales-forecasting) oder anderes?
- Domain + TLS: eigene Domain oder Subdomain von `ethicline.de`?
- CI/CD: GitHub Actions (analog mh) oder direkt `docker compose pull`?
- Secrets: `.env.production` per SCP oder Secret-Manager?
- Backups: pg_dump-Cron oder Managed Postgres?

## Referenz

Als Template kann das mh-sales-forecasting Deployment-Setup dienen:

- Server-Setup: Hetzner CX33 + Docker + Tailscale + UFW + fail2ban
- Traefik v3 mit Let's Encrypt
- GitHub Actions für Build → Push → Deploy
- pg_dump-Backups + Tailscale-only-Zugriff

Siehe `../../09_Möhlenhoff/mh-sales-forecasting/docs/deployment/` für
Details.
