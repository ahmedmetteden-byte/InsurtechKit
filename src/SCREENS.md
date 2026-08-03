# Screen Inventory

Current screens and shared UI in this project after Figma migration.

## Desktop

| File | Component | Access |
|------|-----------|--------|
| `src/desktop/00-Cover.tsx` | Cover | Shown first on launch (“Open Kit”) |
| `src/desktop/01-Homepage.tsx` | HomePage | Nav → Home |
| `src/desktop/02-Product-Details.tsx` | ProductPage | Nav → Coverage |
| `src/desktop/03-Claims-Process.tsx` | ClaimsPage | Nav → Claims |
| `src/desktop/04-Contact-Agent-Finder.tsx` | ContactPage | Nav → Contact |

## Mobile

| File | Component | Access |
|------|-----------|--------|
| `src/mobile/01-Onboarding.tsx` | MobileOnboarding | Nav → Mobile ↗ → 01 Onboarding |
| `src/mobile/02-Dashboard.tsx` | MobileDashboard | Nav → Mobile ↗ → 02 Dashboard |
| `src/mobile/03-Get-Quote.tsx` | MobileGetQuote | Nav → Mobile ↗ → 03 Get Quote |
| `src/mobile/04-Policy-Details.tsx` | MobilePolicyDetails | Nav → Mobile ↗ → 04 Policy |
| `src/mobile/05-Claims-Submit.tsx` | MobileClaimsSubmit | Nav → Mobile ↗ → 05 Claims |

## Admin

| File | Component | Access |
|------|-----------|--------|
| `src/admin/AdminDashboard.tsx` | AdminDashboard | Nav → Admin ↗ |
| `src/admin/01-Analytics.tsx` | Re-exports AdminDashboard | Intentional alias → Overview view |
| `src/admin/02-Claims-Queue.tsx` | Re-exports AdminDashboard | Intentional alias → Claims view |

## Shared Components

| File | Notes |
|------|-------|
| `src/components/NavBar.tsx` | Site navigation |
| `src/components/Footer.tsx` | Site footer |
| `src/components/ui/Badge.tsx` | UI library |
| `src/components/ui/Button.tsx` | UI library |
| `src/components/ui/Card.tsx` | UI library |
| `src/components/ui/Eyebrow.tsx` | UI library |
| `src/components/ui/Stack.tsx` | UI library (`Stack`, `Row`) |
| `src/components/ui/index.ts` | Barrel exports |
| `src/icons.tsx` | Shared icon map |
| `src/App.tsx` | App shell / screen switching |
| `src/main.tsx` | Vite entry |
| `src/index.css` | Global styles + token import |
| `src/styles/tokens.css` | Design tokens |
| `src/styles/presets/theme-dark.css` | Optional theme preset |
| `src/styles/presets/theme-green.css` | Optional theme preset |
| `src/styles/presets/theme-purple.css` | Optional theme preset |
