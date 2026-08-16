from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import FileResponse

from app.api.v1.auth import router as auth_router
from app.dependencies.auth import get_user_permissions, require_permission
from app.dependencies.services import (
    get_branding_service,
    get_claim_service,
    get_customer_service,
    get_feature_flags_service,
    get_integration_service,
    get_onboarding_service,
    get_policy_service,
    get_product_service,
    get_user_service,
)
from app.db.session import get_db
from app.models.entities import User
from app.schemas.entities import (
    BrandingRead,
    BrandingUpdate,
    ClaimCreate,
    ClaimRead,
    ClaimUpdate,
    CustomerCreate,
    CustomerRead,
    CustomerUpdate,
    FeatureFlagsRead,
    FeatureFlagsUpdate,
    IntegrationCreate,
    IntegrationRead,
    IntegrationUpdate,
    MessageResponse,
    OnboardingApplicationCreate,
    OnboardingApplicationLookup,
    OnboardingApplicationRead,
    OnboardingApplicationStatusUpdate,
    OnboardingDocumentRead,
    PaymentMethodInput,
    PaymentRead,
    PermissionRead,
    PolicyCreate,
    PolicyRead,
    PolicyUpdate,
    ProductCreate,
    ProductRead,
    ProductUpdate,
    PublicOnboardingApplicationRead,
    RoleRead,
    StaffPaymentUpdate,
    TestConnectionResponse,
    UserCreate,
    UserRead,
    UserUpdate,
)
from app.services.domain import (
    BrandingService,
    ClaimService,
    CustomerService,
    FeatureFlagsService,
    IntegrationService,
    OnboardingService,
    PolicyService,
    ProductService,
    UserService,
)
from fastapi import HTTPException
from sqlalchemy.orm import Session

router = APIRouter()
router.include_router(auth_router)


# ── Products ───────────────────────────────────────────────────────────────

@router.get("/products", response_model=list[ProductRead], tags=["Products"])
def list_products(
    _: User = Depends(require_permission("products.view")),
    service: ProductService = Depends(get_product_service),
):
    return service.list()


@router.get("/products/{id}", response_model=ProductRead, tags=["Products"])
def get_product(
    id: str,
    _: User = Depends(require_permission("products.view")),
    service: ProductService = Depends(get_product_service),
):
    return service.get(id)


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED, tags=["Products"])
def create_product(
    body: ProductCreate,
    _: User = Depends(require_permission("products.create")),
    service: ProductService = Depends(get_product_service),
):
    return service.create(body)


@router.put("/products/{id}", response_model=ProductRead, tags=["Products"])
def update_product(
    id: str,
    body: ProductUpdate,
    _: User = Depends(require_permission("products.edit")),
    service: ProductService = Depends(get_product_service),
):
    return service.update(id, body)


@router.delete("/products/{id}", response_model=MessageResponse, tags=["Products"])
def delete_product(
    id: str,
    _: User = Depends(require_permission("products.delete")),
    service: ProductService = Depends(get_product_service),
):
    service.delete(id)
    return {"message": "Product deleted"}


# ── Customers ──────────────────────────────────────────────────────────────

@router.get("/customers", response_model=list[CustomerRead], tags=["Customers"])
def list_customers(
    _: User = Depends(require_permission("customers.view")),
    service: CustomerService = Depends(get_customer_service),
):
    return service.list()


@router.get("/customers/{id}", response_model=CustomerRead, tags=["Customers"])
def get_customer(
    id: str,
    _: User = Depends(require_permission("customers.view")),
    service: CustomerService = Depends(get_customer_service),
):
    return service.get(id)


@router.post("/customers", response_model=CustomerRead, status_code=status.HTTP_201_CREATED, tags=["Customers"])
def create_customer(
    body: CustomerCreate,
    _: User = Depends(require_permission("customers.create")),
    service: CustomerService = Depends(get_customer_service),
):
    return service.create(body)


@router.put("/customers/{id}", response_model=CustomerRead, tags=["Customers"])
def update_customer(
    id: str,
    body: CustomerUpdate,
    _: User = Depends(require_permission("customers.edit")),
    service: CustomerService = Depends(get_customer_service),
):
    return service.update(id, body)


