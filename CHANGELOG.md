# Changelog

All notable milestones for InsurtechKit.

## [1.0.0] — 2026-08-04

### Added
- Production deployment packaging (Dockerfiles, Compose, Nginx configs, startup scripts)
- Health `/health` and readiness `/ready` endpoints
- Graceful SQLAlchemy pool dispose on shutdown
- Production configuration validation
- Commercial documentation suite (install, deploy, admin/user/API/branding/integration/security/roadmap)
- Project Release Report

### Security
- Fail-fast on insecure production secrets and demo seed defaults

---

## [0.6.0] — 2026-08-04

### Added
- JWT login / logout / refresh / me / change-password
- RBAC permission dependencies on domain APIs
- Frontend AuthContext, Login page, token storage, auto-logout
- Alembic `0002_auth` (password_hash, refresh_tokens)
- Seeded demo users

---

## [0.5.0] — 2026-08-04

### Added
- FastAPI backend with SQLAlchemy + Alembic + PostgreSQL
- Domain CRUD mirroring frontend modules
- `DATA_PROVIDER` memory | api switch and Api* services

---

## [0.4.0] — Integrations

- Integration framework and admin management UI (config + simulated test)

---

## [0.3.x] — Modules

- Reports (live analytics)
- Users & roles
- Claims, Policies, Customers, Products admin modules
- Live dashboard from module services

---

## [0.2.0] — White-label

- Branding context, feature flags, company settings
- Desktop marketing surfaces + mobile preview

---

## [0.1.0] — Migration

- Initial Vite/React kit structure
- Screen inventory and design language established
