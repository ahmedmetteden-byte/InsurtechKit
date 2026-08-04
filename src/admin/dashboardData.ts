/**
 * Live dashboard aggregations from Product / Customer / Policy / Claim / User services.
 * No duplicated stores — always reads current in-memory service state.
 */
import { ClaimService } from '../modules/claims/services/ClaimService'
import { CustomerService } from '../modules/customers/services/CustomerService'
import { customerDisplayName } from '../modules/customers/types/Customer'
import { PolicyService } from '../modules/policies/services/PolicyService'
import { ProductService } from '../modules/products/services/ProductService'
import { UserService } from '../modules/users/services/UserService'
import { userDisplayName } from '../modules/users/types/User'
import { IntegrationService } from '../modules/integrations/services/IntegrationService'

export type NamedCount = { name: string; count: number }

export type DashboardMetrics = {
  products: {
    total: number
    active: number
    inactive: number
  }
  customers: {
    total: number
    individuals: number
    corporate: number
    active: number
  }
  policies: {
    total: number
    active: number
    pending: number
    expired: number
    cancelled: number
    totalPremium: number
    totalSumInsured: number
  }
  claims: {
    total: number
    open: number
    underReview: number
    approved: number
    rejected: number
    paid: number
    totalClaimed: number
    totalApproved: number
  }
  users: {
    total: number
    active: number
    onlineToday: number
    byDepartment: NamedCount[]
    byRole: NamedCount[]
  }
  integrations: {
    total: number
    configured: number
    connected: number
    pending: number
    disabled: number
  }
}

export type RecentActivityItem = {
  id: string
  module: 'Product' | 'Customer' | 'Policy' | 'Claim' | 'User' | 'Integration'
  title: string
  subtitle: string
  createdAt: string
}

function isSameCalendarDay(iso: string, ref = new Date()): boolean {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  )
}

function countBy(values: string[]): NamedCount[] {
  const map = new Map<string, number>()
  for (const v of values) {
    const key = v || 'Unknown'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export type ModuleHealth = {
  module: string
  status: 'Healthy' | 'Empty'
  detail: string
}

export function getDashboardMetrics(): DashboardMetrics {
  const products = ProductService.getAll()
  const customers = CustomerService.getAll()
  const policies = PolicyService.getAll()
  const claims = ClaimService.getAll()
  const users = UserService.getAll()
  const integrations = IntegrationService.getAll()

  return {
    products: {
      total: products.length,
      active: products.filter(p => p.active).length,
      inactive: products.filter(p => !p.active).length,
    },
    customers: {
      total: customers.length,
      individuals: customers.filter(c => c.customerType === 'Individual').length,
      corporate: customers.filter(c => c.customerType === 'Corporate').length,
      active: customers.filter(c => c.status === 'active').length,
    },
    policies: {
      total: policies.length,
      active: policies.filter(p => p.status === 'active').length,
      pending: policies.filter(p => p.status === 'pending').length,
      expired: policies.filter(p => p.status === 'expired').length,
      cancelled: policies.filter(p => p.status === 'cancelled').length,
      totalPremium: policies.reduce((sum, p) => sum + (p.premium || 0), 0),
      totalSumInsured: policies.reduce((sum, p) => sum + (p.sumInsured || 0), 0),
    },
    claims: {
      total: claims.length,
      open: claims.filter(c => c.status === 'open').length,
      underReview: claims.filter(c => c.status === 'under_review').length,
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
      paid: claims.filter(c => c.status === 'paid').length,
      totalClaimed: claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0),
      totalApproved: claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
    },
    users: {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      onlineToday: users.filter(u => isSameCalendarDay(u.lastLogin)).length,
      byDepartment: countBy(users.map(u => u.department)),
      byRole: countBy(users.map(u => u.roleName)),
    },
    integrations: {
      total: integrations.length,
      configured: integrations.filter(i => i.status === 'configured').length,
      connected: integrations.filter(i => i.status === 'connected').length,
      pending: integrations.filter(i => i.status === 'pending').length,
      disabled: integrations.filter(i => i.status === 'disabled').length,
    },
  }
}

export function getRecentActivity(limit = 10): RecentActivityItem[] {
  const products = ProductService.getAll().map(p => ({
    id: `product-${p.id}`,
    module: 'Product' as const,
    title: p.name,
    subtitle: p.code,
    createdAt: p.createdAt,
  }))

  const customers = CustomerService.getAll().map(c => ({
    id: `customer-${c.id}`,
    module: 'Customer' as const,
    title: customerDisplayName(c),
    subtitle: c.customerNumber,
    createdAt: c.createdAt,
  }))

  const policies = PolicyService.getAll().map(p => ({
    id: `policy-${p.id}`,
    module: 'Policy' as const,
    title: p.policyNumber,
    subtitle: `${p.customerName} · ${p.productName}`,
    createdAt: p.createdAt,
  }))

  const claims = ClaimService.getAll().map(c => ({
    id: `claim-${c.id}`,
    module: 'Claim' as const,
    title: c.claimNumber,
    subtitle: `${c.customerName} · ${c.policyNumber}`,
    createdAt: c.createdAt,
  }))

  const users = UserService.getAll().map(u => ({
    id: `user-${u.id}`,
    module: 'User' as const,
    title: userDisplayName(u),
    subtitle: `${u.employeeId} · ${u.roleName}`,
    createdAt: u.createdAt,
  }))

  const integrations = IntegrationService.getAll().map(i => ({
    id: `integration-${i.id}`,
    module: 'Integration' as const,
    title: i.name,
    subtitle: `${i.provider} · ${i.type}`,
    createdAt: i.createdAt,
  }))

  return [...products, ...customers, ...policies, ...claims, ...users, ...integrations]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, limit)
}

