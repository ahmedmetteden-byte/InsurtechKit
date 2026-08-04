from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.router import router as api_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.db.seed import seed_if_empty
from app.db.session import SessionLocal, engine
from app.middleware.cors import add_cors


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    if settings.SEED_ON_STARTUP:
        db = SessionLocal()
        try:
            seed_if_empty(db)
        finally:
            db.close()
    try:
        yield
    finally:
        # Graceful shutdown — release connection pool
        engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    docs_url = "/docs" if settings.ENABLE_DOCS else None
    redoc_url = "/redoc" if settings.ENABLE_DOCS else None
    openapi_url = "/openapi.json" if settings.ENABLE_DOCS else None

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.API_VERSION,
        description="InsurtechKit production API — JWT auth, RBAC permissions, domain CRUD.",
        lifespan=lifespan,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )
    add_cors(app, settings.cors_origin_list)
    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.API_PREFIX)

    @app.get("/health", tags=["Health"])
    def health():
        """Liveness probe — process is up."""
        return {
            "status": "ok",
            "environment": settings.ENVIRONMENT,
            "version": settings.API_VERSION,
        }

    @app.get("/ready", tags=["Health"])
    def ready():
        """Readiness probe — database is reachable."""
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return {
                "status": "ready",
                "database": "ok",
                "environment": settings.ENVIRONMENT,
                "version": settings.API_VERSION,
            }
        except Exception as exc:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "not_ready",
                    "database": "error",
                    "detail": str(exc),
                    "environment": settings.ENVIRONMENT,
                    "version": settings.API_VERSION,
                },
            )

    return app


app = create_app()
