# InsurtechKit API

FastAPI backend for the InsurtechKit white-label portal.

**Version:** 1.0.0

## Quick start

```bash
# From repo root — full stack
docker compose up -d --build

# Or API + local Postgres only
cd backend
docker compose up -d
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Smoke (SQLite, no Docker):

```bash
python scripts/smoke_api_sqlite.py
```

- Swagger: http://localhost:8000/docs  
- Health: http://localhost:8000/health  
- Ready: http://localhost:8000/ready  

## Auth

See root [API_GUIDE.md](../API_GUIDE.md) and [SECURITY.md](../SECURITY.md).

Demo admin: `ada.okafor@insureng.com.ng` / `Password123!` (development seed only).

## Production

`ENVIRONMENT=production` enforces strong `SECRET_KEY`, disables seed-on-startup, and rejects the demo password default. Prefer the root Compose production overlay.
