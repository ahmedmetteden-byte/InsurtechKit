"""
Regression: Demo Edition provisioning credentials authenticate via seed_if_empty.

Proves:
- Ada Okafor exists after the intended empty-DB seed
- Documented demo credentials (Password123!) succeed
- Incorrect credentials still return 401
- Password verification remains bcrypt-based (wrong hash / wrong password fail)
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
os.chdir(ROOT)

DEMO_EMAIL = "ada.okafor@insureng.com.ng"
DEMO_PASSWORD = "Password123!"

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["SEED_ON_STARTUP"] = "false"
os.environ["ENVIRONMENT"] = "demonstration"
os.environ["DEMO_USER_PASSWORD"] = DEMO_PASSWORD
os.environ["SECRET_KEY"] = "demo-auth-regression-secret-key-32chars"

from sqlalchemy import JSON, create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.models import entities as ent

ent.Role.__table__.c.permissions.type = JSON()
ent.FeatureFlags.__table__.c.flags.type = JSON()

from app.core.config import get_settings
from app.core.security import hash_password, verify_password
from app.db.base import Base
from app.db.seed import DEMO_USERS, seed_if_empty
from app.db.session import get_db
from app.main import create_app
from app.models.entities import User

get_settings.cache_clear()

engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _assert(cond: bool, msg: object) -> None:
    if not cond:
        raise AssertionError(msg)


# Intended Demo provisioning: empty DB + seed_if_empty (API lifespan path when SEED_ON_STARTUP)
db = TestingSessionLocal()
try:
    before = db.scalars(select(User.id).limit(1)).first()
    _assert(before is None, "fixture DB must start empty")
    seed_if_empty(db)
    ada = db.scalars(select(User).where(User.email == DEMO_EMAIL)).first()
    _assert(ada is not None, f"{DEMO_EMAIL} must exist after seed_if_empty")
    _assert(ada.status == "active", "Ada must be active")
    _assert(ada.role_id == "role-admin", "Ada must be administrator")
    _assert(verify_password(DEMO_PASSWORD, ada.password_hash), "seed must hash DEMO_USER_PASSWORD")
    _assert(not verify_password("WrongPassword!", ada.password_hash), "wrong password must not verify")
    _assert(len(db.scalars(select(User)).all()) == len(DEMO_USERS), "all DEMO_USERS must be seeded")
    print("OK demo user exists after seed_if_empty")
finally:
    db.close()

app = create_app()
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

ok = client.post("/api/v1/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
_assert(ok.status_code == 200, ok.text)
body = ok.json()
_assert(body.get("accessToken"), "access token required")
_assert(body.get("user", {}).get("email") == DEMO_EMAIL, body.get("user"))
print("OK documented demo credentials authenticate")

# Email normalization (case fold)
cased = client.post(
    "/api/v1/auth/login",
    json={"email": "Ada.Okafor@InsurEng.com.ng", "password": DEMO_PASSWORD},
)
_assert(cased.status_code == 200, cased.text)
print("OK email case-fold login")

bad = client.post("/api/v1/auth/login", json={"email": DEMO_EMAIL, "password": "WrongPassword!"})
_assert(bad.status_code == 401, bad.text)
_assert("Invalid email or password" in bad.text, bad.text)
print("OK incorrect credentials return 401")

missing = client.post(
    "/api/v1/auth/login",
    json={"email": "nobody@insureng.com.ng", "password": DEMO_PASSWORD},
)
_assert(missing.status_code == 401, missing.text)
print("OK unknown email returns 401")

# Password verification not weakened: empty / garbage hashes fail closed
_assert(verify_password(DEMO_PASSWORD, "") is False, "empty hash must fail")
_assert(verify_password(DEMO_PASSWORD, "not-a-bcrypt-hash") is False, "invalid hash must fail")
_assert(verify_password(DEMO_PASSWORD, hash_password("other")) is False, "mismatched bcrypt must fail")
print("OK password verification not weakened")

# Health paths (not under /api)
_assert(client.get("/health").status_code == 200, "/health")
_assert(client.get("/ready").status_code == 200, "/ready")
_assert(client.get("/api/health").status_code == 404, "/api/health must not exist")
_assert(client.get("/api/ready").status_code == 404, "/api/ready must not exist")
print("OK health paths are /health and /ready")

print("DEMO_AUTH_SEED_SMOKE_OK")
