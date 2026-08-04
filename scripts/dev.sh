#!/usr/bin/env bash
# Local development helper (Linux/macOS)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Starting PostgreSQL (backend/docker-compose.yml)"
docker compose -f backend/docker-compose.yml up -d

echo "==> Backend: ensure venv + deps"
cd backend
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000 &
API_PID=$!
cd "$ROOT"

echo "==> Frontend"
npm install
npm run dev &
WEB_PID=$!

trap 'kill $API_PID $WEB_PID 2>/dev/null || true' EXIT
echo "API http://localhost:8000  |  Web http://localhost:5173  |  Ctrl+C to stop"
wait
