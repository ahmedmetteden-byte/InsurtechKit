# API Guide

Base URL: `{host}/api/v1`  
Auth: `Authorization: Bearer <accessToken>`  
JSON uses **camelCase** field names.

Interactive docs: `{host}/docs` (disable in production via `ENABLE_DOCS=false`).

Error shape:

```json
{
  "error": {
    "status": 401,
    "code": "unauthorized",
    "message": "Not authenticated"
  }
}
```

---

## Health

### `GET /health`

```json
{ "status": "ok", "environment": "development", "version": "1.0.0" }
```

### `GET /ready`

```json
{ "status": "ready", "database": "ok", "environment": "development", "version": "1.0.0" }
```

`503` when the database is unreachable.

---

## Auth

### `POST /auth/login`

```json
{ "email": "ada.okafor@insureng.com.ng", "password": "Password123!" }
```

Response:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "tokenType": "bearer",
  "expiresIn": 3600,
  "user": { "id": "usr-010", "email": "ada.okafor@insureng.com.ng", "roleName": "Administrator" },
  "permissions": ["products.view", "users.manage"]
}
```

### `POST /auth/refresh`

```json
{ "refreshToken": "<jwt>" }
```

### `POST /auth/logout`

```json
{ "refreshToken": "<jwt>" }
```

### `GET /auth/me`

Returns `{ user, permissions, roleId, roleName }`.

### `POST /auth/change-password`

```json
{ "currentPassword": "…", "newPassword": "…" }
```

### `POST /auth/forgot-password` (placeholder)

```json
{ "email": "user@example.com" }
```

### `POST /auth/reset-password` (placeholder → 501)

```json
{ "token": "…", "newPassword": "…" }
```

---

## Products

| Method | Path | Permission |
|--------|------|------------|
| GET | `/products` | `products.view` |
| GET | `/products/{id}` | `products.view` |
| POST | `/products` | `products.create` |
| PUT | `/products/{id}` | `products.edit` |
| DELETE | `/products/{id}` | `products.delete` |

Create example:

```json
{
  "name": "Motor Comprehensive",
  "code": "MOT-COMP",
  "description": "Full motor cover",
  "category": "motor",
  "status": "active",
  "minimumPremium": 42000,
  "currency": "NGN",
  "requiresInspection": false,
  "active": true
}
```

---

## Customers

| Method | Path | Permission |
|--------|------|------------|
| GET/POST/PUT/DELETE | `/customers`, `/customers/{id}` | `customers.view|create|edit|delete` |

---

## Policies

| Method | Path | Permission |
|--------|------|------------|
| GET/POST/PUT/DELETE | `/policies`, `/policies/{id}` | `policies.view|create|edit|delete` |

---

## Claims

| Method | Path | Permission |
|--------|------|------------|
| GET | `/claims`, `/claims/{id}` | `claims.view` |
| POST | `/claims` | `claims.create` |
| PUT | `/claims/{id}` | `claims.edit` (or `claims.approve` for approve/settle statuses) |
| DELETE | `/claims/{id}` | `claims.edit` |

---

## Users / Roles / Permissions

| Method | Path | Permission |
|--------|------|------------|
| CRUD | `/users` | `users.manage` |
| GET | `/roles`, `/roles/{id}` | `users.manage` or `dashboard.view` |
| GET | `/permissions` | `users.manage` |

User create may include optional `password` (defaults to `DEMO_USER_PASSWORD` when seeding/creating without one).

---

## Integrations

| Method | Path | Permission |
|--------|------|------------|
| CRUD | `/integrations` | `settings.manage` |
| POST | `/integrations/{id}/test-connection` | `settings.manage` |

Test response example:

```json
{ "success": true, "message": "Connection simulated OK", "latencyMs": 42 }
```

---

## Branding & feature flags

| Method | Path | Auth |
|--------|------|------|
| GET | `/branding` | Public |
| PUT | `/branding` | `settings.manage` |
| GET | `/feature-flags` | Public |
| PUT | `/feature-flags` | `settings.manage` |

---

## Reports

### `GET /reports/access`

Permission: `reports.view` — confirms access; report payloads are assembled client-side.

---

## OpenAPI

Machine-readable contract: `GET /openapi.json` when docs are enabled.