@router.delete("/customers/{id}", response_model=MessageResponse, tags=["Customers"])
def delete_customer(
    id: str,
    _: User = Depends(require_permission("customers.delete")),
    service: CustomerService = Depends(get_customer_service),
):
    service.delete(id)
    return {"message": "Customer deleted"}


# ── Policies ───────────────────────────────────────────────────────────────

@router.get("/policies", response_model=list[PolicyRead], tags=["Policies"])
def list_policies(
    _: User = Depends(require_permission("policies.view")),
    service: PolicyService = Depends(get_policy_service),
):
    return service.list()


@router.get("/policies/{id}", response_model=PolicyRead, tags=["Policies"])
def get_policy(
    id: str,
    _: User = Depends(require_permission("policies.view")),
    service: PolicyService = Depends(get_policy_service),
):
    return service.get(id)


@router.post("/policies", response_model=PolicyRead, status_code=status.HTTP_201_CREATED, tags=["Policies"])
def create_policy(
    body: PolicyCreate,
    _: User = Depends(require_permission("policies.create")),
    service: PolicyService = Depends(get_policy_service),
):
    return service.create(body)


@router.put("/policies/{id}", response_model=PolicyRead, tags=["Policies"])
def update_policy(
    id: str,
    body: PolicyUpdate,
    _: User = Depends(require_permission("policies.edit")),
    service: PolicyService = Depends(get_policy_service),
):
    return service.update(id, body)


@router.delete("/policies/{id}", response_model=MessageResponse, tags=["Policies"])
def delete_policy(
    id: str,
    _: User = Depends(require_permission("policies.delete")),
    service: PolicyService = Depends(get_policy_service),
):
    service.delete(id)
    return {"message": "Policy deleted"}


# ── Claims ─────────────────────────────────────────────────────────────────

@router.get("/claims", response_model=list[ClaimRead], tags=["Claims"])
def list_claims(
    _: User = Depends(require_permission("claims.view")),
    service: ClaimService = Depends(get_claim_service),
):
    return service.list()


@router.get("/claims/{id}", response_model=ClaimRead, tags=["Claims"])
def get_claim(
    id: str,
    _: User = Depends(require_permission("claims.view")),
    service: ClaimService = Depends(get_claim_service),
):
    return service.get(id)


@router.post("/claims", response_model=ClaimRead, status_code=status.HTTP_201_CREATED, tags=["Claims"])
def create_claim(
    body: ClaimCreate,
    _: User = Depends(require_permission("claims.create")),
    service: ClaimService = Depends(get_claim_service),
):
    return service.create(body)


@router.put("/claims/{id}", response_model=ClaimRead, tags=["Claims"])
def update_claim(
    id: str,
    body: ClaimUpdate,
    user: User = Depends(require_permission("claims.edit", "claims.approve")),
    service: ClaimService = Depends(get_claim_service),
    db: Session = Depends(get_db),
):
    payload = body.model_dump(exclude_unset=True)
    status_value = str(payload.get("status", "")).lower()
    if status_value in {"approved", "approve", "settled"}:
        held = set(get_user_permissions(db, user))
        if "claims.approve" not in held:
            raise HTTPException(status_code=403, detail="Missing required permission: claims.approve")
    elif "claims.edit" not in set(get_user_permissions(db, user)):
        raise HTTPException(status_code=403, detail="Missing required permission: claims.edit")
    return service.update(id, body)


@router.delete("/claims/{id}", response_model=MessageResponse, tags=["Claims"])
def delete_claim(
    id: str,
    _: User = Depends(require_permission("claims.edit")),
    service: ClaimService = Depends(get_claim_service),
):
    service.delete(id)
    return {"message": "Claim deleted"}


# ── Public (no auth) ──────────────────────────────────────────────────────
# Customer onboarding starts before any account exists — catalogue browsing
# and application submission must work without a session.

@router.get("/public/products", response_model=list[ProductRead], tags=["Public"])
def list_public_products(service: ProductService = Depends(get_product_service)):
    return service.list_active()


