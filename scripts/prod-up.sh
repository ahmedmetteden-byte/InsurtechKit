#!/usr/bin/env bash
# Production-style bring-up
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "Copy .env.example to .env and set SECRET_KEY before production deploy."
  cp .env.example .env
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose ps
curl -fsS "http://localhost:${API_PORT:-8000}/health" || true
curl -fsS "http://localhost:${API_PORT:-8000}/ready" || true
