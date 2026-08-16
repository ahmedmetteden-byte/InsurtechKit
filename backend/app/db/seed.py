"""Seed baseline catalog data when the database is empty."""
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.entities import CompanyBranding, FeatureFlags, Permission, Product, Role, User


PERMISSIONS = [
    ("dashboard.view", "View dashboard"),
    ("products.view", "View products"),
    ("products.create", "Create products"),
    ("products.edit", "Edit products"),
    ("products.delete", "Delete products"),
    ("customers.view", "View customers"),
    ("customers.create", "Create customers"),
    ("customers.edit", "Edit customers"),
    ("customers.delete", "Delete customers"),
    ("policies.view", "View policies"),
    ("policies.create", "Create policies"),
    ("policies.edit", "Edit policies"),
    ("policies.delete", "Delete policies"),
    ("claims.view", "View claims"),
    ("claims.create", "Create claims"),
    ("claims.edit", "Edit claims"),
    ("claims.approve", "Approve claims"),
    ("onboarding.view", "View onboarding applications"),
    ("onboarding.review", "Review and decide onboarding applications"),
    ("reports.view", "View reports"),
    ("settings.manage", "Manage settings"),
    ("users.manage", "Manage users"),
]

ALL_PERMS = [p[0] for p in PERMISSIONS]

ROLES = [
    ("role-admin", "Administrator", "Full platform access including settings and user management.", ALL_PERMS),
    ("role-ops", "Operations Manager", "Oversee products, customers, policies, and claims operations.", [
        "dashboard.view", "products.view", "products.create", "products.edit",
        "customers.view", "customers.create", "customers.edit",
        "policies.view", "policies.create", "policies.edit",
        "claims.view", "claims.create", "claims.edit",
        "onboarding.view", "onboarding.review", "reports.view",
    ]),
    ("role-underwriter", "Underwriter", "Create and maintain products and policies; view customers.", [
        "dashboard.view", "products.view", "products.create", "products.edit",
        "customers.view", "policies.view", "policies.create", "policies.edit",
        "onboarding.view", "onboarding.review", "reports.view",
    ]),
    ("role-claims", "Claims Officer", "Manage the claims register including approvals.", [
        "dashboard.view", "customers.view", "policies.view",
        "claims.view", "claims.create", "claims.edit", "claims.approve", "reports.view",
    ]),
    ("role-cs", "Customer Service", "Serve policyholders.", [
        "dashboard.view", "products.view", "customers.view", "customers.create", "customers.edit",
        "policies.view", "policies.create", "claims.view", "claims.create", "onboarding.view",
    ]),
    ("role-finance", "Finance Officer", "View premiums, policies, claims amounts, and reports.", [
        "dashboard.view", "customers.view", "policies.view", "claims.view", "reports.view",
    ]),
    ("role-branch", "Branch Manager", "Manage branch-level customers, policies, and claims.", [
        "dashboard.view", "products.view", "customers.view", "customers.create", "customers.edit",
        "policies.view", "policies.create", "policies.edit",
        "claims.view", "claims.create", "claims.edit", "reports.view",
    ]),
    ("role-broker", "Broker", "Place business.", [
        "dashboard.view", "products.view", "customers.view", "customers.create",
        "policies.view", "policies.create", "claims.view",
    ]),
    ("role-agent", "Agent", "Field sales.", [
        "dashboard.view", "products.view", "customers.view", "customers.create", "policies.view",
    ]),
    ("role-viewer", "Viewer", "Read-only access.", [
        "dashboard.view", "products.view", "customers.view", "policies.view", "claims.view", "reports.view",
    ]),
]