export function getModuleHealth(): ModuleHealth[] {
  const m = getDashboardMetrics()
  return [
    {
      module: 'Products',
      status: m.products.total > 0 ? 'Healthy' : 'Empty',
      detail: `${m.products.total} in catalogue`,
    },
    {
      module: 'Customers',
      status: m.customers.total > 0 ? 'Healthy' : 'Empty',
      detail: `${m.customers.total} in register`,
    },
    {
      module: 'Policies',
      status: m.policies.total > 0 ? 'Healthy' : 'Empty',
      detail: `${m.policies.total} in force book`,
    },
    {
      module: 'Claims',
      status: m.claims.total > 0 ? 'Healthy' : 'Empty',
      detail: `${m.claims.total} in register`,
    },
    {
      module: 'Users',
      status: m.users.total > 0 ? 'Healthy' : 'Empty',
      detail: `${m.users.total} in register`,
    },
    {
      module: 'Integrations',
      status: m.integrations.total > 0 ? 'Healthy' : 'Empty',
      detail: `${m.integrations.connected} connected · ${m.integrations.total} total`,
    },
  ]
}

/** Policies grouped by product category for the existing pie chart slot. */
export function getPoliciesByProductType(): { name: string; value: number; color: string }[] {
  const colors = ['#1D4ED8', '#16A34A', '#7C3AED', '#0EA5E9', '#F59E0B', '#DC2626', '#64748B']
  const counts = new Map<string, number>()
  for (const p of PolicyService.getAll()) {
    const key = p.policyType
      ? p.policyType.charAt(0).toUpperCase() + p.policyType.slice(1)
      : 'Other'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
}

/** Monthly premium totals from policy effective dates (₦ millions). */
export function getPremiumTrendFromPolicies(): { month: string; premium: number; target: number }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const buckets = months.map(() => 0)

  for (const p of PolicyService.getAll()) {
    const d = new Date(p.effectiveDate || p.createdAt)
    if (Number.isNaN(d.getTime())) continue
    buckets[d.getMonth()] += p.premium || 0
  }

  return months.map((month, i) => {
    const premiumM = Math.round((buckets[i] / 1_000_000) * 100) / 100
    return {
      month,
      premium: premiumM,
      target: Math.round(premiumM * 0.85 * 100) / 100,
    }
  })
}

/** Recent creates by weekday for the activity bar chart. */
export function getWeeklyCreateActivity(): { day: string; new: number; resolved: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const created = days.map(() => 0)
  const activeLike = days.map(() => 0)

  const stamp = (iso: string, into: number[]) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return
    into[d.getDay()] += 1
  }

  for (const p of ProductService.getAll()) stamp(p.createdAt, created)
  for (const c of CustomerService.getAll()) stamp(c.createdAt, created)
  for (const p of PolicyService.getAll()) {
    stamp(p.createdAt, created)
    if (p.status === 'active') stamp(p.updatedAt || p.createdAt, activeLike)
  }
  for (const c of ClaimService.getAll()) {
    stamp(c.createdAt, created)
    if (c.status === 'paid' || c.status === 'approved') stamp(c.updatedAt || c.createdAt, activeLike)
  }
  for (const u of UserService.getAll()) {
    stamp(u.createdAt, created)
    if (u.status === 'active') stamp(u.updatedAt || u.createdAt, activeLike)
  }
  for (const i of IntegrationService.getAll()) {
    stamp(i.createdAt, created)
    if (i.status === 'connected') stamp(i.updatedAt || i.createdAt, activeLike)
  }

  // Reorder Mon→Sun to match existing chart labels
  const order = [1, 2, 3, 4, 5, 6, 0]
  return order.map(i => ({
    day: days[i],
    new: created[i],
    resolved: activeLike[i],
  }))
}

export function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`
  return `₦${amount.toLocaleString()}`
}
