# InsurtechKit API

FastAPI backend mirroring the React white-label modules.

## Stack

- FastAPI + Pydantic v2
- SQLAlchemy 2.x + Alembic
- PostgreSQL
- JWT-ready (`app/core/security.py`) — auth enforced in Phase 6

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

## API prefix

`/api/v1`
