# InsurtechKit

White-label insurtech portal kit for insurers, MGAs, brokers, and MSPs — React admin + marketing surfaces backed by a FastAPI / PostgreSQL API.

**Version:** 1.0.0  
**License:** See [LICENSE.md](LICENSE.md)

---

## Overview

InsurtechKit is a commercial-ready starter for Nigerian and emerging-market insurance operations. It ships:

- A branded public website (desktop + mobile preview)
- An admin console for products, customers, policies, claims, users, reports, integrations, and settings
- Dual data modes: in-memory (demo / offline) and API (production path)
- JWT authentication with role-based permissions

---

## Features

- White-label branding and feature flags
- Products, customers, policies, claims CRUD
- Users & roles with fine-grained permissions
- Live dashboard and reports from module data
- Integration registry (partners, payments, email, SMS, identity, regulatory)
- FastAPI backend with Alembic migrations and PostgreSQL
- Docker Compose full-stack deployment

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Vite/React │────▶│  FastAPI API │────▶│ PostgreSQL │
│  SPA (:8080)│     │  (:8000)     │     │  (:5432)   │
└─────────────┘     └──────────────┘     └────────────┘
        │                    │
   memory mode          JWT + RBAC
   (no API needed)      /api/v1/*
```

| Layer | Responsibility |
|-------|----------------|
| Frontend | Marketing site, admin UI, auth session, `DATA_PROVIDER` switch |
| API | REST CRUD, auth, permissions, branding/flags |
| Database | Durable domain state + refresh tokens |

---

## Technology Stack

| Area | Stack |
|------|-------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind 4, Recharts |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, Alembic |
| Auth | JWT (access + refresh), bcrypt |
| Database | PostgreSQL 16 |
| Deploy | Docker, Docker Compose, Nginx |

---

## Screenshots

> Place demo captures here before customer delivery.

| Surface | Placeholder |
|---------|-------------|
| Homepage | `docs/screenshots/homepage.png` |
| Admin overview | `docs/screenshots/admin-overview.png` |
| Claims | `docs/screenshots/claims.png` |
| Reports | `docs/screenshots/reports.png` |
| Login | `docs/screenshots/login.png` |

---

## Quick Start

### Option A — Full stack (Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

- Web: http://localhost:8080  
- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

Demo login (seeded): `ada.okafor@insureng.com.ng` / `Password123!`

### Option B — Local development

```bash
# DB
docker compose -f backend/docker-compose.yml up -d

# API
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cp .env.example .env   # set VITE_DATA_PROVIDER=memory or api
npm install
npm run dev
```

See [INSTALL.md](INSTALL.md) for details.

---

## Deployment

Production overlay:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env up -d --build
```

Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Configuration

| Variable | Purpose |
|----------|---------|
| `VITE_DATA_PROVIDER` | `memory` \| `api` |
| `VITE_API_BASE_URL` | API base (default `/api/v1` behind Nginx) |
| `DATABASE_URL` | SQLAlchemy URL |
| `SECRET_KEY` | JWT signing (≥32 chars in production) |
| `ENVIRONMENT` | `development` \| `production` |
| `SEED_ON_STARTUP` | Seed roles/users when empty |
| `ENABLE_DOCS` | Swagger / ReDoc |

Templates: [.env.example](.env.example), [backend/.env.example](backend/.env.example)

---

## Documentation

| Guide | Audience |
|-------|----------|
| [INSTALL.md](INSTALL.md) | Engineers setting up locally |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Ops / DevOps |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Tenant administrators |
| [USER_GUIDE.md](USER_GUIDE.md) | Day-to-day operators |
| [API_GUIDE.md](API_GUIDE.md) | Integrators |
| [BRANDING_GUIDE.md](BRANDING_GUIDE.md) | Brand / product owners |
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | Integration engineers |
| [SECURITY.md](SECURITY.md) | Security review |
| [ROADMAP.md](ROADMAP.md) | Product planning |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [PROJECT_RELEASE_REPORT.md](PROJECT_RELEASE_REPORT.md) | Commercial readiness |

---

## License

See [LICENSE.md](LICENSE.md). Contact the vendor for commercial white-label licensing.

---

## Support

- Issues: use your delivery GitHub / ticketing channel
- Demo credentials are for non-production only — rotate before go-live
- API health: `GET /health`, readiness: `GET /ready`

---

## Roadmap

Completed through v1.0.0 (modules, API, auth, deploy packaging).  
Planned: multi-tenant isolation, live payment/SMS connectors, audit log export.  
See [ROADMAP.md](ROADMAP.md).
