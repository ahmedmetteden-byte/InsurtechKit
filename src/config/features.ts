/**
 * Platform feature flags — enable/disable modules for white-label tenants.
 * Defaults are all enabled. Runtime state lives in FeatureContext (in-memory).
 */

export const FEATURE_KEYS = [
  'dashboard',
  'customers',
  'products',
  'policies',
  'claims',
  'users',
  'reports',
  'agents',
  'brokers',
  'analytics',
  'settings',
] as const

export type FeatureKey = (typeof FEATURE_KEYS)[number]

export type FeaturesConfig = Record<FeatureKey, boolean>

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  products: 'Products',
  policies: 'Policies',
  claims: 'Claims',
  users: 'Users',
  reports: 'Reports',
  agents: 'Agents',
  brokers: 'Brokers',
  analytics: 'Analytics',
  settings: 'Settings',
}

export const defaultFeatures: FeaturesConfig = {
  dashboard: true,
  customers: true,
  products: true,
  policies: true,
  claims: true,
  users: true,
  reports: true,
  agents: true,
  brokers: true,
  analytics: true,
  settings: true,
}
