# InsurtechKit API

FastAPI backend mirroring the React white-label modules.

## Stack

- FastAPI + Pydantic v2
- SQLAlchemy 2.x + Alembic
- PostgreSQL
- JWT access + refresh tokens (`app/core/security.py`) with RBAC permissions

## Quick start

```bash
cd backend
docker compose up -d
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
# optional fallback if alembic is blocked: python scripts/bootstrap_db.py
uvicorn app.main:app --reload --port 8000
```

Offline API smoke (SQLite, no Docker):

```bash
python scripts/smoke_api_sqlite.py
```

Swagger: http://localhost:8000/docs  
Health: http://localhost:8000/health

## Auth

| Endpoint | Notes |
|---|---|
| `POST /api/v1/auth/login` | Returns access + refresh tokens |
| `POST /api/v1/auth/refresh` | Rotates refresh token |
| `POST /api/v1/auth/logout` | Revokes refresh token |
| `GET /api/v1/auth/me` | Current user + permissions |
| `POST /api/v1/auth/change-password` | Authenticated |
| `POST /api/v1/auth/forgot-password` | Placeholder |
| `POST /api/v1/auth/reset-password` | Placeholder (501) |

Demo users are seeded with password `Password123!` (override via `DEMO_USER_PASSWORD`).

Example admin: `ada.okafor@insureng.com.ng`

Protected domain routes require Bearer access tokens and permission codes such as `products.view`, `customers.edit`, `claims.approve`, `reports.view`, `settings.manage`.

## Frontend

Set `VITE_DATA_PROVIDER=api` and `VITE_API_BASE_URL=http://localhost:8000/api/v1`. Memory mode remains the default for local UI work without the API.

## API prefix

`/api/v1`