@router.post(
    "/public/onboarding/applications",
    response_model=OnboardingApplicationRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Public"],
)
def submit_onboarding_application(
    body: OnboardingApplicationCreate,
    service: OnboardingService = Depends(get_onboarding_service),
):
    return service.submit(body)


@router.post(
    "/public/onboarding/applications/lookup",
    response_model=PublicOnboardingApplicationRead,
    tags=["Public"],
)
def lookup_onboarding_application(
    body: OnboardingApplicationLookup,
    service: OnboardingService = Depends(get_onboarding_service),
):
    return service.lookup(body.reference, body.email)


@router.post(
    "/public/onboarding/applications/{id}/documents",
    response_model=OnboardingDocumentRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Public"],
)
async def upload_onboarding_document(
    id: str,
    document_type: str = Form("other"),
    file: UploadFile = File(...),
    service: OnboardingService = Depends(get_onboarding_service),
):
    content = await file.read()
    return service.save_document(id, document_type, file.filename or "upload", file.content_type or "", content)


@router.post(
    "/public/onboarding/applications/{id}/payments/{payment_id}/pay",
    response_model=PaymentRead,
    tags=["Public"],
)
def pay_onboarding_invoice(
    id: str,
    payment_id: str,
    body: PaymentMethodInput,
    service: OnboardingService = Depends(get_onboarding_service),
):
    return service.pay(id, payment_id, body.method)


# ── Onboarding (staff review) ─────────────────────────────────────────────

@router.get("/onboarding/applications", response_model=list[OnboardingApplicationRead], tags=["Onboarding"])
def list_onboarding_applications(
    _: User = Depends(require_permission("onboarding.view")),
    service: OnboardingService = Depends(get_onboarding_service),
):
    return service.list()


@router.get("/onboarding/applications/{id}", response_model=OnboardingApplicationRead, tags=["Onboarding"])
def get_onboarding_application(
    id: str,
    _: User = Depends(require_permission("onboarding.view")),
    service: OnboardingService = Depends(get_onboarding_service),
):
    return service.get(id)


@router.put("/onboarding/applications/{id}", response_model=OnboardingApplicationRead, tags=["Onboarding"])
def update_onboarding_application(
    id: str,
    body: OnboardingApplicationStatusUpdate,
    _: User = Depends(require_permission("onboarding.review")),
    service: OnboardingService = Depends(get_onboarding_service),
):
    return service.update_status(id, body)


@router.get("/onboarding/applications/{id}/documents/{doc_id}/download", tags=["Onboarding"])
def download_onboarding_document(
    id: str,
    doc_id: str,
    _: User = Depends(require_permission("onboarding.view")),
    service: OnboardingService = Depends(get_onboarding_service),
):
    document, path = service.get_document_file(id, doc_id)
    return FileResponse(
        path,
        media_type=document["contentType"] or "application/octet-stream",
        filename=document["originalFilename"],
    )


@router.put(
    "/onboarding/applications/{id}/payments/{payment_id}",
    response_model=PaymentRead,
    tags=["Onboarding"],
)
def update_onboarding_payment(
    id: str,
    payment_id: str,
    body: StaffPaymentUpdate,
    _: User = Depends(require_permission("onboarding.review")),
    service: OnboardingService = Depends(get_onboarding_service),
):
    return service.staff_update_payment(id, payment_id, body.status, body.method)


# ── Users / Roles ──────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserRead], tags=["Users"])
def list_users(
    _: User = Depends(require_permission("users.manage")),
    service: UserService = Depends(get_user_service),
):
    return service.list()


@router.get("/users/{id}", response_model=UserRead, tags=["Users"])
def get_user(
    id: str,
    _: User = Depends(require_permission("users.manage")),
    service: UserService = Depends(get_user_service),
):
    return service.get(id)


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(
    body: UserCreate,
    _: User = Depends(require_permission("users.manage")),
    service: UserService = Depends(get_user_service),
):
    return service.create(body)


@router.put("/users/{id}", response_model=UserRead, tags=["Users"])
def update_user(
    id: str,
    body: UserUpdate,
    _: User = Depends(require_permission("users.manage")),
    service: UserService = Depends(get_user_service),
):
    return service.update(id, body)


