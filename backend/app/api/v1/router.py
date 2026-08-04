from fastapi import APIRouter, Depends, status

from app.dependencies.services import (
    get_branding_service,
    get_claim_service,
    get_customer_service,
    get_feature_flags_service,
    get_integration_service,
    get_policy_service,
    get_product_service,
    get_user_service,
)
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
    PermissionRead,
    PolicyCreate,
    PolicyRead,
    PolicyUpdate,
    ProductCreate,
    ProductRead,
    ProductUpdate,
    RoleRead,
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
    PolicyService,
    ProductService,
    UserService,
)

router = APIRouter()


# ── Products ───────────────────────────────────────────────────────────────

@router.get("/products", response_model=list[ProductRead], tags=["Products"])
def list_products(service: ProductService = Depends(get_product_service)):
    return service.list()


@router.get("/products/{id}", response_model=ProductRead, tags=["Products"])
def get_product(id: str, service: ProductService = Depends(get_product_service)):
    return service.get(id)


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED, tags=["Products"])
def create_product(body: ProductCreate, service: ProductService = Depends(get_product_service)):
    return service.create(body)


@router.put("/products/{id}", response_model=ProductRead, tags=["Products"])
def update_product(id: str, body: ProductUpdate, service: ProductService = Depends(get_product_service)):
    return service.update(id, body)


@router.delete("/products/{id}", response_model=MessageResponse, tags=["Products"])
def delete_product(id: str, service: ProductService = Depends(get_product_service)):
    service.delete(id)
    return {"message": "Product deleted"}


# ── Customers ──────────────────────────────────────────────────────────────

@router.get("/customers", response_model=list[CustomerRead], tags=["Customers"])
def list_customers(service: CustomerService = Depends(get_customer_service)):
    return service.list()


@router.get("/customers/{id}", response_model=CustomerRead, tags=["Customers"])
def get_customer(id: str, service: CustomerService = Depends(get_customer_service)):
    return service.get(id)


@router.post("/customers", response_model=CustomerRead, status_code=status.HTTP_201_CREATED, tags=["Customers"])
def create_customer(body: CustomerCreate, service: CustomerService = Depends(get_customer_service)):
    return service.create(body)


@router.put("/customers/{id}", response_model=CustomerRead, tags=["Customers"])
def update_customer(id: str, body: CustomerUpdate, service: CustomerService = Depends(get_customer_service)):
    return service.update(id, body)


@router.delete("/customers/{id}", response_model=MessageResponse, tags=["Customers"])
def delete_customer(id: str, service: CustomerService = Depends(get_customer_service)):
    service.delete(id)
    return {"message": "Customer deleted"}


# ── Policies ───────────────────────────────────────────────────────────────

@router.get("/policies", response_model=list[PolicyRead], tags=["Policies"])
def list_policies(service: PolicyService = Depends(get_policy_service)):
    return service.list()


@router.get("/policies/{id}", response_model=PolicyRead, tags=["Policies"])
def get_policy(id: str, service: PolicyService = Depends(get_policy_service)):
    return service.get(id)


@router.post("/policies", response_model=PolicyRead, status_code=status.HTTP_201_CREATED, tags=["Policies"])
def create_policy(body: PolicyCreate, service: PolicyService = Depends(get_policy_service)):
    return service.create(body)


@router.put("/policies/{id}", response_model=PolicyRead, tags=["Policies"])
def update_policy(id: str, body: PolicyUpdate, service: PolicyService = Depends(get_policy_service)):
    return service.update(id, body)


@router.delete("/policies/{id}", response_model=MessageResponse, tags=["Policies"])
def delete_policy(id: str, service: PolicyService = Depends(get_policy_service)):
    service.delete(id)
    return {"message": "Policy deleted"}


# ── Claims ─────────────────────────────────────────────────────────────────

@router.get("/claims", response_model=list[ClaimRead], tags=["Claims"])
def list_claims(service: ClaimService = Depends(get_claim_service)):
    return service.list()


@router.get("/claims/{id}", response_model=ClaimRead, tags=["Claims"])
def get_claim(id: str, service: ClaimService = Depends(get_claim_service)):
    return service.get(id)


