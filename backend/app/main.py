from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.router import router as api_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.db.seed import seed_if_empty
from app.db.session import SessionLocal
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
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.API_VERSION,
        description="InsurtechKit production API — mirrors frontend modules. Auth lands in Phase 6.",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    add_cors(app, settings.cors_origin_list)
    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.API_PREFIX)

    @app.get("/health", tags=["Health"])
    def health():
        return {"status": "ok", "environment": settings.ENVIRONMENT}

    return app


app = create_app()
