# Local development helper (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Starting PostgreSQL (backend/docker-compose.yml)"
docker compose -f backend/docker-compose.yml up -d

Write-Host "==> Backend venv + migrations"
Set-Location "$Root\backend"
if (-not (Test-Path .venv)) {
  python -m venv .venv
}
& .\.venv\Scripts\python.exe -m pip install -q -r requirements.txt
& .\.venv\Scripts\alembic.exe upgrade head

Write-Host "Start API:  cd backend; .\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"
Write-Host "Start Web:  npm install; npm run dev"
Write-Host "Compose:    docker compose up -d --build   (full stack on :8080)"
