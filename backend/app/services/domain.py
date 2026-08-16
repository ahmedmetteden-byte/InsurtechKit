"""Service layer — business logic; repositories handle persistence only."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.entities import (
    Claim,
    CompanyBranding,
    Customer,
    FeatureFlags,
    Integration,
    OnboardingApplication,
    OnboardingDocument,
    Policy,
    Product,
    User,
)
from app.repositories import (
    BrandingRepository,
    ClaimRepository,
    CustomerRepository,
    FeatureFlagsRepository,
    IntegrationRepository,
    OnboardingApplicationRepository,
    OnboardingDocumentRepository,
    PermissionRepository,
    PolicyRepository,
    ProductRepository,
    RoleRepository,
    UserRepository,
)
from app.schemas.entities import (
    BrandingUpdate,
    ClaimCreate,
    ClaimUpdate,
    CustomerCreate,
    CustomerUpdate,
    FeatureFlagsUpdate,
    IntegrationCreate,
    IntegrationUpdate,
    OnboardingApplicationCreate,
    OnboardingApplicationStatusUpdate,
    PolicyCreate,
    PolicyUpdate,
    ProductCreate,
    ProductUpdate,
    UserCreate,
    UserUpdate,
)
from app.services.storage import resolve_path, save_upload
from app.utils.mappers import (
    branding_to_dict,
    claim_to_dict,
    customer_to_dict,
    flags_to_dict,
    integration_to_dict,
    onboarding_application_to_dict,
    onboarding_document_to_dict,
    permission_to_dict,
    policy_to_dict,
    product_to_dict,
    role_to_dict,
    user_to_dict,
)
from app.utils.serializers import to_iso

ONBOARDING_STATUSES = {"submitted", "in_review", "info_required", "approved", "declined"}
ONBOARDING_DOCUMENT_TYPES = {"identification", "proof_of_address", "other"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_UPLOAD_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)

    def list(self) -> list[dict]:
        return [product_to_dict(p) for p in self.repo.get_all()]

    def list_active(self) -> list[dict]:
        return [product_to_dict(p) for p in self.repo.get_all() if p.active]

    def get(self, id: str) -> dict:
        p = self.repo.get_by_id(id)
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        return product_to_dict(p)

    def create(self, data: ProductCreate) -> dict:
        if self.repo.get_by_code(data.code):
            raise HTTPException(status_code=409, detail=f"Product code '{data.code}' already exists")
        entity = Product(
            id=self.repo.new_id(),
            name=data.name,
            code=data.code,
            description=data.description,
            category=data.category,
            status=data.status,
            minimum_premium=data.minimum_premium,
            currency=data.currency,
            requires_inspection=data.requires_inspection,
            active=data.active,
        )
        return product_to_dict(self.repo.add(entity))

    def update(self, id: str, data: ProductUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Product not found")
        payload = data.model_dump(exclude_unset=True)
        if "code" in payload and payload["code"] != entity.code:
            existing = self.repo.get_by_code(payload["code"])
            if existing:
                raise HTTPException(status_code=409, detail=f"Product code '{payload['code']}' already exists")
        for field, value in payload.items():
            setattr(entity, field, value)
        return product_to_dict(self.repo.save(entity))

    def delete(self, id: str) -> None:
        if not self.repo.delete(id):
            raise HTTPException(status_code=404, detail="Product not found")


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)

    def list(self) -> list[dict]:
        return [customer_to_dict(c) for c in self.repo.get_all()]

    def get(self, id: str) -> dict:
        c = self.repo.get_by_id(id)
        if not c:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer_to_dict(c)

    def create(self, data: CustomerCreate) -> dict:
        if self.repo.get_by_number(data.customer_number):
            raise HTTPException(status_code=409, detail="Customer number already exists")
        entity = Customer(
            id=self.repo.new_id(),
            customer_number=data.customer_number,
            customer_type=data.customer_type,
            first_name=data.first_name,
            last_name=data.last_name,
            company_name=data.company_name,
            email=data.email,
            phone=data.phone,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            identification_type=data.identification_type,
            identification_number=data.identification_number,
            address=data.address,
            city=data.city,
            state=data.state,
            country=data.country,
            occupation=data.occupation,
            status=data.status,
            notes=data.notes,
        )
        return customer_to_dict(self.repo.add(entity))

    def update(self, id: str, data: CustomerUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Customer not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(entity, field, value)
        return customer_to_dict(self.repo.save(entity))

    def delete(self, id: str) -> None:
        if not self.repo.delete(id):
            raise HTTPException(status_code=404, detail="Customer not found")


class PolicyService:
    def __init__(self, db: Session):
        self.repo = PolicyRepository(db)
        self.customers = CustomerRepository(db)
        self.products = ProductRepository(db)

    def list(self) -> list[dict]:
        return [policy_to_dict(p) for p in self.repo.get_all()]

    def get(self, id: str) -> dict:
        p = self.repo.get_by_id(id)
        if not p:
            raise HTTPException(status_code=404, detail="Policy not found")
        return policy_to_dict(p)

    def create(self, data: PolicyCreate) -> dict:
        if self.repo.get_by_number(data.policy_number):
            raise HTTPException(status_code=409, detail="Policy number already exists")
        if not self.customers.get_by_id(data.customer_id):
            raise HTTPException(status_code=400, detail="Invalid customerId")
        if not self.products.get_by_id(data.product_id):
            raise HTTPException(status_code=400, detail="Invalid productId")
        entity = Policy(
            id=self.repo.new_id(),
            policy_number=data.policy_number,
            customer_id=data.customer_id,
            product_id=data.product_id,
            customer_name=data.customer_name,
            product_name=data.product_name,
            policy_type=data.policy_type,
            effective_date=data.effective_date,
            expiry_date=data.expiry_date,
            premium=data.premium,
            sum_insured=data.sum_insured,
            currency=data.currency,
            status=data.status,
            agent=data.agent,
            branch=data.branch,
        )
        return policy_to_dict(self.repo.add(entity))

    def update(self, id: str, data: PolicyUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Policy not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(entity, field, value)
        return policy_to_dict(self.repo.save(entity))

    def delete(self, id: str) -> None:
        if not self.repo.delete(id):
            raise HTTPException(status_code=404, detail="Policy not found")


class ClaimService:
    def __init__(self, db: Session):
        self.repo = ClaimRepository(db)
        self.policies = PolicyRepository(db)

    def list(self) -> list[dict]:
        return [claim_to_dict(c) for c in self.repo.get_all()]

    def get(self, id: str) -> dict:
        c = self.repo.get_by_id(id)
        if not c:
            raise HTTPException(status_code=404, detail="Claim not found")
        return claim_to_dict(c)

    def create(self, data: ClaimCreate) -> dict:
        if self.repo.get_by_number(data.claim_number):
            raise HTTPException(status_code=409, detail="Claim number already exists")
        if not self.policies.get_by_id(data.policy_id):
            raise HTTPException(status_code=400, detail="Invalid policyId")
        entity = Claim(
            id=self.repo.new_id(),
            claim_number=data.claim_number,
            policy_id=data.policy_id,
            policy_number=data.policy_number,
            customer_id=data.customer_id,
            customer_name=data.customer_name,
            product_name=data.product_name,
            incident_date=data.incident_date,
            reported_date=data.reported_date,
            claim_amount=data.claim_amount,
            approved_amount=data.approved_amount,
            currency=data.currency,
            description=data.description,
            status=data.status,
            assigned_to=data.assigned_to,
            notes=data.notes,
        )
        return claim_to_dict(self.repo.add(entity))

    def update(self, id: str, data: ClaimUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Claim not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(entity, field, value)
        return claim_to_dict(self.repo.save(entity))

    def delete(self, id: str) -> None:
        if not self.repo.delete(id):
            raise HTTPException(status_code=404, detail="Claim not found")


class OnboardingService:
    def __init__(self, db: Session):
        self.repo = OnboardingApplicationRepository(db)
        self.products = ProductRepository(db)
        self.customers = CustomerRepository(db)
        self.documents = OnboardingDocumentRepository(db)

    def _to_dict(self, application: OnboardingApplication) -> dict:
        data = onboarding_application_to_dict(application)
        data["documents"] = [
            onboarding_document_to_dict(d) for d in self.documents.get_by_application(application.id)
        ]
        return data

    def list(self) -> list[dict]:
        return [self._to_dict(a) for a in self.repo.get_all()]

    def get(self, id: str) -> dict:
        a = self.repo.get_by_id(id)
        if not a:
            raise HTTPException(status_code=404, detail="Application not found")
        return self._to_dict(a)

    def lookup(self, reference: str, email: str) -> dict:
        """Public, email-gated status check — used by applicants to track their application."""
        application = self.repo.get_by_reference(reference.strip().upper())
        if not application or application.applicant_email != email.strip().lower():
            raise HTTPException(status_code=404, detail="No application found for that reference and email")
        return {
            "id": application.id,
            "reference": application.reference,
            "productName": application.product_name,
            "applicantFirstName": application.applicant_first_name,
            "applicantLastName": application.applicant_last_name,
            "status": application.status,
            "createdAt": to_iso(application.created_at),
            "documents": [
                onboarding_document_to_dict(d) for d in self.documents.get_by_application(application.id)
            ],
        }

    def submit(self, data: OnboardingApplicationCreate) -> dict:
        if not data.consent:
            raise HTTPException(status_code=422, detail="Consent is required to submit an application")
        product = self.products.get_by_id(data.product_id)
        if not product or not product.active:
            raise HTTPException(status_code=400, detail="Invalid or inactive productId")
        entity = OnboardingApplication(
            id=self.repo.new_id(),
            reference=self._new_reference(),
            product_id=data.product_id,
            product_name=product.name,
            applicant_first_name=data.applicant_first_name,
            applicant_last_name=data.applicant_last_name,
            applicant_email=data.applicant_email.strip().lower(),
            applicant_phone=data.applicant_phone,
            message=data.message,
            consent=True,
            consent_at=_now_iso(),
            status="submitted",
        )
        return self._to_dict(self.repo.add(entity))

    def update_status(self, id: str, data: OnboardingApplicationStatusUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Application not found")
        payload = data.model_dump(exclude_unset=True)
        if "status" in payload and payload["status"] not in ONBOARDING_STATUSES:
            raise HTTPException(status_code=422, detail="Invalid status")
        for field, value in payload.items():
            setattr(entity, field, value)
        if entity.status == "approved" and not entity.customer_id:
            entity.customer_id = self._convert_to_customer(entity).id
        return self._to_dict(self.repo.save(entity))

    def save_document(
        self, application_id: str, document_type: str, filename: str, content_type: str, content: bytes
    ) -> dict:
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        if application.status != "info_required":
            raise HTTPException(
                status_code=409,
                detail="Documents can only be uploaded while the application is marked 'More Info Required'.",
            )
        if document_type not in ONBOARDING_DOCUMENT_TYPES:
            raise HTTPException(status_code=422, detail="Invalid document type")
        if not content:
            raise HTTPException(status_code=422, detail="Uploaded file is empty")
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds the 10MB upload limit")
        if content_type not in ALLOWED_UPLOAD_CONTENT_TYPES:
            raise HTTPException(
                status_code=415, detail="Unsupported file type. Upload a PDF, JPG, PNG, or WEBP file."
            )

        storage_path = save_upload(application_id, filename, content)
        document = OnboardingDocument(
            id=self.documents.new_id(),
            application_id=application_id,
            document_type=document_type,
            original_filename=filename,
            content_type=content_type,
            size_bytes=len(content),
            storage_path=storage_path,
        )
        return onboarding_document_to_dict(self.documents.add(document))

    def get_document_file(self, application_id: str, document_id: str) -> tuple[dict, Path]:
        document = self.documents.get_by_id(document_id)
        if not document or document.application_id != application_id:
            raise HTTPException(status_code=404, detail="Document not found")
        path = resolve_path(document.storage_path)
        if not path.exists():
            raise HTTPException(status_code=404, detail="File is missing from storage")
        return onboarding_document_to_dict(document), path

    def _convert_to_customer(self, application: OnboardingApplication) -> Customer:
        """Approving an application onboards the applicant as a real customer record."""
        customer = Customer(
            id=self.customers.new_id(),
            customer_number=self._new_customer_number(),
            customer_type="Individual",
            first_name=application.applicant_first_name,
            last_name=application.applicant_last_name,
            email=application.applicant_email,
            phone=application.applicant_phone,
            status="active",
            notes=f"Converted from onboarding application {application.reference}.",
        )
        return self.customers.add(customer)

    def _new_customer_number(self) -> str:
        for _ in range(5):
            candidate = f"CUS-{uuid4().hex[:8].upper()}"
            if not self.customers.get_by_number(candidate):
                return candidate
        raise HTTPException(status_code=500, detail="Could not generate a unique customer number")

    def _new_reference(self) -> str:
        for _ in range(5):
            candidate = f"APP-{uuid4().hex[:8].upper()}"
            if not self.repo.get_by_reference(candidate):
                return candidate
        raise HTTPException(status_code=500, detail="Could not generate a unique application reference")


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.roles = RoleRepository(db)
        self.permissions = PermissionRepository(db)

    def list(self) -> list[dict]:
        return [user_to_dict(u) for u in self.repo.get_all()]

    def get(self, id: str) -> dict:
        u = self.repo.get_by_id(id)
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
        return user_to_dict(u)

    def list_roles(self) -> list[dict]:
        return [role_to_dict(r) for r in self.roles.get_all()]

    def get_role(self, id: str) -> dict:
        r = self.roles.get_by_id(id)
        if not r:
            raise HTTPException(status_code=404, detail="Role not found")
        return role_to_dict(r)

    def list_permissions(self) -> list[dict]:
        return [permission_to_dict(p) for p in self.permissions.get_all()]

    def create(self, data: UserCreate) -> dict:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=409, detail="Email already exists")
        if self.repo.get_by_employee_id(data.employee_id):
            raise HTTPException(status_code=409, detail="Employee ID already exists")
        role = self.roles.get_by_id(data.role_id)
        if not role:
            raise HTTPException(status_code=400, detail="Invalid roleId")
        password = data.password or get_settings().DEMO_USER_PASSWORD
        entity = User(
            id=self.repo.new_id(),
            employee_id=data.employee_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email.strip().lower(),
            phone=data.phone,
            department=data.department,
            role_id=data.role_id,
            role_name=role.name,
            branch=data.branch,
            status=data.status,
            last_login=data.last_login,
            password_hash=hash_password(password),
        )
        return user_to_dict(self.repo.add(entity))

    def update(self, id: str, data: UserUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="User not found")
        payload = data.model_dump(exclude_unset=True)
        if "role_id" in payload:
            role = self.roles.get_by_id(payload["role_id"])
            if not role:
                raise HTTPException(status_code=400, detail="Invalid roleId")
            payload["role_name"] = role.name
        if "email" in payload and payload["email"]:
            payload["email"] = str(payload["email"]).strip().lower()
        password = payload.pop("password", None)
        if password:
            entity.password_hash = hash_password(password)
        for field, value in payload.items():
            setattr(entity, field, value)
        return user_to_dict(self.repo.save(entity))

    def delete(self, id: str) -> None:
        if not self.repo.delete(id):
            raise HTTPException(status_code=404, detail="User not found")


class IntegrationService:
    def __init__(self, db: Session):
        self.repo = IntegrationRepository(db)

    def list(self) -> list[dict]:
        return [integration_to_dict(i) for i in self.repo.get_all()]

    def get(self, id: str) -> dict:
        i = self.repo.get_by_id(id)
        if not i:
            raise HTTPException(status_code=404, detail="Integration not found")
        return integration_to_dict(i)

    def create(self, data: IntegrationCreate) -> dict:
        entity = Integration(
            id=self.repo.new_id(),
            name=data.name,
            type=data.type,
            provider=data.provider,
            status=data.status,
            base_url=data.base_url,
            api_key=data.api_key,
            api_secret=data.api_secret,
            username=data.username,
            password=data.password,
            webhook_url=data.webhook_url,
            timeout=data.timeout,
            enabled=data.enabled,
            last_health_check=data.last_health_check,
            notes=data.notes,
        )
        return integration_to_dict(self.repo.add(entity))

    def update(self, id: str, data: IntegrationUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Integration not found")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(entity, field, value)
        return integration_to_dict(self.repo.save(entity))

    def delete(self, id: str) -> None:
        if not self.repo.delete(id):
            raise HTTPException(status_code=404, detail="Integration not found")

    def test_connection(self, id: str) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Integration not found")
        if not entity.enabled or entity.status == "disabled":
            return {
                "ok": False,
                "message": "Enable the integration before testing the connection.",
                "integration": integration_to_dict(entity),
            }
        entity.status = "connected"
        entity.last_health_check = _now_iso()
        saved = self.repo.save(entity)
        return {
            "ok": True,
            "message": "Connection successful (simulated). Coming in Backend Phase for live checks.",
            "integration": integration_to_dict(saved),
        }


class BrandingService:
    def __init__(self, db: Session):
        self.repo = BrandingRepository(db)

    def get(self) -> dict:
        row = self.repo.get()
        if not row:
            raise HTTPException(status_code=404, detail="Branding not configured")
        return branding_to_dict(row)

    def update(self, data: BrandingUpdate) -> dict:
        row = self.repo.get()
        if not row:
            row = CompanyBranding(id="default", company_name="InsureNG")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(row, field, value)
        return branding_to_dict(self.repo.save(row))


class FeatureFlagsService:
    def __init__(self, db: Session):
        self.repo = FeatureFlagsRepository(db)

    def get(self) -> dict:
        row = self.repo.get()
        if not row:
            raise HTTPException(status_code=404, detail="Feature flags not configured")
        return flags_to_dict(row)

    def update(self, data: FeatureFlagsUpdate) -> dict:
        row = self.repo.get()
        if not row:
            row = FeatureFlags(id="default", flags={})
        row.flags = dict(data.flags)
        return flags_to_dict(self.repo.save(row))
