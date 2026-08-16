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
    Notification,
    OnboardingApplication,
    OnboardingDocument,
    Payment,
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
    NotificationRepository,
    OnboardingApplicationRepository,
    OnboardingDocumentRepository,
    PaymentRepository,
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
from app.services.notifications import CLAIM_STATUS_TEMPLATE, STATUS_TEMPLATE, deliver, render
from app.services.storage import resolve_path, save_upload
from app.utils.mappers import (
    branding_to_dict,
    claim_to_dict,
    customer_to_dict,
    flags_to_dict,
    integration_to_dict,
    notification_to_dict,
    onboarding_application_to_dict,
    onboarding_document_to_dict,
    payment_to_dict,
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
PAYMENT_METHODS = {"paystack", "flutterwave", "bank_transfer", "other"}


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
        self.customers = CustomerRepository(db)
        self.notifications = NotificationService(db)

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
        previous_status = entity.status
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(entity, field, value)
        saved = self.repo.save(entity)
        if saved.status != previous_status:
            self._notify_status_change(saved)
        return claim_to_dict(saved)

    def _notify_status_change(self, claim: Claim) -> None:
        template_key = CLAIM_STATUS_TEMPLATE.get(claim.status)
        if not template_key:
            return
        customer = self.customers.get_by_id(claim.customer_id)
        if not customer or not customer.email:
            return
        self.notifications.send(
            template_key,
            customer.email,
            {
                "firstName": customer.first_name,
                "claimNumber": claim.claim_number,
                "approvedAmount": f"{claim.currency} {claim.approved_amount:,.2f}",
            },
            "claim",
            claim.id,
        )

    def delete(self, id: str) -> None:
        if not self.repo.delete(id):
            raise HTTPException(status_code=404, detail="Claim not found")


class NotificationService:
    """Template + provider-adapter notification dispatch.

    Any module can call `send()` with a template key and a polymorphic
    (related_type, related_id) pair — swapping `deliver()` for a real
    email/SMS provider later requires no changes here or at call sites.
    """

    def __init__(self, db: Session):
        self.repo = NotificationRepository(db)

    def send(self, template_key: str, recipient: str, context: dict, related_type: str, related_id: str) -> dict:
        subject, body = render(template_key, context)
        deliver("email", recipient, subject, body)
        entity = Notification(
            id=self.repo.new_id(),
            channel="email",
            recipient=recipient,
            subject=subject,
            body=body,
            template_key=template_key,
            status="sent",
            related_type=related_type,
            related_id=related_id,
        )
        return notification_to_dict(self.repo.add(entity))

    def list_for(self, related_type: str, related_id: str) -> list[dict]:
        return [notification_to_dict(n) for n in self.repo.get_by_related(related_type, related_id)]


class PaymentService:
    """Provider-neutral payment/invoice dispatch — no live gateway is wired.

    `method` just records which rail the customer chose; connecting a real
    Paystack/Flutterwave/bank-transfer integration later means adding a call
    inside `mark_paid`, not changing callers.
    """

    def __init__(self, db: Session):
        self.repo = PaymentRepository(db)

    def get(self, id: str) -> Payment:
        payment = self.repo.get_by_id(id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment

    def create_for(
        self, related_type: str, related_id: str, customer_id: str | None, amount: float, currency: str, description: str
    ) -> dict:
        entity = Payment(
            id=self.repo.new_id(),
            reference=self._new_reference(),
            related_type=related_type,
            related_id=related_id,
            customer_id=customer_id or None,
            amount=amount,
            currency=currency,
            status="pending",
            description=description,
        )
        return payment_to_dict(self.repo.add(entity))

    def list_for(self, related_type: str, related_id: str) -> list[dict]:
        return [payment_to_dict(p) for p in self.repo.get_by_related(related_type, related_id)]

    def mark_paid(self, id: str, method: str) -> dict:
        payment = self.get(id)
        if payment.status == "paid":
            raise HTTPException(status_code=409, detail="Payment has already been marked as paid")
        if payment.status == "refunded":
            raise HTTPException(status_code=409, detail="This payment was refunded and cannot be marked as paid")
        if method not in PAYMENT_METHODS:
            raise HTTPException(status_code=422, detail="Invalid payment method")
        payment.status = "paid"
        payment.method = method
        payment.paid_at = _now_iso()
        payment.receipt_number = self._new_receipt_number()
        return payment_to_dict(self.repo.save(payment))

    def refund(self, id: str) -> dict:
        payment = self.get(id)
        if payment.status != "paid":
            raise HTTPException(status_code=409, detail="Only paid payments can be refunded")
        payment.status = "refunded"
        return payment_to_dict(self.repo.save(payment))

    def _new_reference(self) -> str:
        for _ in range(5):
            candidate = f"PAY-{uuid4().hex[:8].upper()}"
            if not self.repo.get_by_reference(candidate):
                return candidate
        raise HTTPException(status_code=500, detail="Could not generate a unique payment reference")

    def _new_receipt_number(self) -> str:
        for _ in range(5):
            candidate = f"RCT-{uuid4().hex[:8].upper()}"
            if not self.repo.get_by_receipt_number(candidate):
                return candidate
        raise HTTPException(status_code=500, detail="Could not generate a unique receipt number")


class OnboardingService:
    def __init__(self, db: Session):
        self.repo = OnboardingApplicationRepository(db)
        self.products = ProductRepository(db)
        self.customers = CustomerRepository(db)
        self.documents = OnboardingDocumentRepository(db)
        self.notifications = NotificationService(db)
        self.payments = PaymentService(db)
        self.policies = PolicyRepository(db)
        self.claims_service = ClaimService(db)
        self.branding = BrandingRepository(db)

    def _company_name(self) -> str:
        branding = self.branding.get()
        return branding.company_name if branding else "our team"

    def _policy_number(self, application: OnboardingApplication) -> str:
        policy = self.policies.get_by_id(application.policy_id) if application.policy_id else None
        return policy.policy_number if policy else ""

    def _notify(self, template_key: str, application: OnboardingApplication, extra: dict | None = None) -> None:
        context = {
            "firstName": application.applicant_first_name,
            "productName": application.product_name,
            "reference": application.reference,
            "companyName": self._company_name(),
            **(extra or {}),
        }
        self.notifications.send(
            template_key, application.applicant_email, context, "onboarding_application", application.id
        )

    def _to_dict(self, application: OnboardingApplication) -> dict:
        data = onboarding_application_to_dict(application)
        data["policyNumber"] = self._policy_number(application)
        data["documents"] = [
            onboarding_document_to_dict(d) for d in self.documents.get_by_application(application.id)
        ]
        data["notifications"] = self.notifications.list_for("onboarding_application", application.id)
        data["payments"] = self.payments.list_for("onboarding_application", application.id)
        data["claims"] = (
            [claim_to_dict(c) for c in self.claims_service.repo.get_by_policy(application.policy_id)]
            if application.policy_id
            else []
        )
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
            "policyNumber": self._policy_number(application),
            "documents": [
                onboarding_document_to_dict(d) for d in self.documents.get_by_application(application.id)
            ],
            "payments": self.payments.list_for("onboarding_application", application.id),
            "claims": (
                [self._public_claim_dict(c) for c in self.claims_service.repo.get_by_policy(application.policy_id)]
                if application.policy_id
                else []
            ),
        }

    def _public_claim_dict(self, claim: Claim) -> dict:
        return {
            "id": claim.id,
            "claimNumber": claim.claim_number,
            "status": claim.status,
            "incidentDate": claim.incident_date,
            "reportedDate": claim.reported_date,
            "claimAmount": claim.claim_amount,
            "approvedAmount": claim.approved_amount,
            "currency": claim.currency,
            "description": claim.description,
            "createdAt": to_iso(claim.created_at),
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
        saved = self.repo.add(entity)
        self._notify("application_submitted", saved)
        return self._to_dict(saved)

    def update_status(self, id: str, data: OnboardingApplicationStatusUpdate) -> dict:
        entity = self.repo.get_by_id(id)
        if not entity:
            raise HTTPException(status_code=404, detail="Application not found")
        payload = data.model_dump(exclude_unset=True)
        if "status" in payload and payload["status"] not in ONBOARDING_STATUSES:
            raise HTTPException(status_code=422, detail="Invalid status")
        previous_status = entity.status
        for field, value in payload.items():
            setattr(entity, field, value)
        if entity.status == "approved" and not entity.customer_id:
            entity.customer_id = self._convert_to_customer(entity).id
        saved = self.repo.save(entity)
        if saved.status == "approved" and not self.payments.list_for("onboarding_application", saved.id):
            self._create_invoice(saved)
        if saved.status != previous_status:
            template_key = STATUS_TEMPLATE.get(saved.status)
            if template_key:
                self._notify(template_key, saved)
        return self._to_dict(saved)

    def _create_invoice(self, application: OnboardingApplication) -> None:
        product = self.products.get_by_id(application.product_id)
        amount = product.minimum_premium if product else 0
        currency = product.currency if product else "NGN"
        self.payments.create_for(
            "onboarding_application",
            application.id,
            application.customer_id,
            amount,
            currency,
            f"Premium for {application.product_name} — {application.reference}",
        )

    def pay(self, application_id: str, payment_id: str, method: str) -> dict:
        """Public, simulated checkout — no live gateway is called."""
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        if application.status != "approved":
            raise HTTPException(
                status_code=409, detail="Payment is only available once the application has been approved."
            )
        payment = self.payments.get(payment_id)
        if payment.related_type != "onboarding_application" or payment.related_id != application_id:
            raise HTTPException(status_code=404, detail="Payment not found")
        result = self.payments.mark_paid(payment_id, method)
        self._handle_payment_success(application, result)
        return result

    def staff_update_payment(self, application_id: str, payment_id: str, status: str, method: str | None) -> dict:
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        payment = self.payments.get(payment_id)
        if payment.related_type != "onboarding_application" or payment.related_id != application_id:
            raise HTTPException(status_code=404, detail="Payment not found")
        if status == "paid":
            result = self.payments.mark_paid(payment_id, method or "bank_transfer")
            self._handle_payment_success(application, result)
            return result
        if status == "refunded":
            result = self.payments.refund(payment_id)
            self._notify("payment_refunded", application, {})
            return result
        raise HTTPException(status_code=422, detail="Invalid payment status")

    def _handle_payment_success(self, application: OnboardingApplication, result: dict) -> None:
        if not application.policy_id:
            self._issue_policy(application, result)
            self.repo.save(application)
        self._notify(
            "payment_received",
            application,
            {"amount": f"{result['currency']} {result['amount']:,.2f}", "receiptNumber": result["receiptNumber"]},
        )

    def _issue_policy(self, application: OnboardingApplication, payment: dict) -> None:
        product = self.products.get_by_id(application.product_id)
        today = datetime.now(timezone.utc).date()
        expiry = today.replace(year=today.year + 1)
        policy = Policy(
            id=self.policies.new_id(),
            policy_number=self._new_policy_number(),
            customer_id=application.customer_id,
            product_id=application.product_id,
            customer_name=f"{application.applicant_first_name} {application.applicant_last_name}",
            product_name=application.product_name,
            policy_type=product.category if product else "",
            effective_date=today.isoformat(),
            expiry_date=expiry.isoformat(),
            premium=payment["amount"],
            sum_insured=0,
            currency=payment["currency"],
            status="active",
        )
        saved = self.policies.add(policy)
        application.policy_id = saved.id

    def _new_policy_number(self) -> str:
        for _ in range(5):
            candidate = f"POL-{uuid4().hex[:8].upper()}"
            if not self.policies.get_by_number(candidate):
                return candidate
        raise HTTPException(status_code=500, detail="Could not generate a unique policy number")

    def submit_claim(self, application_id: str, incident_date: str, description: str, claim_amount: float) -> dict:
        """Public — files a claim against the policy issued for this application."""
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        if not application.policy_id:
            raise HTTPException(
                status_code=409,
                detail="A claim can only be filed once your policy has been issued (after payment).",
            )
        policy = self.policies.get_by_id(application.policy_id)
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        claim = self.claims_service.create(
            ClaimCreate(
                claim_number=self._new_claim_number(),
                policy_id=policy.id,
                policy_number=policy.policy_number,
                customer_id=application.customer_id or "",
                customer_name=f"{application.applicant_first_name} {application.applicant_last_name}",
                product_name=application.product_name,
                incident_date=incident_date,
                reported_date=datetime.now(timezone.utc).date().isoformat(),
                claim_amount=claim_amount,
                approved_amount=0,
                currency=policy.currency,
                description=description,
                status="open",
            )
        )
        self.notifications.send(
            "claim_submitted",
            application.applicant_email,
            {"firstName": application.applicant_first_name, "claimNumber": claim["claimNumber"]},
            "claim",
            claim["id"],
        )
        return claim

    def _new_claim_number(self) -> str:
        for _ in range(5):
            candidate = f"CLM-{uuid4().hex[:8].upper()}"
            if not self.claims_service.repo.get_by_number(candidate):
                return candidate
        raise HTTPException(status_code=500, detail="Could not generate a unique claim number")

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
        saved = self.documents.add(document)
        self._notify("document_received", application, {"filename": filename})
        return onboarding_document_to_dict(saved)

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
