# Security

## Authentication

- Access JWT (short-lived) + refresh JWT (rotating, persisted `jti`, revocable on logout)
- Passwords hashed with bcrypt
- Bearer tokens required on protected routes

## Authorization

Role → permission codes (e.g. `products.view`, `claims.approve`, `settings.manage`).  
Enforced via FastAPI dependencies.

## Production hard requirements

When `ENVIRONMENT=production` the API **refuses to start** if:

- `SECRET_KEY` is a known demo default or shorter than 32 characters
- `SEED_ON_STARTUP` is true
- `DEMO_USER_PASSWORD` remains `Password123!`

Recommended: `ENABLE_DOCS=false`, HTTPS only, locked `CORS_ORIGINS`.

## Transport

Terminate TLS at Nginx/edge. Do not expose Postgres publicly.

## Secrets

- Never commit `.env`
- Rotate demo user passwords before customer UAT
- Treat integration API keys as secrets

## Session UX

Frontend clears tokens on 401 and schedules refresh before access expiry.

## Known limitations (v1.0)

- Forgot/reset password are placeholders
- No MFA / SSO
- No audit log export
- Integration tests are simulated
- Single-tenant per deployment

See [ROADMAP.md](ROADMAP.md) for planned controls.
