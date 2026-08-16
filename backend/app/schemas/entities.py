"""Pydantic v2 schemas — camelCase JSON matching the React domain models."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class APIModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# ── Products ───────────────────────────────────────────────────────────────

class ProductBase(APIModel):
    name: str
    code: str
    description: str = ""
    category: str
    status: str = "draft"
    minimum_premium: float = 0
    currency: str = "NGN"
    requires_inspection: bool = False
    active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(APIModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None
    minimum_premium: float | None = None
    currency: str | None = None
    requires_inspection: bool | None = None
    active: bool | None = None


class ProductRead(ProductBase):
    id: str
    created_at: str
    updated_at: str


# ── Customers ──────────────────────────────────────────────────────────────

class CustomerBase(APIModel):
    customer_number: str
    customer_type: str
    first_name: str = ""
    last_name: str = ""
    company_name: str = ""
    email: str = ""
    phone: str = ""
    date_of_birth: str = ""
    gender: str = ""
    identification_type: str = ""
    identification_number: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    country: str = "Nigeria"
    occupation: str = ""
    status: str = "active"
    notes: str = ""


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(APIModel):
    customer_number: str | None = None
    customer_type: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    company_name: str | None = None
    email: str | None = None
    phone: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    identification_type: str | None = None
    identification_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    occupation: str | None = None
    status: str | None = None
    notes: str | None = None


class CustomerRead(CustomerBase):
    id: str
    created_at: str
    updated_at: str


# ── Policies ───────────────────────────────────────────────────────────────

class PolicyBase(APIModel):
    policy_number: str
    customer_id: str
    product_id: str
    customer_name: str = ""
    product_name: str = ""
    policy_type: str = ""
    effective_date: str = ""
    expiry_date: str = ""
    premium: float = 0
    sum_insured: float = 0
    currency: str = "NGN"
    status: str = "pending"
    agent: str = ""
    branch: str = ""


class PolicyCreate(PolicyBase):
    pass


class PolicyUpdate(APIModel):
    policy_number: str | None = None
    customer_id: str | None = None
    product_id: str | None = None
    customer_name: str | None = None
    product_name: str | None = None
    policy_type: str | None = None
    effective_date: str | None = None
    expiry_date: str | None = None
    premium: float | None = None
    sum_insured: float | None = None
    currency: str | None = None
    status: str | None = None
    agent: str | None = None
    branch: str | None = None


class PolicyRead(PolicyBase):
    id: str
    created_at: str
    updated_at: str


# ── Claims ─────────────────────────────────────────────────────────────────

class ClaimBase(APIModel):
    claim_number: str
    policy_id: str
    policy_number: str = ""
    customer_id: str
    customer_name: str = ""
    product_name: str = ""
    incident_date: str = ""
    reported_date: str = ""
    claim_amount: float = 0
    approved_amount: float = 0
    currency: str = "NGN"
    description: str = ""
    status: str = "open"
    assigned_to: str = ""
    notes: str = ""


class ClaimCreate(ClaimBase):
    pass


class ClaimUpdate(APIModel):
    claim_number: str | None = None
    policy_id: str | None = None
    policy_number: str | None = None
    customer_id: str | None = None
    customer_name: str | None = None
    product_name: str | None = None
    incident_date: str | None = None
    reported_date: str | None = None
    claim_amount: float | None = None
    approved_amount: float | None = None
    currency: str | None = None
    description: str | None = None
    status: str | None = None
    assigned_to: str | None = None
    notes: str | None = None


class ClaimRead(ClaimBase):
    id: str
    created_at: str
    updated_at: str


# ── Onboarding Applications ──────────────────────────────────────────────────

class OnboardingApplicationCreate(APIModel):
    product_id: str
    applicant_first_name: str
    applicant_last_name: str
    applicant_email: str
    applicant_phone: str = ""
    message: str = ""
    consent: bool = False


class OnboardingApplicationStatusUpdate(APIModel):
    status: str | None = None
    review_notes: str | None = None


class OnboardingApplicationRead(APIModel):
    id: str
    reference: str
    product_id: str
    product_name: str
    applicant_first_name: str
    applicant_last_name: str
    applicant_email: str
    applicant_phone: str
    message: str
    consent: bool
    consent_at: str
    status: str
    review_notes: str
    customer_id: str
    documents: list[OnboardingDocumentRead] = Field(default_factory=list)
    notifications: list[NotificationRead] = Field(default_factory=list)
    payments: list[PaymentRead] = Field(default_factory=list)
    created_at: str
    updated_at: str


class PaymentRead(APIModel):
    id: str
    reference: str
    related_type: str
    related_id: str
    customer_id: str
    amount: float
    currency: str
    method: str
    status: str
    description: str
    paid_at: str
    receipt_number: str
    created_at: str
    updated_at: str


class PaymentMethodInput(APIModel):
    method: str


class StaffPaymentUpdate(APIModel):
    status: str
    method: str | None = None


class NotificationRead(APIModel):
    id: str
    channel: str
    recipient: str
    subject: str
    body: str
    template_key: str
    status: str
    related_type: str
    related_id: str
    created_at: str
    updated_at: str


class OnboardingDocumentRead(APIModel):
    id: str
    application_id: str
    document_type: str
    original_filename: str
    content_type: str
    size_bytes: int
    created_at: str
    updated_at: str


class OnboardingApplicationLookup(APIModel):
    reference: str
    email: str


class PublicOnboardingApplicationRead(APIModel):
    id: str
    reference: str
    product_name: str
    applicant_first_name: str
    applicant_last_name: str
    status: str
    created_at: str
    documents: list[OnboardingDocumentRead] = Field(default_factory=list)
    payments: list[PaymentRead] = Field(default_factory=list)


# ── Roles / Users ──────────────────────────────────────────────────────────

class RoleRead(APIModel):
    id: str
    name: str
    description: str = ""
    permissions: list[str] = Field(default_factory=list)
    created_at: str
    updated_at: str


class PermissionRead(APIModel):
    id: str
    code: str
    description: str = ""
    created_at: str
    updated_at: str


class UserBase(APIModel):
    employee_id: str
    first_name: str
    last_name: str
    email: str
    phone: str = ""
    department: str = ""
    role_id: str
    role_name: str = ""
    branch: str = ""
    status: str = "active"
    last_login: str = ""


class UserCreate(UserBase):
    password: str | None = None


class UserUpdate(APIModel):
    employee_id: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    role_id: str | None = None
    role_name: str | None = None
    branch: str | None = None
    status: str | None = None
    last_login: str | None = None
    password: str | None = None


class UserRead(UserBase):
    id: str
    created_at: str
    updated_at: str


# ── Integrations ───────────────────────────────────────────────────────────

class IntegrationBase(APIModel):
    name: str
    type: str
    provider: str
    status: str = "pending"
    base_url: str = ""
    api_key: str = ""
    api_secret: str = ""
    username: str = ""
    password: str = ""
    webhook_url: str = ""
    timeout: int = 30000
    enabled: bool = True
    last_health_check: str = ""
    notes: str = ""


class IntegrationCreate(IntegrationBase):
    pass


class IntegrationUpdate(APIModel):
    name: str | None = None
    type: str | None = None
    provider: str | None = None
    status: str | None = None
    base_url: str | None = None
    api_key: str | None = None
    api_secret: str | None = None
    username: str | None = None
    password: str | None = None
    webhook_url: str | None = None
    timeout: int | None = None
    enabled: bool | None = None
    last_health_check: str | None = None
    notes: str | None = None


class IntegrationRead(IntegrationBase):
    id: str
    created_at: str
    updated_at: str


class TestConnectionResponse(APIModel):
    ok: bool
    message: str
    integration: IntegrationRead | None = None


# ── Branding / Features ────────────────────────────────────────────────────

class BrandingBase(APIModel):
    company_name: str
    short_name: str = ""
    legal_name: str = ""
    tagline: str = ""
    portal_label: str = ""
    kit_label: str = ""
    admin_label: str = ""
    website: str = ""
    email_domain: str = ""
    support_email: str = ""
    claims_email: str = ""
    support_phone: str = ""
    whatsapp: str = ""
    address: str = ""
    logo_light: str = ""
    logo_dark: str = ""
    favicon: str = ""
    primary_color: str = "#1D4ED8"
    secondary_color: str = "#0F172A"
    accent_color: str = "#F59E0B"
    copyright: str = ""
    licence_no: str = ""


class BrandingUpdate(APIModel):
    company_name: str | None = None
    short_name: str | None = None
    legal_name: str | None = None
    tagline: str | None = None
    portal_label: str | None = None
    kit_label: str | None = None
    admin_label: str | None = None
    website: str | None = None
    email_domain: str | None = None
    support_email: str | None = None
    claims_email: str | None = None
    support_phone: str | None = None
    whatsapp: str | None = None
    address: str | None = None
    logo_light: str | None = None
    logo_dark: str | None = None
    favicon: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    accent_color: str | None = None
    copyright: str | None = None
    licence_no: str | None = None


class BrandingRead(BrandingBase):
    id: str = "default"
    created_at: str = ""
    updated_at: str = ""


class FeatureFlagsUpdate(APIModel):
    flags: dict[str, bool]


class FeatureFlagsRead(APIModel):
    id: str = "default"
    flags: dict[str, bool]
    created_at: str = ""
    updated_at: str = ""


class MessageResponse(APIModel):
    message: str
    detail: Any = None
