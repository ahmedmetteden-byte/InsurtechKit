"""JWT-ready security helpers (auth enforcement lands in Phase 6)."""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt

from app.core.config import get_settings

ALGORITHM = "HS256"


def create_access_token(subject: str, claims: dict[str, Any] | None = None) -> str:
    """Create a JWT access token — not enforced by routes yet."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if claims:
        payload.update(claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
