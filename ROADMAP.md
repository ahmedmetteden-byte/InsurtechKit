# Roadmap

## Completed

- White-label branding + feature flags
- Admin modules: Products, Customers, Policies, Claims, Users, Reports, Integrations, Settings
- Public desktop site + mobile preview
- FastAPI + PostgreSQL + Alembic
- JWT authentication + RBAC
- Memory / API data provider switch
- Docker Compose full-stack packaging
- Commercial documentation suite (v1.0.0)

---

## Version 1 (current — 1.0.0)

Stabilize for customer demos and first commercial installs:

- Single-tenant deploy per customer
- Simulated integration health checks
- Seed/demo data for UAT
- Production config validation and health probes

---

## Version 2

- Multi-tenant data isolation (tenant_id or schema-per-tenant)
- Live email / SMS / payment adapters behind existing Integration model
- Password reset email flow (replace placeholders)
- Audit trail export
- Role UI editor (beyond seed roles)
- Automated backup job examples
- SSO / MFA options

---

## Future

- Policy document generation / e-sign
- Mobile apps beyond preview screens
- Real-time notifications
- Marketplace of certified connectors
- Managed MSP control plane (fleet of tenants)
- Advanced actuarial / rating engine hooks
