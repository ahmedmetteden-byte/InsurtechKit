"""Authentication routes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.entities import User
from app.schemas.auth import (
    ChangePasswordRequest,
    CurrentUserResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    RefreshRequest,
    ResetPasswordRequest,
    TokenPair,
)
from app.schemas.entities import MessageResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, service: AuthService = Depends(get_auth_service)):
    return service.login(body.email, body.password)


@router.post("/logout", response_model=MessageResponse)
def logout(body: LogoutRequest, service: AuthService = Depends(get_auth_service)):
    return service.logout(body.refresh_token or None)


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshRequest, service: AuthService = Depends(get_auth_service)):
    result = service.refresh(body.refresh_token)
    return {
        "accessToken": result["accessToken"],
        "refreshToken": result["refreshToken"],
        "tokenType": result["tokenType"],
        "expiresIn": result["expiresIn"],
    }


@router.get("/me", response_model=CurrentUserResponse)
def me(
    user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.me(user)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest, service: AuthService = Depends(get_auth_service)):
    return service.forgot_password(body.email)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, service: AuthService = Depends(get_auth_service)):
    return service.reset_password(body.token, body.new_password)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    body: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.change_password(user, body.current_password, body.new_password)


@router.get("/config", response_model=dict, include_in_schema=False)
def auth_config():
    settings = get_settings()
    return {
        "accessTokenExpireMinutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "refreshTokenExpireDays": settings.REFRESH_TOKEN_EXPIRE_DAYS,
    }
