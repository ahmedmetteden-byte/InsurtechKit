import type { Permission } from '../types/Permission'
import type { Role } from '../types/User'

const ALL: Permission[] = [
  'dashboard.view',
  'products.view', 'products.create', 'products.edit', 'products.delete',
  'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
  'policies.view', 'policies.create', 'policies.edit', 'policies.delete',
  'claims.view', 'claims.create', 'claims.edit', 'claims.approve',
  'reports.view', 'settings.manage', 'users.manage',
]

const VIEW_CATALOGUE: Permission[] = [
  'dashboard.view',
  'products.view',
  'customers.view',
  'policies.view',
  'claims.view',
  'reports.view',
]

/**
 * Seed roles for the Users module (in-memory only).
 */
export const defaultRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full platform access including settings and user management.',
    permissions: [...ALL],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-ops',
    name: 'Operations Manager',
    description: 'Oversee products, customers, policies, and claims operations.',
    permissions: [
      'dashboard.view',
      'products.view', 'products.create', 'products.edit',
      'customers.view', 'customers.create', 'customers.edit',
      'policies.view', 'policies.create', 'policies.edit',
      'claims.view', 'claims.create', 'claims.edit',
      'reports.view',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-underwriter',
    name: 'Underwriter',
    description: 'Create and maintain products and policies; view customers.',
    permissions: [
      'dashboard.view',
      'products.view', 'products.create', 'products.edit',
      'customers.view',
      'policies.view', 'policies.create', 'policies.edit',
      'reports.view',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-claims',
    name: 'Claims Officer',
    description: 'Manage the claims register including approvals.',
    permissions: [
      'dashboard.view',
      'customers.view',
      'policies.view',
      'claims.view', 'claims.create', 'claims.edit', 'claims.approve',
      'reports.view',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-cs',
    name: 'Customer Service',
    description: 'Serve policyholders — view and create customers and policies.',
    permissions: [
      'dashboard.view',
      'products.view',
      'customers.view', 'customers.create', 'customers.edit',
      'policies.view', 'policies.create',
      'claims.view', 'claims.create',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-finance',
    name: 'Finance Officer',
    description: 'View premiums, policies, claims amounts, and reports.',
    permissions: [
      'dashboard.view',
      'customers.view',
      'policies.view',
      'claims.view',
      'reports.view',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-branch',
    name: 'Branch Manager',
    description: 'Manage branch-level customers, policies, and claims.',
    permissions: [
      'dashboard.view',
      'products.view',
      'customers.view', 'customers.create', 'customers.edit',
      'policies.view', 'policies.create', 'policies.edit',
      'claims.view', 'claims.create', 'claims.edit',
      'reports.view',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-broker',
    name: 'Broker',
    description: 'Place business — view catalogue and create customers/policies.',
    permissions: [
      'dashboard.view',
      'products.view',
      'customers.view', 'customers.create',
      'policies.view', 'policies.create',
      'claims.view',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-agent',
    name: 'Agent',
    description: 'Field sales — view products and create customer leads.',
    permissions: [
      'dashboard.view',
      'products.view',
      'customers.view', 'customers.create',
      'policies.view',
    ],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access across operational modules.',
    permissions: [...VIEW_CATALOGUE],
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
]

export function getRoleById(id: string): Role | undefined {
  const found = defaultRoles.find(r => r.id === id)
  return found ? { ...found, permissions: [...found.permissions] } : undefined
}
