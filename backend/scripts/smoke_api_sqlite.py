"""
Self-contained API smoke test using SQLite (no Docker required).
Validates JWT auth, permission gates, and CRUD under an admin token.
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
os.environ["DEMO_USER_PASSWORD"] = "Password123!"

# ARRAY/JSONB are Postgres-specific — remap for this smoke test only.
from sqlalchemy import JSON

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

# Unauthenticated product list must fail
denied = client.get("/api/v1/products")
print("products unauth", denied.status_code)

# Login
login = client.post(
    "/api/v1/auth/login",
    json={"email": "ada.okafor@insureng.com.ng", "password": "Password123!"},
)
print("login", login.status_code, login.json().get("user", {}).get("email"))
assert login.status_code == 200, login.text
tokens = login.json()
access = tokens["accessToken"]
refresh = tokens["refreshToken"]
headers = {"Authorization": f"Bearer {access}"}

me = client.get("/api/v1/auth/me", headers=headers)
print("me", me.status_code, me.json().get("roleName"), len(me.json().get("permissions", [])))
assert me.status_code == 200

products = client.get("/api/v1/products", headers=headers)
print("products", products.status_code, len(products.json()))
assert products.status_code == 200

created = client.post(
    "/api/v1/products",
    headers=headers,
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
assert created.status_code == 201
pid = created.json()["id"]

# Viewer cannot create products
viewer_login = client.post(
    "/api/v1/auth/login",
    json={"email": "yusuf.garba@insureng.com.ng", "password": "Password123!"},
)
# suspended viewer — expect 403
print("suspended login", viewer_login.status_code)

viewer_login = client.post(
    "/api/v1/auth/login",
    json={"email": "tolu.adeyemi@insureng.com.ng", "password": "Password123!"},
)
print("finance login", viewer_login.status_code)
finance_headers = {"Authorization": f"Bearer {viewer_login.json()['accessToken']}"}
forbidden = client.post(
    "/api/v1/products",
    headers=finance_headers,
    json={
        "name": "Nope",
        "code": "NOPE",
        "category": "motor",
        "status": "draft",
        "minimumPremium": 1,
        "currency": "NGN",
        "requiresInspection": False,
        "active": True,
    },
)
print("finance create product", forbidden.status_code)
assert forbidden.status_code == 403

# ── Onboarding: public catalogue + application submission + staff review ──

public_products = client.get("/api/v1/public/products")
print("public products", public_products.status_code, len(public_products.json()))
assert public_products.status_code == 200
assert all(p["active"] for p in public_products.json())
seed_product_id = public_products.json()[0]["id"]

no_consent = client.post(
    "/api/v1/public/onboarding/applications",
    json={
        "productId": seed_product_id,
        "applicantFirstName": "Chinwe",
        "applicantLastName": "Obi",
        "applicantEmail": "chinwe.obi@example.com",
        "applicantPhone": "+234 800 000 0000",
        "message": "Interested in cover",
        "consent": False,
    },
)
print("onboarding without consent", no_consent.status_code)
assert no_consent.status_code == 422

submitted = client.post(
    "/api/v1/public/onboarding/applications",
    json={
        "productId": seed_product_id,
        "applicantFirstName": "Chinwe",
        "applicantLastName": "Obi",
        "applicantEmail": "chinwe.obi@example.com",
        "applicantPhone": "+234 800 000 0000",
        "message": "Interested in cover",
        "consent": True,
    },
)
print("onboarding submit", submitted.status_code, submitted.json().get("reference"))
assert submitted.status_code == 201
application_id = submitted.json()["id"]
assert submitted.json()["status"] == "submitted"

onboarding_unauth = client.get("/api/v1/onboarding/applications")
print("onboarding list unauth", onboarding_unauth.status_code)
assert onboarding_unauth.status_code == 401

onboarding_forbidden = client.put(
    f"/api/v1/onboarding/applications/{application_id}",
    headers=finance_headers,
    json={"status": "in_review"},
)
print("onboarding review forbidden", onboarding_forbidden.status_code)
assert onboarding_forbidden.status_code == 403

onboarding_list = client.get("/api/v1/onboarding/applications", headers=headers)
print("onboarding list staff", onboarding_list.status_code, len(onboarding_list.json()))
assert onboarding_list.status_code == 200
assert any(a["id"] == application_id for a in onboarding_list.json())

onboarding_review = client.put(
    f"/api/v1/onboarding/applications/{application_id}",
    headers=headers,
    json={"status": "in_review", "reviewNotes": "Awaiting KYC documents"},
)
print("onboarding review", onboarding_review.status_code, onboarding_review.json().get("status"))
assert onboarding_review.status_code == 200
assert onboarding_review.json()["status"] == "in_review"
assert onboarding_review.json()["customerId"] == ""

onboarding_approved = client.put(
    f"/api/v1/onboarding/applications/{application_id}",
    headers=headers,
    json={"status": "approved"},
)
print("onboarding approve", onboarding_approved.status_code, onboarding_approved.json().get("customerId"))
assert onboarding_approved.status_code == 200
converted_customer_id = onboarding_approved.json()["customerId"]
assert converted_customer_id

converted_customer = client.get(f"/api/v1/customers/{converted_customer_id}", headers=headers)
print("converted customer", converted_customer.status_code, converted_customer.json().get("email"))
assert converted_customer.status_code == 200
assert converted_customer.json()["email"] == "chinwe.obi@example.com"

onboarding_reapproved = client.put(
    f"/api/v1/onboarding/applications/{application_id}",
    headers=headers,
    json={"status": "approved", "reviewNotes": "Re-confirmed"},
)
print("onboarding re-approve idempotent", onboarding_reapproved.status_code, onboarding_reapproved.json().get("customerId"))
assert onboarding_reapproved.json()["customerId"] == converted_customer_id

refreshed = client.post("/api/v1/auth/refresh", json={"refreshToken": refresh})
print("refresh", refreshed.status_code)
assert refreshed.status_code == 200
access2 = refreshed.json()["accessToken"]
headers2 = {"Authorization": f"Bearer {access2}"}

updated = client.put(f"/api/v1/products/{pid}", headers=headers2, json={"name": "API Smoke Updated"})
print("update product", updated.status_code, updated.json().get("name"))

change_pw = client.post(
    "/api/v1/auth/change-password",
    headers=headers2,
    json={"currentPassword": "Password123!", "newPassword": "Password123!"},
)
print("change password", change_pw.status_code)

forgot = client.post("/api/v1/auth/forgot-password", json={"email": "ada.okafor@insureng.com.ng"})
print("forgot password", forgot.status_code, forgot.json().get("message", "")[:40])

logout = client.post("/api/v1/auth/logout", json={"refreshToken": refreshed.json()["refreshToken"]})
print("logout", logout.status_code)

# Old refresh should now fail
dead = client.post("/api/v1/auth/refresh", json={"refreshToken": refreshed.json()["refreshToken"]})
print("refresh after logout", dead.status_code)
assert dead.status_code == 401

branding = client.get("/api/v1/branding")
print("branding public", branding.status_code, branding.json().get("companyName"))

print("SMOKE_OK")
