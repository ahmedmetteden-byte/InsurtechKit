# Deployment Guide

## Architecture (Compose)

```
Internet → Nginx (web :80/:8080)
              ├─ /          → static SPA
              ├─ /api/      → FastAPI
              ├─ /health    → API liveness
              └─ /ready     → API + DB readiness
         FastAPI (api :8000) → PostgreSQL (db :5432)
```

---

## Docker Compose

### Development / demo

```bash
cp .env.example .env
docker compose up -d --build
```

- Web: http://localhost:8080  
- API: http://localhost:8000  
- Swagger: http://localhost:8000/docs  

### Production overlay

```bash
export SECRET_KEY="$(openssl rand -hex 32)"
export DEMO_USER_PASSWORD="your-strong-password"
export CORS_ORIGINS="https://portal.example.com"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Production validation rejects:

- Default / short `SECRET_KEY`
- `SEED_ON_STARTUP=true`
- Demo `DEMO_USER_PASSWORD=Password123!`

---

## Reverse Proxy (Nginx)

Bundled configs:

| File | Role |
|------|------|
| `deploy/nginx/web.conf` | SPA container — static + `/api` proxy to `api:8000` |
| `deploy/nginx/edge.conf` | Optional host/edge proxy template |

Point TLS termination at the edge (`edge.conf`) and forward HTTP to `web`/`api`.

---

## HTTPS

1. Obtain certificates (Let's Encrypt, ACME, corporate PKI)
2. Mount into edge Nginx (`/etc/nginx/certs`)
3. Enable the TLS server block in `deploy/nginx/edge.conf`
4. Set `CORS_ORIGINS` to the HTTPS origin only
5. Prefer `VITE_API_BASE_URL=/api/v1` (same-origin) so browsers skip mixed content

---

## Environment variables

See `.env.example` and `backend/.env.example`.

| Variable | Production notes |
|----------|------------------|
| `SECRET_KEY` | Required, unique, ≥32 characters |
| `DATABASE_URL` | Use internal hostname `db` in Compose |
| `CORS_ORIGINS` | Exact browser origins |
| `SEED_ON_STARTUP` | `false` |
| `ENABLE_DOCS` | `false` unless internal-only |
| `RUN_MIGRATIONS_ON_STARTUP` | `true` on API boot (or run CI migrate job) |
| `GRACEFUL_SHUTDOWN_SECONDS` | Uvicorn drain window (default 30) |

---

## Database migration

Automatic (API container):

```bash
# start-api.sh
alembic upgrade head
uvicorn ...
```

Manual:

```bash
docker compose exec api alembic upgrade head
```

---

## Backups

PostgreSQL volume: `insurtech_pgdata`

Logical backup:

```bash
docker compose exec db pg_dump -U insurtech insurtech > backup-$(date +%F).sql
```

Restore:

```bash
cat backup-YYYY-MM-DD.sql | docker compose exec -T db psql -U insurtech insurtech
```

Schedule daily dumps and retain off-host copies. Test restore quarterly.

---

## Health checks

| Endpoint | Meaning | Expected |
|----------|---------|----------|
| `GET /health` | Process alive | `200` `{ "status": "ok" }` |
| `GET /ready` | DB reachable | `200` `{ "status": "ready" }` else `503` |

Compose healthchecks call `/ready` for `api` and HTTP for `web`.

Graceful shutdown: lifespan disposes the SQLAlchemy engine; uvicorn `--timeout-graceful-shutdown` waits for in-flight requests.

---

## Ops checklist

- [ ] Secrets not committed; `.env` gitignored
- [ ] Postgres not exposed publicly in production
- [ ] HTTPS enabled
- [ ] Demo users disabled or passwords rotated
- [ ] Backups verified
- [ ] `/ready` monitored
- [ ] CORS locked to production origins
