"""Create schema via SQLAlchemy metadata (fallback / bootstrap helper)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import create_engine, text

from app.core.config import get_settings
from app.db.base import Base
from app.db.seed import seed_if_empty
from app.db.session import SessionLocal
from app.models import entities  # noqa: F401

settings = get_settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 10})

print("connecting…", settings.DATABASE_URL)
with engine.connect() as conn:
    print("connected", conn.execute(text("select 1")).scalar())

print("creating tables…")
Base.metadata.create_all(bind=engine)
print("tables ready")

db = SessionLocal()
try:
    seed_if_empty(db)
    print("seed complete")
finally:
    db.close()
