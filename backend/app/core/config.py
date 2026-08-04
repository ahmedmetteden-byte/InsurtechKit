"""Application settings — JWT fields are ready for Phase 6 auth."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg://insurtech:insurtech@localhost:5432/insurtech"
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: str = "http://localhost:5173"
    SECRET_KEY: str = "change-me-jwt-ready"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"
    SEED_ON_STARTUP: bool = True
    PROJECT_NAME: str = "InsurtechKit API"
    API_VERSION: str = "0.1.0"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
