/**
 * InsureNG White-Label Branding — single source of truth (defaults).
 *
 * Runtime values live in BrandingContext so Company Settings can update
 * branding in memory. A page refresh resets to these defaults.
 */
export type BrandingConfig = {
  companyName: string
  shortName: string
  legalName: string
  tagline: string
  portalLabel: string
  kitLabel: string
  adminLabel: string
  website: string
  emailDomain: string
  supportEmail: string
  claimsEmail: string
  supportPhone: string
  whatsapp: string
  address: string
  logoLight: string
  logoDark: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  copyright: string
  licenceNo: string
}

export const defaultBranding: BrandingConfig = {
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
  logoLight: '',
  logoDark: '',
  favicon: '',
  primaryColor: '#1D4ED8',
  secondaryColor: '#16A34A',
  accentColor: '#F59E0B',
  copyright:
    '© 2025 InsureNG Ltd. RC 1234567. NAICOM Licence No. IA-2024-0089. All rights reserved.',
  licenceNo: 'IA-2024-0089',
}

/** @deprecated Prefer useBranding() — kept as the static default snapshot. */
export const branding = defaultBranding
