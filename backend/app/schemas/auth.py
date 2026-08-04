"""Auth request/response schemas (camelCase aliases via APIModel)."""
from pydantic import Field

from app.schemas.entities import APIModel, UserRead


class LoginRequest(APIModel):
    email: str
    password: str


class TokenPair(APIModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token lifetime in seconds")


class LoginResponse(APIModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
    permissions: list[str] = Field(default_factory=list)


class RefreshRequest(APIModel):
    refresh_token: str


class LogoutRequest(APIModel):
    refresh_token: str = ""


class ChangePasswordRequest(APIModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(APIModel):
    email: str


class ResetPasswordRequest(APIModel):
    token: str
    new_password: str


class CurrentUserResponse(APIModel):
    user: UserRead
    permissions: list[str] = Field(default_factory=list)
    role_id: str = ""
    role_name: str = ""
