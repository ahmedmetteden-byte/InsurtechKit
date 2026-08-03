/**
 * InsureNG White-Label Branding — single source of truth.
 *
 * Phase 1: identity strings and brand colors only.
 * Values match the current UI exactly so the product stays pixel-identical.
 * Change these fields to rebrand; do not hardcode company identity in screens.
 */
export const branding = {
  companyName: 'InsureNG',
  shortName: 'InsureNG',
  legalName: 'InsureNG Ltd.',
  tagline: "Nigeria's leading white-label insurance portal. NAICOM licensed and regulated.",
  portalLabel: 'White-Label Portal',
  kitLabel: 'White-Label Platform Kit',
  adminLabel: 'Admin Console',
  website: 'https://www.insureng.com.ng',
  emailDomain: 'insureng.com.ng',
  supportEmail: 'hello@insureng.com.ng',
  claimsEmail: 'claims@insureng.com.ng',
  supportPhone: '0800-INSURE-NG',
  whatsapp: '+234 901 000 0000',
  address: 'Plot 14, Broad Street, Lagos Island',

  /** Reserved for asset paths. Screens currently render the shared shield mark. */
  logoLight: '',
  logoDark: '',
  favicon: '',

  primaryColor: '#1D4ED8',
  secondaryColor: '#16A34A',
  accentColor: '#F59E0B',

  copyright:
    '© 2025 InsureNG Ltd. RC 1234567. NAICOM Licence No. IA-2024-0089. All rights reserved.',
  licenceNo: 'IA-2024-0089',
} as const

export type Branding = typeof branding
