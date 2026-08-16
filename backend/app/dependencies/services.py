from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
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


def get_product_service(db: Session = Depends(get_db)) -> Generator[ProductService, None, None]:
    yield ProductService(db)


def get_customer_service(db: Session = Depends(get_db)) -> Generator[CustomerService, None, None]:
    yield CustomerService(db)


def get_policy_service(db: Session = Depends(get_db)) -> Generator[PolicyService, None, None]:
    yield PolicyService(db)


def get_claim_service(db: Session = Depends(get_db)) -> Generator[ClaimService, None, None]:
    yield ClaimService(db)


def get_user_service(db: Session = Depends(get_db)) -> Generator[UserService, None, None]:
    yield UserService(db)


def get_integration_service(db: Session = Depends(get_db)) -> Generator[IntegrationService, None, None]:
    yield IntegrationService(db)


def get_branding_service(db: Session = Depends(get_db)) -> Generator[BrandingService, None, None]:
    yield BrandingService(db)


def get_feature_flags_service(db: Session = Depends(get_db)) -> Generator[FeatureFlagsService, None, None]:
    yield FeatureFlagsService(db)


def get_onboarding_service(db: Session = Depends(get_db)) -> Generator[OnboardingService, None, None]:
    yield OnboardingService(db)