@router.post("/claims", response_model=ClaimRead, status_code=status.HTTP_201_CREATED, tags=["Claims"])
def create_claim(body: ClaimCreate, service: ClaimService = Depends(get_claim_service)):
    return service.create(body)


@router.put("/claims/{id}", response_model=ClaimRead, tags=["Claims"])
def update_claim(id: str, body: ClaimUpdate, service: ClaimService = Depends(get_claim_service)):
    return service.update(id, body)


@router.delete("/claims/{id}", response_model=MessageResponse, tags=["Claims"])
def delete_claim(id: str, service: ClaimService = Depends(get_claim_service)):
    service.delete(id)
    return {"message": "Claim deleted"}


# ── Users / Roles ──────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserRead], tags=["Users"])
def list_users(service: UserService = Depends(get_user_service)):
    return service.list()


@router.get("/users/{id}", response_model=UserRead, tags=["Users"])
def get_user(id: str, service: UserService = Depends(get_user_service)):
    return service.get(id)


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(body: UserCreate, service: UserService = Depends(get_user_service)):
    return service.create(body)


@router.put("/users/{id}", response_model=UserRead, tags=["Users"])
def update_user(id: str, body: UserUpdate, service: UserService = Depends(get_user_service)):
    return service.update(id, body)


@router.delete("/users/{id}", response_model=MessageResponse, tags=["Users"])
def delete_user(id: str, service: UserService = Depends(get_user_service)):
    service.delete(id)
    return {"message": "User deleted"}


@router.get("/roles", response_model=list[RoleRead], tags=["Roles"])
def list_roles(service: UserService = Depends(get_user_service)):
    return service.list_roles()


@router.get("/roles/{id}", response_model=RoleRead, tags=["Roles"])
def get_role(id: str, service: UserService = Depends(get_user_service)):
    return service.get_role(id)


@router.get("/permissions", response_model=list[PermissionRead], tags=["Permissions"])
def list_permissions(service: UserService = Depends(get_user_service)):
    return service.list_permissions()


# ── Integrations ───────────────────────────────────────────────────────────

@router.get("/integrations", response_model=list[IntegrationRead], tags=["Integrations"])
def list_integrations(service: IntegrationService = Depends(get_integration_service)):
    return service.list()


@router.get("/integrations/{id}", response_model=IntegrationRead, tags=["Integrations"])
def get_integration(id: str, service: IntegrationService = Depends(get_integration_service)):
    return service.get(id)


@router.post("/integrations", response_model=IntegrationRead, status_code=status.HTTP_201_CREATED, tags=["Integrations"])
def create_integration(body: IntegrationCreate, service: IntegrationService = Depends(get_integration_service)):
    return service.create(body)


@router.put("/integrations/{id}", response_model=IntegrationRead, tags=["Integrations"])
def update_integration(id: str, body: IntegrationUpdate, service: IntegrationService = Depends(get_integration_service)):
    return service.update(id, body)


@router.delete("/integrations/{id}", response_model=MessageResponse, tags=["Integrations"])
def delete_integration(id: str, service: IntegrationService = Depends(get_integration_service)):
    service.delete(id)
    return {"message": "Integration deleted"}


@router.post("/integrations/{id}/test-connection", response_model=TestConnectionResponse, tags=["Integrations"])
def test_integration(id: str, service: IntegrationService = Depends(get_integration_service)):
    return service.test_connection(id)


# ── Branding / Feature Flags ───────────────────────────────────────────────

@router.get("/branding", response_model=BrandingRead, tags=["Branding"])
def get_branding(service: BrandingService = Depends(get_branding_service)):
    return service.get()


@router.put("/branding", response_model=BrandingRead, tags=["Branding"])
def update_branding(body: BrandingUpdate, service: BrandingService = Depends(get_branding_service)):
    return service.update(body)


@router.get("/feature-flags", response_model=FeatureFlagsRead, tags=["Feature Flags"])
def get_feature_flags(service: FeatureFlagsService = Depends(get_feature_flags_service)):
    return service.get()


@router.put("/feature-flags", response_model=FeatureFlagsRead, tags=["Feature Flags"])
def update_feature_flags(body: FeatureFlagsUpdate, service: FeatureFlagsService = Depends(get_feature_flags_service)):
    return service.update(body)
