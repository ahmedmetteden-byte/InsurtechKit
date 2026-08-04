# Integration Guide

Integrations are managed in **Admin → Integrations**. The framework stores configuration and supports a **simulated** connection test. Live provider calls are intentionally out of scope for v1.0 polish.

---

## Categories

| Type | Examples |
|------|----------|
| Insurance partners | Co-insurers, reinsurers, binder feeds |
| Payment providers | Card, transfer, wallet gateways |
| Email | Transactional mail (claims, policies) |
| SMS | OTP / notification gateways |
| Identity | KYC / BVN / NIN providers |
| Regulatory APIs | NAICOM or market reporting endpoints |

---

## Configuration fields

Name, type, provider, status, base URL, API key/secret, username/password, webhook URL, timeout, enabled flag, notes, last health check.

Credentials are stored in the database — protect Postgres and prefer secrets managers before production hardening.

---

## Test connection

`POST /api/v1/integrations/{id}/test-connection` runs a simulated latency check and updates status messaging. It does **not** call external networks.

Use it in demos to show operational readiness UX.

---

## How to add a new integration (configuration)

1. Open Integrations → create
2. Choose type + provider labels matching the customer’s vendor
3. Paste sandbox credentials
4. Run Test Connection
5. Enable when the customer is ready

---

## How to add a new integration (engineering)

No new business modules in this phase. Future live connectors should:

1. Keep the existing Integration entity/UI
2. Add a provider adapter behind the service layer
3. Gate real HTTP with feature flags / environment
4. Never log secrets
5. Extend `test_connection` to optionally perform a real ping when `ENVIRONMENT` allows

---

## MSP note

Per-tenant Compose stacks keep integration credentials isolated. Do not share a single database across unrelated insurers in v1.0.
