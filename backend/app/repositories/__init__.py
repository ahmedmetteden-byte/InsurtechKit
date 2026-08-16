from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import (
    Claim,
    CompanyBranding,
    Customer,
    FeatureFlags,
    Integration,
    OnboardingApplication,
    OnboardingDocument,
    Permission,
    Policy,
    Product,
    Role,
    User,
)
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    model = Product
    id_prefix = "prd"

    def get_by_code(self, code: str) -> Product | None:
        return self.db.scalars(select(Product).where(Product.code == code)).first()


class CustomerRepository(BaseRepository[Customer]):
    model = Customer
    id_prefix = "cus"

    def get_by_number(self, number: str) -> Customer | None:
        return self.db.scalars(select(Customer).where(Customer.customer_number == number)).first()


class PolicyRepository(BaseRepository[Policy]):
    model = Policy
    id_prefix = "pol"

    def get_by_number(self, number: str) -> Policy | None:
        return self.db.scalars(select(Policy).where(Policy.policy_number == number)).first()


class ClaimRepository(BaseRepository[Claim]):
    model = Claim
    id_prefix = "clm"

    def get_by_number(self, number: str) -> Claim | None:
        return self.db.scalars(select(Claim).where(Claim.claim_number == number)).first()


class OnboardingApplicationRepository(BaseRepository[OnboardingApplication]):
    model = OnboardingApplication
    id_prefix = "app"

    def get_by_reference(self, reference: str) -> OnboardingApplication | None:
        return self.db.scalars(
            select(OnboardingApplication).where(OnboardingApplication.reference == reference)
        ).first()


class OnboardingDocumentRepository(BaseRepository[OnboardingDocument]):
    model = OnboardingDocument
    id_prefix = "doc"

    def get_by_application(self, application_id: str) -> list[OnboardingDocument]:
        return list(
            self.db.scalars(
                select(OnboardingDocument).where(OnboardingDocument.application_id == application_id)
            ).all()
        )


class RoleRepository(BaseRepository[Role]):
    model = Role
    id_prefix = "role"


class PermissionRepository(BaseRepository[Permission]):
    model = Permission
    id_prefix = "perm"

    def get_by_code(self, code: str) -> Permission | None:
        return self.db.scalars(select(Permission).where(Permission.code == code)).first()


class UserRepository(BaseRepository[User]):
    model = User
    id_prefix = "usr"

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalars(select(User).where(User.email == email)).first()

    def get_by_employee_id(self, employee_id: str) -> User | None:
        return self.db.scalars(select(User).where(User.employee_id == employee_id)).first()


class IntegrationRepository(BaseRepository[Integration]):
    model = Integration
    id_prefix = "int"


class BrandingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self) -> CompanyBranding | None:
        return self.db.get(CompanyBranding, "default")

    def save(self, entity: CompanyBranding) -> CompanyBranding:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity


class FeatureFlagsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self) -> FeatureFlags | None:
        return self.db.get(FeatureFlags, "default")

    def save(self, entity: FeatureFlags) -> FeatureFlags:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity
