"""SQLAlchemy models mirroring frontend domain entities."""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, StringIdMixin, TimestampMixin


class Product(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")
    minimum_premium: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="NGN", nullable=False)
    requires_inspection: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Customer(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "customers"

    customer_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    customer_type: Mapped[str] = mapped_column(String(32), nullable=False)
    first_name: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    last_name: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    email: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    phone: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    date_of_birth: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    gender: Mapped[str] = mapped_column(String(16), default="", nullable=False)
    identification_type: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    identification_number: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    city: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    state: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    country: Mapped[str] = mapped_column(String(128), default="Nigeria", nullable=False)
    occupation: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)


class Policy(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "policies"

    policy_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(String(64), ForeignKey("products.id"), nullable=False, index=True)
    customer_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    policy_type: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    effective_date: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    expiry_date: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    premium: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    sum_insured: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="NGN", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    agent: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    branch: Mapped[str] = mapped_column(String(128), default="", nullable=False)


class Claim(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "claims"

    claim_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    policy_id: Mapped[str] = mapped_column(String(64), ForeignKey("policies.id"), nullable=False, index=True)
    policy_number: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    customer_id: Mapped[str] = mapped_column(String(64), ForeignKey("customers.id"), nullable=False, index=True)
    customer_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    incident_date: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    reported_date: Mapped[str] = mapped_column(String(32), default="", nullable=False)
    claim_amount: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    approved_amount: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="NGN", nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open", nullable=False)
    assigned_to: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)


class OnboardingApplication(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "onboarding_applications"

    reference: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(String(64), ForeignKey("products.id"), nullable=False, index=True)
    product_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    applicant_first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    applicant_last_name: Mapped[str] = mapped_column(String(128), nullable=False)
    applicant_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    applicant_phone: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    message: Mapped[str] = mapped_column(Text, default="", nullable=False)
    consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    consent_at: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="submitted", nullable=False)
    review_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    customer_id: Mapped[str | None] = mapped_column(
        String(64), ForeignKey("customers.id"), default=None, nullable=True, index=True
    )


class Role(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    permissions: Mapped[list] = mapped_column(ARRAY(String), default=list, nullable=False)

    users: Mapped[list["User"]] = relationship(back_populates="role")


class Permission(StringIdMixin, TimestampMixin, Base):
    """Catalog of permission codes (strongly typed on the frontend)."""

    __tablename__ = "permissions"
    __table_args__ = (UniqueConstraint("code", name="uq_permissions_code"),)

    code: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)


class User(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    employee_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_name: Mapped[str] = mapped_column(String(128), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    department: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    role_id: Mapped[str] = mapped_column(String(64), ForeignKey("roles.id"), nullable=False, index=True)
    role_name: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    branch: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    last_login: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), default="", nullable=False)

    role: Mapped["Role"] = relationship(back_populates="users")


class RefreshToken(StringIdMixin, TimestampMixin, Base):
    """Persisted refresh tokens for logout / rotation."""

    __tablename__ = "refresh_tokens"

    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    jti: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Integration(StringIdMixin, TimestampMixin, Base):
    __tablename__ = "integrations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    provider: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    base_url: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    api_key: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    api_secret: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    username: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    password: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    webhook_url: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    timeout: Mapped[int] = mapped_column(Integer, default=30000, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_health_check: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)


class CompanyBranding(TimestampMixin, Base):
    """Singleton-style branding row (id fixed to 'default')."""

    __tablename__ = "company_branding"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default="default")
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    short_name: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    legal_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    tagline: Mapped[str] = mapped_column(Text, default="", nullable=False)
    portal_label: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    kit_label: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    admin_label: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    website: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    email_domain: Mapped[str] = mapped_column(String(128), default="", nullable=False)
    support_email: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    claims_email: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    support_phone: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    whatsapp: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    logo_light: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    logo_dark: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    favicon: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    primary_color: Mapped[str] = mapped_column(String(32), default="#1D4ED8", nullable=False)
    secondary_color: Mapped[str] = mapped_column(String(32), default="#0F172A", nullable=False)
    accent_color: Mapped[str] = mapped_column(String(32), default="#F59E0B", nullable=False)
    copyright: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    licence_no: Mapped[str] = mapped_column(String(64), default="", nullable=False)


class FeatureFlags(TimestampMixin, Base):
    """Singleton feature-flag map stored as JSONB."""

    __tablename__ = "feature_flags"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default="default")
    flags: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
