"""
Self-contained API smoke test using SQLite (no Docker required).
Production still uses PostgreSQL + Alembic as documented in README.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
os.chdir(ROOT)
os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["SEED_ON_STARTUP"] = "false"

# ARRAY/JSONB are Postgres-specific — remap for this smoke test only.
from sqlalchemy import JSON, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

from app.models import entities as ent

# Patch column types on mapped classes for SQLite compatibility
ent.Role.__table__.c.permissions.type = JSON()
ent.FeatureFlags.__table__.c.flags.type = JSON()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.seed import seed_if_empty
from app.db.session import get_db
from app.main import create_app

engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=engine)

db = TestingSessionLocal()
seed_if_empty(db)
db.close()


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app = create_app()
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

print("health", client.get("/health").json())
print("docs", client.get("/docs").status_code)
print("openapi", client.get("/openapi.json").status_code)

products = client.get("/api/v1/products")
print("products", products.status_code, len(products.json()))

created = client.post(
    "/api/v1/products",
    json={
        "name": "API Smoke Product",
        "code": "SMOKE-1",
        "description": "test",
        "category": "motor",
        "status": "active",
        "minimumPremium": 1000,
        "currency": "NGN",
        "requiresInspection": False,
        "active": True,
    },
)
print("create product", created.status_code, created.json().get("code"))
pid = created.json()["id"]

updated = client.put(f"/api/v1/products/{pid}", json={"name": "API Smoke Updated"})
print("update product", updated.status_code, updated.json().get("name"))

roles = client.get("/api/v1/roles")
print("roles", roles.status_code, len(roles.json()))

branding = client.get("/api/v1/branding")
print("branding", branding.status_code, branding.json().get("companyName"))

flags = client.get("/api/v1/feature-flags")
print("flags", flags.status_code, len(flags.json().get("flags", {})))

deleted = client.delete(f"/api/v1/products/{pid}")
print("delete product", deleted.status_code, deleted.json())

missing = client.get("/api/v1/products/does-not-exist")
print("404", missing.status_code, missing.json().get("error", {}).get("code"))

print("SMOKE_OK")
