/**
 * ReportService — live aggregations over Product / Customer / Policy / Claim / User.
 * Reuses dashboardData helpers; does not duplicate in-memory stores.
 */
import {
  formatNairaCompact,
  getDashboardMetrics,
  getPremiumTrendFromPolicies,
} from '../../../admin/dashboardData'
import { ClaimService } from '../../claims/services/ClaimService'
import { claimStatusLabel } from '../../claims/types/Claim'
import { CustomerService } from '../../customers/services/CustomerService'
import { customerDisplayName } from '../../customers/types/Customer'
import { PolicyService } from '../../policies/services/PolicyService'
import { ProductService } from '../../products/services/ProductService'
import { colorAt } from '../config/chartColors'
import type {
  ChartSlice,
  NamedAmount,
  ReportSnapshot,
  RecentClaimRow,
  RecentCustomerRow,
  RecentPolicyRow,
  TopCustomerRow,
  TopProductRow,
} from '../types/Report'

function toSlices(rows: { name: string; value: number }[]): ChartSlice[] {
  return rows
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .map((r, i) => ({ name: r.name, value: r.value, color: colorAt(i) }))
}

function aggregateSum(entries: { key: string; amount: number }[]): NamedAmount[] {
  const map = new Map<string, { amount: number; count: number }>()
  for (const e of entries) {
    const key = e.key || 'Unknown'
    const cur = map.get(key) ?? { amount: 0, count: 0 }
    cur.amount += e.amount
    cur.count += 1
    map.set(key, cur)
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, amount: v.amount, count: v.count }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name))
}

function aggregateCount(keys: string[]): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const raw of keys) {
    const key = raw || 'Unknown'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }))
}

function monthlyBuckets(isoDates: string[]): { month: string; value: number }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const buckets = months.map(() => 0)
  for (const iso of isoDates) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) continue
    buckets[d.getMonth()] += 1
  }
  return months.map((month, i) => ({ month, value: buckets[i] }))
}

function sortByCreatedDesc<T extends { createdAt: string }>(rows: T[], limit: number): T[] {
  return [...rows]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, limit)
}

class ReportServiceImpl {
  /** Full live snapshot for the Reports dashboard. */
  getSnapshot(tableLimit = 8): ReportSnapshot {
    const metrics = getDashboardMetrics()
    const products = ProductService.getAll()
    const customers = CustomerService.getAll()
    const policies = PolicyService.getAll()
    const claims = ClaimService.getAll()

    const premiumTrend = getPremiumTrendFromPolicies()

    const policiesByProduct = toSlices(
      aggregateCount(policies.map(p => p.productName || 'Unknown')),
    )

    const premiumByProduct = toSlices(
      aggregateSum(policies.map(p => ({ key: p.productName || 'Unknown', amount: p.premium || 0 }))).map(
        r => ({ name: r.name, value: Math.round(r.amount) }),
      ),
    )

    const claimsByStatus = toSlices(
      aggregateCount(claims.map(c => claimStatusLabel(c.status))),
    )

    const claimsByProduct = toSlices(
      aggregateCount(claims.map(c => c.productName || 'Unknown')),
    )

    const customersByState = toSlices(
      aggregateCount(customers.map(c => c.state || 'Unknown')),
    )

    const customersByType = toSlices(
      aggregateCount(customers.map(c => c.customerType || 'Unknown')),
    )

    const usersByDepartment = toSlices(
      metrics.users.byDepartment.map(d => ({ name: d.name, value: d.count })),
    )

    // Premium by customer / product for top tables
    const premiumByCustomer = aggregateSum(
      policies.map(p => ({ key: p.customerId, amount: p.premium || 0 })),
    )
    const customerIndex = new Map(customers.map(c => [c.id, c]))
    const policyCountByCustomer = new Map<string, number>()
    for (const p of policies) {
      policyCountByCustomer.set(p.customerId, (policyCountByCustomer.get(p.customerId) ?? 0) + 1)
    }

    const topCustomersByPremium: TopCustomerRow[] = premiumByCustomer.slice(0, tableLimit).map(row => {
      const c = customerIndex.get(row.name)
      return {
        id: row.name,
        name: c ? customerDisplayName(c) : policies.find(p => p.customerId === row.name)?.customerName || row.name,
        customerNumber: c?.customerNumber ?? '—',
        policyCount: policyCountByCustomer.get(row.name) ?? row.count ?? 0,
        premium: row.amount,
      }
    })

    const premiumByProductId = aggregateSum(
      policies.map(p => ({ key: p.productId, amount: p.premium || 0 })),
    )
    const productIndex = new Map(products.map(p => [p.id, p]))
    const policyCountByProduct = new Map<string, number>()
    for (const p of policies) {
      policyCountByProduct.set(p.productId, (policyCountByProduct.get(p.productId) ?? 0) + 1)
    }

    const topProductsByPremium: TopProductRow[] = premiumByProductId.slice(0, tableLimit).map(row => {
      const prod = productIndex.get(row.name)
      return {
        id: row.name,
        name: prod?.name ?? policies.find(p => p.productId === row.name)?.productName ?? row.name,
        code: prod?.code ?? '—',
        policyCount: policyCountByProduct.get(row.name) ?? row.count ?? 0,
        premium: row.amount,
      }
    })

    const recentPolicies: RecentPolicyRow[] = sortByCreatedDesc(
      policies.map(p => ({
        id: p.id,
        policyNumber: p.policyNumber,
        customerName: p.customerName,
        productName: p.productName,
        premium: p.premium,
        status: p.status,
        createdAt: p.createdAt,
      })),
      tableLimit,
    )

    const recentClaims: RecentClaimRow[] = sortByCreatedDesc(
      claims.map(c => ({
        id: c.id,
        claimNumber: c.claimNumber,
        customerName: c.customerName,
        productName: c.productName,
        claimAmount: c.claimAmount,
        status: claimStatusLabel(c.status),
        createdAt: c.createdAt,
      })),
      tableLimit,
    )

    const recentCustomers: RecentCustomerRow[] = sortByCreatedDesc(
      customers.map(c => ({
        id: c.id,
        name: customerDisplayName(c),
        customerNumber: c.customerNumber,
        customerType: c.customerType,
        state: c.state,
        status: c.status,
        createdAt: c.createdAt,
      })),
      tableLimit,
    )

    return {
      kpis: {
        products: metrics.products.total,
        customers: metrics.customers.total,
        policies: metrics.policies.total,
        claims: metrics.claims.total,
        users: metrics.users.total,
        totalPremium: metrics.policies.totalPremium,
        totalSumInsured: metrics.policies.totalSumInsured,
        totalClaims: metrics.claims.total,
        approvedClaims: metrics.claims.approved,
        rejectedClaims: metrics.claims.rejected,
        openClaims: metrics.claims.open,
        activePolicies: metrics.policies.active,
        expiredPolicies: metrics.policies.expired,
        pendingPolicies: metrics.policies.pending,
      },
      policiesByProduct,
      premiumByProduct,
      claimsByStatus,
      claimsByProduct,
      customersByState,
      customersByType,
      usersByDepartment,
      monthlyPremiumTrend: premiumTrend.map(p => ({ month: p.month, value: p.premium })),
      monthlyClaimsTrend: monthlyBuckets(claims.map(c => c.reportedDate || c.createdAt)),
      topProductsByPremium,
      topCustomersByPremium,
      recentPolicies,
      recentClaims,
      recentCustomers,
    }
  }

  formatMoney(amount: number): string {
    return formatNairaCompact(amount)
  }
}

export const ReportService = new ReportServiceImpl()