# Mirrors frontend defaultUsers — shared demo password from settings.
DEMO_USERS = [
    ("usr-001", "EMP-1001", "Kunle", "Adesanya", "kunle.adesanya@insureng.com.ng", "+234 803 100 1001", "Claims", "role-claims", "Lagos Island", "active"),
    ("usr-002", "EMP-1002", "Amaka", "Okeke", "amaka.okeke@insureng.com.ng", "+234 802 200 2002", "Customer Service", "role-cs", "Abuja Central", "active"),
    ("usr-003", "EMP-1003", "Chidi", "Nwosu", "chidi.nwosu@insureng.com.ng", "+234 805 300 3003", "Underwriting", "role-underwriter", "Port Harcourt", "active"),
    ("usr-004", "EMP-1004", "Hauwa", "Ibrahim", "hauwa.ibrahim@insureng.com.ng", "+234 806 400 4004", "Operations", "role-ops", "Kano", "active"),
    ("usr-005", "EMP-1005", "Tolu", "Adeyemi", "tolu.adeyemi@insureng.com.ng", "+234 807 500 5005", "Finance", "role-finance", "Lagos Island", "active"),
    ("usr-006", "EMP-1006", "Ngozi", "Adebayo", "ngozi.adebayo@insureng.com.ng", "+234 808 600 6006", "Claims", "role-claims", "Ibadan", "active"),
    ("usr-007", "EMP-1007", "Emeka", "Okonkwo", "emeka.okonkwo@insureng.com.ng", "+234 809 700 7007", "Branch Management", "role-branch", "Enugu", "active"),
    ("usr-008", "EMP-1008", "Fatima", "Bello", "fatima.bello@insureng.com.ng", "+234 810 800 8008", "Sales", "role-broker", "Abuja Central", "active"),
    ("usr-009", "EMP-1009", "Ibrahim", "Sule", "ibrahim.sule@insureng.com.ng", "+234 811 900 9009", "Sales", "role-agent", "Kaduna", "inactive"),
    ("usr-010", "EMP-1010", "Ada", "Okafor", "ada.okafor@insureng.com.ng", "+234 812 010 1010", "IT", "role-admin", "Lagos Island", "active"),
    ("usr-011", "EMP-1011", "Yusuf", "Garba", "yusuf.garba@insureng.com.ng", "+234 813 110 1111", "Finance", "role-viewer", "Kano", "suspended"),
    ("usr-012", "EMP-1012", "Blessing", "Eze", "blessing.eze@insureng.com.ng", "+234 814 120 1212", "Underwriting", "role-underwriter", "Warri", "active"),
]

DEFAULT_FLAGS = {
    "dashboard": True,
    "customers": True,
    "products": True,
    "policies": True,
    "claims": True,
    "onboarding": True,
    "users": True,
    "reports": True,
    "integrations": True,
    "agents": True,
    "brokers": True,
    "analytics": True,
    "settings": True,
}


def _seed_users(db: Session) -> None:
    if db.scalars(select(User.id).limit(1)).first():
        return
    password_hash = hash_password(get_settings().DEMO_USER_PASSWORD)
    role_names = {r[0]: r[1] for r in ROLES}
    now = datetime.now(timezone.utc).isoformat()
    for uid, emp, first, last, email, phone, dept, role_id, branch, status in DEMO_USERS:
        db.add(
            User(
                id=uid,
                employee_id=emp,
                first_name=first,
                last_name=last,
                email=email,
                phone=phone,
                department=dept,
                role_id=role_id,
                role_name=role_names.get(role_id, ""),
                branch=branch,
                status=status,
                last_login=now if status == "active" else "",
                password_hash=password_hash,
            )
        )


def seed_if_empty(db: Session) -> None:
    has_roles = db.scalars(select(Role.id).limit(1)).first()
    if not has_roles:
        for code, desc in PERMISSIONS:
            db.add(Permission(id=f"perm-{code.replace('.', '-')}", code=code, description=desc))

        for role_id, name, description, perms in ROLES:
            db.add(Role(id=role_id, name=name, description=description, permissions=list(perms)))

        if not db.get(CompanyBranding, "default"):
            db.add(
                CompanyBranding(
                    id="default",
                    company_name="InsureNG",
                    short_name="InsureNG",
                    legal_name="InsureNG Ltd.",
                    tagline="Nigeria's leading white-label insurance portal. NAICOM licensed and regulated.",
                    portal_label="White-Label Portal",
                    kit_label="White-Label Platform Kit",
                    admin_label="Admin Console",
                    website="https://www.insureng.com.ng",
                    email_domain="insureng.com.ng",
                    support_email="hello@insureng.com.ng",
                    claims_email="claims@insureng.com.ng",
                    support_phone="0800-INSURE-NG",
                    whatsapp="+234 901 000 0000",
                    address="Plot 14, Broad Street, Lagos Island",
                    logo_light="",
                    logo_dark="",
                    favicon="",
                    primary_color="#1D4ED8",
                    secondary_color="#0F172A",
                    accent_color="#F59E0B",
                    copyright="© 2025 InsureNG Ltd. All rights reserved.",
                    licence_no="IA-2024-0089",
                )
            )

        if not db.get(FeatureFlags, "default"):
            db.add(FeatureFlags(id="default", flags=dict(DEFAULT_FLAGS)))

        if not db.scalars(select(Product.id).limit(1)).first():
            db.add(
                Product(
                    id="prd-seed-motor",
                    name="Motor Comprehensive",
                    code="MOT-COMP",
                    description="Full motor cover seed product",
                    category="motor",
                    status="active",
                    minimum_premium=42000,
                    currency="NGN",
                    requires_inspection=False,
                    active=True,
                )
            )

    _seed_users(db)
    db.commit()
