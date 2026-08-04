# Admin Guide

Admin Console entry: website navbar → Admin (API mode requires login).

Design and layouts are fixed; this guide describes existing modules only.

---

## Overview (Dashboard)

Live metrics from in-memory or API module services: premiums, claims, customers, policies, activity. Navigate via sidebar cards and recent activity.

Requires feature flags: `dashboard` and/or `analytics`.

---

## Products

Manage insurance product catalogue (code, category, premium floor, inspection flag, status).

Typical flow: create draft → activate → reference from policies.

Permission (API): `products.view|create|edit|delete`

---

## Customers (Policyholders)

Individual and corporate customers: identity, contact, KYC fields, status.

Create customers before binding policies.

Permission: `customers.*`

---

## Policies (Premiums nav)

Policy register: product, customer, dates, premium, status.

Create after customer + product exist.

Permission: `policies.*`

---

## Claims

Claims register: link policy, amounts, status workflow.

Approving / settling (status) requires `claims.approve` in API mode.

Permission: `claims.view|create|edit|approve`

---

## Users

Staff directory: employee ID, role, branch, status. Roles carry permission sets (Administrator, Claims Officer, Viewer, etc.).

Permission: `users.manage`

---

## Reports

Analytics charts and tables derived from live module data (not a separate warehouse).

Permission probe: `reports.view`

---

## Integrations

Configure partner connectors (type, provider, credentials, timeout). **Test connection** simulates health — no live third-party calls in this kit version.

Types: insurance partners, payments, email, SMS, identity, regulatory.

Permission: `settings.manage`

---

## Settings

Company branding (name, colours, logos, contacts) and feature flags (toggle modules on/off for the tenant UI).

Permission: `settings.manage` for API mutations. Branding/flags GET may be public for the marketing site.

---

## Session (API mode)

Header shows **current user**, **role**, and **Logout**.

Exit to Website returns to the public portal without forcing logout; use Logout to revoke the refresh token.
