"""Seed baseline catalog data when the database is empty."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import CompanyBranding, FeatureFlags, Permission, Product, Role


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
        "claims.view", "claims.create", "claims.edit", "reports.view",
    ]),
    ("role-underwriter", "Underwriter", "Create and maintain products and policies; view customers.", [
        "dashboard.view", "products.view", "products.create", "products.edit",
        "customers.view", "policies.view", "policies.create", "policies.edit", "reports.view",
    ]),
    ("role-claims", "Claims Officer", "Manage the claims register including approvals.", [
        "dashboard.view", "customers.view", "policies.view",
        "claims.view", "claims.create", "claims.edit", "claims.approve", "reports.view",
    ]),
    ("role-cs", "Customer Service", "Serve policyholders.", [
        "dashboard.view", "products.view", "customers.view", "customers.create", "customers.edit",
        "policies.view", "policies.create", "claims.view", "claims.create",
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

DEFAULT_FLAGS = {
    "dashboard": True,
    "customers": True,
    "products": True,
    "policies": True,
    "claims": True,
    "users": True,
    "reports": True,
    "integrations": True,
    "agents": True,
    "brokers": True,
    "analytics": True,
    "settings": True,
}


def seed_if_empty(db: Session) -> None:
    has_roles = db.scalars(select(Role.id).limit(1)).first()
    if has_roles:
        return

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

    # Sample product so Swagger CRUD demos have a row
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

    db.commit()
