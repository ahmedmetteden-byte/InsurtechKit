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
assert [n["templateKey"] for n in submitted.json()["notifications"]] == ["application_submitted"]

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
# in_review has no notification template — count must not grow
assert [n["templateKey"] for n in onboarding_review.json()["notifications"]] == ["application_submitted"]

# ── Onboarding documents: lookup, gated upload, staff download ────────────

lookup_wrong_email = client.post(
    "/api/v1/public/onboarding/applications/lookup",
    json={"reference": submitted.json()["reference"], "email": "someone.else@example.com"},
)
print("lookup wrong email", lookup_wrong_email.status_code)
assert lookup_wrong_email.status_code == 404

lookup_ok = client.post(
    "/api/v1/public/onboarding/applications/lookup",
    json={"reference": submitted.json()["reference"], "email": "chinwe.obi@example.com"},
)
print("lookup ok", lookup_ok.status_code, lookup_ok.json().get("status"))
assert lookup_ok.status_code == 200
assert lookup_ok.json()["status"] == "in_review"
assert "reviewNotes" not in lookup_ok.json()

upload_before_info_required = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/documents",
    data={"document_type": "identification"},
    files={"file": ("id.pdf", b"%PDF-1.4 fake id", "application/pdf")},
)
print("upload before info_required", upload_before_info_required.status_code)
assert upload_before_info_required.status_code == 409

onboarding_info_required = client.put(
    f"/api/v1/onboarding/applications/{application_id}",
    headers=headers,
    json={"status": "info_required"},
)
print("onboarding info_required", onboarding_info_required.status_code)
assert onboarding_info_required.status_code == 200
assert [n["templateKey"] for n in onboarding_info_required.json()["notifications"]] == [
    "application_submitted",
    "application_info_required",
]

upload_bad_type = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/documents",
    data={"document_type": "identification"},
    files={"file": ("virus.exe", b"not a real document", "application/x-msdownload")},
)
print("upload bad type", upload_bad_type.status_code)
assert upload_bad_type.status_code == 415

upload_ok = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/documents",
    data={"document_type": "identification"},
    files={"file": ("id.pdf", b"%PDF-1.4 fake id", "application/pdf")},
)
print("upload ok", upload_ok.status_code, upload_ok.json().get("originalFilename"))
assert upload_ok.status_code == 201
document_id = upload_ok.json()["id"]

application_after_upload = client.get(f"/api/v1/onboarding/applications/{application_id}", headers=headers)
print(
    "application after upload",
    application_after_upload.status_code,
    [n["templateKey"] for n in application_after_upload.json()["notifications"]],
)
assert [n["templateKey"] for n in application_after_upload.json()["notifications"]] == [
    "application_submitted",
    "application_info_required",
    "document_received",
]

lookup_after_upload = client.post(
    "/api/v1/public/onboarding/applications/lookup",
    json={"reference": submitted.json()["reference"], "email": "chinwe.obi@example.com"},
)
print("lookup after upload", lookup_after_upload.status_code, len(lookup_after_upload.json()["documents"]))
assert len(lookup_after_upload.json()["documents"]) == 1

download_unauth = client.get(f"/api/v1/onboarding/applications/{application_id}/documents/{document_id}/download")
print("download unauth", download_unauth.status_code)
assert download_unauth.status_code == 401

download_ok = client.get(
    f"/api/v1/onboarding/applications/{application_id}/documents/{document_id}/download", headers=headers
)
print("download ok", download_ok.status_code, len(download_ok.content))
assert download_ok.status_code == 200
assert download_ok.content == b"%PDF-1.4 fake id"

onboarding_approved = client.put(
    f"/api/v1/onboarding/applications/{application_id}",
    headers=headers,
    json={"status": "approved"},
)
print("onboarding approve", onboarding_approved.status_code, onboarding_approved.json().get("customerId"))
assert onboarding_approved.status_code == 200
converted_customer_id = onboarding_approved.json()["customerId"]
assert converted_customer_id
assert [n["templateKey"] for n in onboarding_approved.json()["notifications"]] == [
    "application_submitted",
    "application_info_required",
    "document_received",
    "application_approved",
]

