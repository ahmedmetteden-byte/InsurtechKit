"""Auth dependencies — current user + permission checks."""
from collections.abc import Callable

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.entities import Role, User
from app.repositories import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


def get_user_permissions(db: Session, user: User) -> list[str]:
    role = db.get(Role, user.role_id)
    if not role:
        return []
    return list(role.permissions or [])


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    if payload.get("type") not in (None, "access"):
        raise HTTPException(status_code=401, detail="Invalid access token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid access token")
    user = UserRepository(db).get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.status != "active":
        raise HTTPException(status_code=403, detail="Account is not active")
    return user


def require_permission(*permission_codes: str) -> Callable:
    """FastAPI dependency factory — user must hold at least one listed permission."""

    def dependency(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if not permission_codes:
            return user
        held = set(get_user_permissions(db, user))
        if not held.intersection(permission_codes):
            needed = ", ".join(permission_codes)
            raise HTTPException(
                status_code=403,
                detail=f"Missing required permission: {needed}",
            )
        return user

    return dependency


def require_all_permissions(*permission_codes: str) -> Callable:
    def dependency(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        held = set(get_user_permissions(db, user))
        missing = [c for c in permission_codes if c not in held]
        if missing:
            raise HTTPException(
                status_code=403,
                detail=f"Missing required permissions: {', '.join(missing)}",
            )
        return user

    return dependency
