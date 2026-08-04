/**
 * Strongly typed platform permissions for role-based access (in-memory identity model).
 * Enforcement ships later with FastAPI auth; UI uses these for display and future gating.
 */

export const PERMISSIONS = [
  'dashboard.view',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'customers.view',
  'customers.create',
  'customers.edit',
  'customers.delete',
  'policies.view',
  'policies.create',
  'policies.edit',
  'policies.delete',
  'claims.view',
  'claims.create',
  'claims.edit',
  'claims.approve',
  'reports.view',
  'settings.manage',
  'users.manage',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value)
}
