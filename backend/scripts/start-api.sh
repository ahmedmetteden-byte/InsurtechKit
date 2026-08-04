#!/bin/sh
set -e

echo "[insurtech-api] starting…"

if [ "${RUN_MIGRATIONS_ON_STARTUP:-true}" = "true" ]; then
  echo "[insurtech-api] running alembic upgrade head…"
  alembic upgrade head
fi

echo "[insurtech-api] launching uvicorn…"
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --proxy-headers \
  --forwarded-allow-ips="*" \
  --timeout-graceful-shutdown "${GRACEFUL_SHUTDOWN_SECONDS:-30}"
