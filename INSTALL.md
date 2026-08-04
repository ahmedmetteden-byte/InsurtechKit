# Installation Guide

## Prerequisites

- Node.js 20+ (22 recommended)
- Python 3.12+
- Docker Desktop (PostgreSQL and/or full stack)
- Git

---

## Frontend setup

```bash
cd "Insurtech Template - Cursor"
cp .env.example .env
npm install
```

Key env vars:

```env
VITE_DATA_PROVIDER=memory   # or api
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

```bash
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # preview production build
```

---

## Backend setup

```bash
cd backend
cp .env.example .env
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

---

## Database setup

### Docker Postgres (recommended)

```bash
docker compose -f backend/docker-compose.yml up -d
```

Default: user/password/db `insurtech`, port `5432`.

### Migrations

```bash
cd backend
alembic upgrade head
```

Fallback (dev only, no Alembic history):

```bash
python scripts/bootstrap_db.py
```

Verify:

```bash
python scripts/check_db.py
```

---

## Docker setup (full stack)

From repository root:

```bash
cp .env.example .env
docker compose up -d --build
```

Services:

| Service | Port | Role |
|---------|------|------|
| `db` | 5432 | PostgreSQL 16 |
| `api` | 8000 | FastAPI + Alembic on start |
| `web` | 8080 | Nginx + built SPA |

---

## Running locally

1. Start DB (`backend/docker-compose.yml`)
2. Run migrations + `uvicorn app.main:app --reload --port 8000`
3. Run `npm run dev` with `VITE_DATA_PROVIDER=api` (or `memory` without API)

Helpers:

- `scripts/dev.ps1` (Windows)
- `scripts/dev.sh` (Linux/macOS)

Offline API smoke (no Docker):

```bash
cd backend
python scripts/smoke_api_sqlite.py
```

---

## Running production

1. Set strong `SECRET_KEY` (≥32 chars) and non-demo `DEMO_USER_PASSWORD`
2. Set `ENVIRONMENT=production`, `SEED_ON_STARTUP=false`, `ENABLE_DOCS=false`
3. Build and run:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Or: `scripts/prod-up.sh`

See [DEPLOYMENT.md](DEPLOYMENT.md) for Nginx, HTTPS, backups, and health checks.