converted_customer = client.get(f"/api/v1/customers/{converted_customer_id}", headers=headers)
print("converted customer", converted_customer.status_code, converted_customer.json().get("email"))
assert converted_customer.status_code == 200
assert converted_customer.json()["email"] == "chinwe.obi@example.com"

# ── Payments: invoice auto-created on approval, simulated pay, staff refund ─

seed_product = client.get(f"/api/v1/products/{seed_product_id}", headers=headers)
assert seed_product.status_code == 200

invoices = onboarding_approved.json()["payments"]
print("invoice created", len(invoices), invoices[0]["amount"] if invoices else None)
assert len(invoices) == 1
assert invoices[0]["status"] == "pending"
assert invoices[0]["amount"] == seed_product.json()["minimumPremium"]
assert invoices[0]["currency"] == seed_product.json()["currency"]
payment_id = invoices[0]["id"]

pay_bad_method = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/payments/{payment_id}/pay",
    json={"method": "cash-under-the-table"},
)
print("pay bad method", pay_bad_method.status_code)
assert pay_bad_method.status_code == 422

pay_wrong_application = client.post(
    f"/api/v1/public/onboarding/applications/not-a-real-app/payments/{payment_id}/pay",
    json={"method": "paystack"},
)
print("pay wrong application", pay_wrong_application.status_code)
assert pay_wrong_application.status_code in (404, 409)

claim_before_policy = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/claims",
    json={"incidentDate": "2026-08-01", "description": "Too early", "claimAmount": 1000},
)
print("claim before policy issued", claim_before_policy.status_code)
assert claim_before_policy.status_code == 409

certificate_before_policy = client.get(f"/api/v1/public/onboarding/applications/{application_id}/policy/certificate")
print("certificate before policy issued", certificate_before_policy.status_code)
assert certificate_before_policy.status_code == 404

pay_ok = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/payments/{payment_id}/pay",
    json={"method": "paystack"},
)
print("pay ok", pay_ok.status_code, pay_ok.json().get("receiptNumber"))
assert pay_ok.status_code == 200
assert pay_ok.json()["status"] == "paid"
assert pay_ok.json()["receiptNumber"]

receipt_wrong_payment = client.get(
    f"/api/v1/public/onboarding/applications/{application_id}/payments/not-a-real-payment/receipt"
)
print("receipt wrong payment", receipt_wrong_payment.status_code)
assert receipt_wrong_payment.status_code == 404

receipt_pdf = client.get(f"/api/v1/public/onboarding/applications/{application_id}/payments/{payment_id}/receipt")
print("receipt pdf", receipt_pdf.status_code, receipt_pdf.headers.get("content-type"), len(receipt_pdf.content))
assert receipt_pdf.status_code == 200
assert receipt_pdf.headers["content-type"] == "application/pdf"
assert receipt_pdf.content[:4] == b"%PDF"

pay_again = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/payments/{payment_id}/pay",
    json={"method": "paystack"},
)
print("pay already paid", pay_again.status_code)
assert pay_again.status_code == 409

application_after_payment = client.get(f"/api/v1/onboarding/applications/{application_id}", headers=headers)
assert [n["templateKey"] for n in application_after_payment.json()["notifications"]] == [
    "application_submitted",
    "application_info_required",
    "document_received",
    "application_approved",
    "payment_received",
]

# ── Policy issuance + claims ────────────────────────────────────────────────

policy_number = application_after_payment.json()["policyNumber"]
print("policy issued", policy_number)
assert policy_number.startswith("POL-")
policy_id = application_after_payment.json()["policyId"]

certificate_pdf = client.get(f"/api/v1/public/onboarding/applications/{application_id}/policy/certificate")
print("certificate pdf", certificate_pdf.status_code, certificate_pdf.headers.get("content-type"))
assert certificate_pdf.status_code == 200
assert certificate_pdf.headers["content-type"] == "application/pdf"
assert certificate_pdf.content[:4] == b"%PDF"

certificate_staff_unauth = client.get(f"/api/v1/policies/{policy_id}/certificate")
print("certificate staff unauth", certificate_staff_unauth.status_code)
assert certificate_staff_unauth.status_code == 401

