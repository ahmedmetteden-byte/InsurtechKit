# Branding Guide

InsurtechKit is built for white-label delivery. Branding and feature flags control tenant appearance and module visibility without code changes.

---

## Company branding

Edit in **Admin → Settings** (or `PUT /api/v1/branding`).

Fields include:

- Company / short / legal names, tagline
- Portal, kit, and admin labels
- Website, emails, phone, WhatsApp, address
- Logo light/dark, favicon (URL or data URI)
- Primary, secondary, accent colours
- Copyright and licence number

Frontend context: `src/config/BrandingContext.tsx` + `src/config/branding.ts`.

API mode persists branding in PostgreSQL (`company_branding`). Memory mode keeps changes in session state.

---

## Logos & colours

- Prefer SVG or transparent PNG for logos.
- Accent colour drives admin highlights (existing theme tokens).
- Do not introduce new global CSS themes — reuse the established parchment / navy / amber language.

---

## Feature flags

Toggle modules in Settings or `PUT /api/v1/feature-flags`.

Keys (see `src/config/features.ts`):

`dashboard`, `customers`, `products`, `policies`, `claims`, `users`, `reports`, `integrations`, `agents`, `brokers`, `analytics`, `settings`

Disabled flags hide nav items and routes; they do not delete data.

---

## Themes

There is no separate theme pack system in v1.0. Appearance is:

1. Fixed kit design language (do not redesign)
2. Branding colour overrides where wired
3. Feature flags for module presence

---

## Company settings

Settings screen combines branding + flags for tenant operators. Treat it as the single place for demo day configuration.

---

## Tenant configuration

v1.0 is **single-tenant per deployment**:

- One database, one branding row (`id=default`), one flag set
- Multi-tenant SaaS isolation is a roadmap item

For MSP delivery: deploy one Compose stack (or namespace) per customer, each with its own `.env`, branding, and secrets.
