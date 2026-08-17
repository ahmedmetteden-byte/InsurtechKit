"""Application settings with production configuration validation."""
from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

INSECURE_SECRET_KEYS = {
    "change-me-jwt-ready",
    "change-me-in-production-jwt-ready",
    "changeme",
    "secret",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg://insurtech:insurtech@localhost:5432/insurtech"
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: str = "http://localhost:5173"
    SECRET_KEY: str = "change-me-jwt-ready"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENVIRONMENT: str = "development"
    SEED_ON_STARTUP: bool = True
    PROJECT_NAME: str = "InsurtechKit API"
    API_VERSION: str = "1.0.0"
    DEMO_USER_PASSWORD: str = "Password123!"
    ENABLE_DOCS: bool = True
    RUN_MIGRATIONS_ON_STARTUP: bool = False
    UPLOAD_DIR: str = "uploads"
    PAYSTACK_SECRET_KEY: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def paystack_configured(self) -> bool:
        return bool(self.PAYSTACK_SECRET_KEY.strip())

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.strip().lower() in {"production", "prod"}

    @model_validator(mode="after")
    def validate_production_safety(self) -> "Settings":
        if not self.is_production:
            return self
        errors: list[str] = []
        if self.SECRET_KEY.strip() in INSECURE_SECRET_KEYS or len(self.SECRET_KEY.strip()) < 32:
            errors.append(
                "SECRET_KEY must be a strong unique value (min 32 chars) when ENVIRONMENT=production"
            )
        if self.SEED_ON_STARTUP:
            errors.append("SEED_ON_STARTUP must be false when ENVIRONMENT=production")
        if self.DEMO_USER_PASSWORD == "Password123!":
            errors.append(
                "DEMO_USER_PASSWORD must be changed from the demo default when ENVIRONMENT=production"
            )
        if errors:
            raise ValueError("; ".join(errors))
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
