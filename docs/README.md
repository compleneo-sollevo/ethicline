---
name: Dokumentations-Index
description: Zentrale Navigation für alle Dokumentationen im ethicLine-Projekt
type: index
tags: [docs, navigation, index, uebersicht, ethicline]
---

# Dokumentation — ethicLine

## Architektur & Setup

| Dokument | Beschreibung |
|----------|-------------|
| [architecture.md](./architecture.md) | System-Architektur, Tech-Stack, Datenfluss |
| [setup.md](./setup.md) | Lokales Dev-Environment starten |
| [roadmap.md](./roadmap.md) | Geplante Features, offene Themen |

## Auth & Sicherheit

| Dokument | Beschreibung |
|----------|-------------|
| [auth/README.md](./auth/README.md) | Übersicht Auth-System, User-Status, Code-Dateien |
| [auth/01-registrierung.md](./auth/01-registrierung.md) | Whitelist-Registrierung: Admin legt Email an, User registriert sich |
| [auth/02-login-flow.md](./auth/02-login-flow.md) | Login + 2FA Flow (TOTP, Recovery Codes) |
| [auth/03-admin-funktionen.md](./auth/03-admin-funktionen.md) | User einladen, TOTP Reset, Deaktivierung |

## RBAC

| Dokument | Beschreibung |
|----------|-------------|
| [rbac/README.md](./rbac/README.md) | RBAC-Architektur, Status, Code-Dateien |
| [rbac/01-rollenkatalog.md](./rbac/01-rollenkatalog.md) | Rollen: admin, user (erweiterbar) |
| [rbac/02-permission-katalog.md](./rbac/02-permission-katalog.md) | Permissions, Rollen-Matrix, Endpoint-Mapping |
| [rbac/03-backend-implementation.md](./rbac/03-backend-implementation.md) | PermissionService, RequirePermission, Dependency Chain |

## Deployment

| Dokument | Beschreibung |
|----------|-------------|
| [deployment/README.md](./deployment/README.md) | Platzhalter — wird gefüllt sobald Prod-Setup ansteht |

## Projekt-Root

| Datei | Beschreibung |
|-------|-------------|
| [../CLAUDE.md](../CLAUDE.md) | AI-Instruktionen: Tech-Stack, Konventionen, Auth-Flow |
| [../README.md](../README.md) | Quick Start + Seed-Zugang |
