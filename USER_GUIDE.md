# User Guide

For staff operating the Admin Console day to day.

---

## Login

1. Open the website and choose **Admin**.
2. **Memory mode** (`VITE_DATA_PROVIDER=memory`): console opens immediately with a demo identity.
3. **API mode**: sign in with email + password.

Demo (non-production):

- Email: `ada.okafor@insureng.com.ng`
- Password: `Password123!`

Sessions use JWT access + refresh tokens. Expired access tokens refresh automatically; failure logs you out.

---

## Dashboard

Sidebar → Overview. Review KPIs, trends, and recent activity. Use cards to jump into modules.

---

## Creating customers

1. Open **Policyholders**.
2. Add customer (individual or corporate).
3. Save and note the customer number for policy binding.

---

## Creating policies

1. Ensure product and customer exist.
2. Open **Premiums / Policies**.
3. Create policy with product, customer, term, and premium.
4. Set status per underwriting workflow.

---

## Managing claims

1. Open **Claims**.
2. Create a claim against a policy.
3. Update status through investigation → approval / settlement.
4. Approvers need the Claims Officer (or Admin) role for approval statuses in API mode.

---

## Running reports

1. Open **Reports**.
2. Review charts and tables populated from current module data.
3. No separate export engine ships in v1.0 — use browser print or future roadmap items.

---

## Tips

- Feature flags in Settings can hide modules you do not need for a demo.
- Branding in Settings updates company name and colours across the kit.
- If API calls fail, confirm the FastAPI server is up (`/health`) and you are logged in.
