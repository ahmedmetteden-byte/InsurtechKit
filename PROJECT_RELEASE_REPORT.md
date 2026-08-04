# Project Release Report — InsurtechKit 1.0.0

**Date:** 2026-08-04  
**Scope:** Final production-readiness phase (no new business features)

---

## Architecture summary

InsurtechKit is a white-label insurtech kit with:

1. **Vite/React SPA** — marketing site, mobile preview, admin console; `VITE_DATA_PROVIDER=memory|api`
2. **FastAPI API** — `/api/v1` JWT auth, RBAC, domain CRUD, branding & flags
3. **PostgreSQL** — durable state via SQLAlchemy + Alembic
4. **Compose packaging** — `db` + `api` + `web` (Nginx SPA with API proxy)

Auth uses access/refresh JWTs; permissions mirror the Role model (`products.view`, `claims.approve`, etc.).

---

## Completed modules

| Module | Status |
|--------|--------|
| Products | Complete (memory + API) |
| Customers | Complete |
| Policies | Complete |
| Claims | Complete |
| Users & roles | Complete |
| Reports | Complete (client-side analytics) |
| Integrations | Complete (config + simulated test) |
| Branding / feature flags | Complete |
| Dashboard | Complete |
| JWT auth + login UX | Complete |
| Deploy packaging + docs | Complete (this phase) |

---

## Deployment readiness

| Item | Status |
|------|--------|
| Dockerfile (API) | Ready |
| Dockerfile (Web) | Ready |
| docker-compose.yml | Ready |
| docker-compose.prod.yml | Ready |
| Alembic migrations on start | Ready |
| `/health` + `/ready` | Ready |
| Graceful engine dispose | Ready |
| Env templates | Ready |
| Nginx SPA + API proxy | Ready |
| Production secret validation | Ready |

---

## Remaining known limitations

- Forgot/reset password are placeholders (reset returns 501)
- Integrations do not call live third parties
- Single-tenant per deployment (MSP = one stack per customer)
- No MFA/SSO
- No automated off-site backup scheduler (documented manual `pg_dump`)
- Screenshot assets are placeholders
- OpenAPI docs should be disabled in public production

---

## Recommended production checklist

1. Generate a unique `SECRET_KEY` (≥32 chars)
2. Set `ENVIRONMENT=production`, `SEED_ON_STARTUP=false`, `ENABLE_DOCS=false`
3. Change all demo user passwords (or delete seed users)
4. Lock `CORS_ORIGINS` to the real HTTPS origin
5. Enable TLS at the edge (`deploy/nginx/edge.conf`)
6. Keep Postgres on the private Compose network
7. Schedule and test `pg_dump` restores
8. Monitor `/ready` from your uptime tool
9. Replace InsureNG demo branding with customer brand
10. Confirm feature flags match contracted modules

---

## Commercial readiness assessment

**Ready for:** customer demos, UAT, first single-tenant commercial installs, MSP-style per-customer deployments.

**Not ready for (without Version 2 work):** multi-tenant SaaS on one database, live payment/SMS production traffic, regulated audit-export mandates.

Overall: **commercially deliverable as a white-label kit** when the production checklist is followed.

---

## Version recommendation

**Ship as `1.0.0`.**

Rationale: end-to-end product surface (UI + API + auth + deploy + docs) is complete for the stated kit scope. Remaining items are enhancements, not blockers for first customer delivery.

---

## MSP readiness assessment

| Capability | Assessment |
|------------|------------|
| Per-customer branding | Strong (settings + API) |
| Per-customer feature packaging | Strong (flags) |
| Isolated deploys | Strong (Compose per tenant) |
| Shared multi-tenant control plane | Not in v1.0 |
| Connector certification | Simulated only |
| Runbooks | Documented (INSTALL/DEPLOY/SECURITY) |

**Verdict:** Suitable for MSP delivery using **one environment per insurer**. A shared multi-tenant control plane should wait for Version 2.