@router.delete("/users/{id}", response_model=MessageResponse, tags=["Users"])
def delete_user(
    id: str,
    _: User = Depends(require_permission("users.manage")),
    service: UserService = Depends(get_user_service),
):
    service.delete(id)
    return {"message": "User deleted"}


@router.get("/roles", response_model=list[RoleRead], tags=["Roles"])
def list_roles(
    _: User = Depends(require_permission("users.manage", "dashboard.view")),
    service: UserService = Depends(get_user_service),
):
    return service.list_roles()


@router.get("/roles/{id}", response_model=RoleRead, tags=["Roles"])
def get_role(
    id: str,
    _: User = Depends(require_permission("users.manage", "dashboard.view")),
    service: UserService = Depends(get_user_service),
):
    return service.get_role(id)


@router.get("/permissions", response_model=list[PermissionRead], tags=["Permissions"])
def list_permissions(
    _: User = Depends(require_permission("users.manage")),
    service: UserService = Depends(get_user_service),
):
    return service.list_permissions()


# ── Integrations ───────────────────────────────────────────────────────────

@router.get("/integrations", response_model=list[IntegrationRead], tags=["Integrations"])
def list_integrations(
    _: User = Depends(require_permission("settings.manage")),
    service: IntegrationService = Depends(get_integration_service),
):
    return service.list()


@router.get("/integrations/{id}", response_model=IntegrationRead, tags=["Integrations"])
def get_integration(
    id: str,
    _: User = Depends(require_permission("settings.manage")),
    service: IntegrationService = Depends(get_integration_service),
):
    return service.get(id)


@router.post("/integrations", response_model=IntegrationRead, status_code=status.HTTP_201_CREATED, tags=["Integrations"])
def create_integration(
    body: IntegrationCreate,
    _: User = Depends(require_permission("settings.manage")),
    service: IntegrationService = Depends(get_integration_service),
):
    return service.create(body)


@router.put("/integrations/{id}", response_model=IntegrationRead, tags=["Integrations"])
def update_integration(
    id: str,
    body: IntegrationUpdate,
    _: User = Depends(require_permission("settings.manage")),
    service: IntegrationService = Depends(get_integration_service),
):
    return service.update(id, body)


@router.delete("/integrations/{id}", response_model=MessageResponse, tags=["Integrations"])
def delete_integration(
    id: str,
    _: User = Depends(require_permission("settings.manage")),
    service: IntegrationService = Depends(get_integration_service),
):
    service.delete(id)
    return {"message": "Integration deleted"}


@router.post("/integrations/{id}/test-connection", response_model=TestConnectionResponse, tags=["Integrations"])
def test_integration(
    id: str,
    _: User = Depends(require_permission("settings.manage")),
    service: IntegrationService = Depends(get_integration_service),
):
    return service.test_connection(id)


# ── Branding / Feature Flags ───────────────────────────────────────────────
# GET stays public so the marketing site can load branding without a session.
# Mutations require settings.manage.

@router.get("/branding", response_model=BrandingRead, tags=["Branding"])
def get_branding(service: BrandingService = Depends(get_branding_service)):
    return service.get()


@router.put("/branding", response_model=BrandingRead, tags=["Branding"])
def update_branding(
    body: BrandingUpdate,
    _: User = Depends(require_permission("settings.manage")),
    service: BrandingService = Depends(get_branding_service),
):
    return service.update(body)


@router.get("/feature-flags", response_model=FeatureFlagsRead, tags=["Feature Flags"])
def get_feature_flags(service: FeatureFlagsService = Depends(get_feature_flags_service)):
    return service.get()


@router.put("/feature-flags", response_model=FeatureFlagsRead, tags=["Feature Flags"])
def update_feature_flags(
    body: FeatureFlagsUpdate,
    _: User = Depends(require_permission("settings.manage")),
    service: FeatureFlagsService = Depends(get_feature_flags_service),
):
    return service.update(body)


# Reports are aggregated client-side; dashboard.view / reports.view gate admin nav.
# Keep a lightweight authenticated probe for permission checks.
@router.get("/reports/access", response_model=MessageResponse, tags=["Reports"])
def reports_access(_: User = Depends(require_permission("reports.view"))):
    return {"message": "Reports access granted"}