certificate_staff = client.get(f"/api/v1/policies/{policy_id}/certificate", headers=headers)
print("certificate staff", certificate_staff.status_code, len(certificate_staff.content))
assert certificate_staff.status_code == 200
assert certificate_staff.content[:4] == b"%PDF"

claim_no_application = client.post(
    "/api/v1/public/onboarding/applications/not-a-real-app/claims",
    json={"incidentDate": "2026-08-01", "description": "Windscreen cracked by a stone", "claimAmount": 50000},
)
print("claim no application", claim_no_application.status_code)
assert claim_no_application.status_code == 404

claim_submitted = client.post(
    f"/api/v1/public/onboarding/applications/{application_id}/claims",
    json={"incidentDate": "2026-08-01", "description": "Windscreen cracked by a stone", "claimAmount": 50000},
)
print("claim submitted", claim_submitted.status_code, claim_submitted.json().get("claimNumber"))
assert claim_submitted.status_code == 201
assert claim_submitted.json()["policyNumber"] == policy_number
assert claim_submitted.json()["status"] == "open"
claim_id = claim_submitted.json()["id"]

claim_in_staff_list = client.get("/api/v1/claims", headers=headers)
print("claim visible in staff register", claim_in_staff_list.status_code, len(claim_in_staff_list.json()))
assert any(c["id"] == claim_id for c in claim_in_staff_list.json())

application_after_claim = client.get(f"/api/v1/onboarding/applications/{application_id}", headers=headers)
assert len(application_after_claim.json()["claims"]) == 1
assert application_after_claim.json()["claims"][0]["id"] == claim_id

lookup_with_claim = client.post(
    "/api/v1/public/onboarding/applications/lookup",
    json={"reference": submitted.json()["reference"], "email": "chinwe.obi@example.com"},
)
print("lookup shows claim", lookup_with_claim.status_code, len(lookup_with_claim.json()["claims"]))
assert len(lookup_with_claim.json()["claims"]) == 1
assert "notes" not in lookup_with_claim.json()["claims"][0]
assert "assignedTo" not in lookup_with_claim.json()["claims"][0]

claim_status_update = client.put(
    f"/api/v1/claims/{claim_id}",
    headers=headers,
    json={"status": "under_review"},
)
print("claim status update", claim_status_update.status_code)
assert claim_status_update.status_code == 200

application_after_claim_review = client.get(f"/api/v1/onboarding/applications/{application_id}", headers=headers)
assert application_after_claim_review.json()["claims"][0]["status"] == "under_review"

refund_forbidden = client.put(
    f"/api/v1/onboarding/applications/{application_id}/payments/{payment_id}",
    headers=finance_headers,
    json={"status": "refunded"},
)
print("refund forbidden", refund_forbidden.status_code)
assert refund_forbidden.status_code == 403

refund_ok = client.put(
    f"/api/v1/onboarding/applications/{application_id}/payments/{payment_id}",
    headers=headers,
    json={"status": "refunded"},
)
print("refund ok", refund_ok.status_code, refund_ok.json().get("status"))
assert refund_ok.status_code == 200
assert refund_ok.json()["status"] == "refunded"

application_after_refund = client.get(f"/api/v1/onboarding/applications/{application_id}", headers=headers)
assert [n["templateKey"] for n in application_after_refund.json()["notifications"]] == [
    "application_submitted",
    "application_info_required",
    "document_received",
    "application_approved",
    "payment_received",
    "payment_refunded",
]

onboarding_reapproved = client.put(
    f"/api/v1/onboarding/applications/{application_id}",
    headers=headers,
    json={"status": "approved", "reviewNotes": "Re-confirmed"},
)
print("onboarding re-approve idempotent", onboarding_reapproved.status_code, onboarding_reapproved.json().get("customerId"))
assert onboarding_reapproved.json()["customerId"] == converted_customer_id
# Status didn't actually change (still "approved") — no duplicate notification or invoice
assert len(onboarding_reapproved.json()["notifications"]) == len(application_after_refund.json()["notifications"])
assert len(onboarding_reapproved.json()["payments"]) == 1

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
