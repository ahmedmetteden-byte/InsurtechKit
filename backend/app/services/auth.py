"""Authentication service — login, refresh, logout, password flows."""
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.entities import RefreshToken, Role, User
from app.repositories import UserRepository
from app.utils.mappers import user_to_dict


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def _permissions_for(self, user: User) -> list[str]:
        role = self.db.get(Role, user.role_id)
        if not role:
            return []
        return list(role.permissions or [])

    def _issue_tokens(self, user: User) -> dict:
        settings = get_settings()
        permissions = self._permissions_for(user)
        access = create_access_token(
            user.id,
            role_id=user.role_id,
            role_name=user.role_name,
            permissions=permissions,
            extra={"email": user.email},
        )
        refresh, jti, expires_at = create_refresh_token(user.id)
        self.db.add(
            RefreshToken(
                id=f"rt-{jti[:12]}",
                user_id=user.id,
                jti=jti,
                expires_at=expires_at,
                revoked=False,
            )
        )
        self.db.commit()
        return {
            "accessToken": access,
            "refreshToken": refresh,
            "tokenType": "bearer",
            "expiresIn": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user_to_dict(user),
            "permissions": permissions,
        }

    def login(self, email: str, password: str) -> dict:
        user = self.users.get_by_email(email.strip().lower())
        if not user:
            # Case-insensitive fallback
            user = self.db.scalars(
                select(User).where(User.email.ilike(email.strip()))
            ).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if user.status != "active":
            raise HTTPException(status_code=403, detail="Account is not active")

        user.last_login = datetime.now(timezone.utc).isoformat()
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return self._issue_tokens(user)

    def refresh(self, refresh_token: str) -> dict:
        try:
            payload = decode_token(refresh_token)
        except ValueError as exc:
            raise HTTPException(status_code=401, detail=str(exc)) from exc
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        jti = payload.get("jti")
        user_id = payload.get("sub")
        if not jti or not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        stored = self.db.scalars(
            select(RefreshToken).where(RefreshToken.jti == jti)
        ).first()
        if not stored or stored.revoked:
            raise HTTPException(status_code=401, detail="Refresh token revoked")
        expires = stored.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Refresh token expired")

        user = self.users.get_by_id(user_id)
        if not user or user.status != "active":
            raise HTTPException(status_code=401, detail="User not found or inactive")

        stored.revoked = True
        self.db.add(stored)
        self.db.commit()
        return self._issue_tokens(user)

    def logout(self, refresh_token: str | None) -> dict:
        if refresh_token:
            try:
                payload = decode_token(refresh_token)
                jti = payload.get("jti")
                if jti:
                    stored = self.db.scalars(
                        select(RefreshToken).where(RefreshToken.jti == jti)
                    ).first()
                    if stored and not stored.revoked:
                        stored.revoked = True
                        self.db.add(stored)
                        self.db.commit()
            except ValueError:
                pass
        return {"message": "Logged out"}

    def me(self, user: User) -> dict:
        permissions = self._permissions_for(user)
        return {
            "user": user_to_dict(user),
            "permissions": permissions,
            "roleId": user.role_id,
            "roleName": user.role_name,
        }

    def change_password(self, user: User, current_password: str, new_password: str) -> dict:
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
        user.password_hash = hash_password(new_password)
        self.db.add(user)
        self.db.commit()
        return {"message": "Password updated"}

    def forgot_password(self, email: str) -> dict:
        # Placeholder — do not reveal whether the email exists
        _ = email
        return {
            "message": "If an account exists for that email, password reset instructions will be sent.",
        }

    def reset_password(self, token: str, new_password: str) -> dict:
        _ = token, new_password
        raise HTTPException(
            status_code=501,
            detail="Password reset via email token is not enabled yet. Use change-password while authenticated.",
        )
