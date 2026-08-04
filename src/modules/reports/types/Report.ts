/**
 * Report view models — derived from live module services (no duplicated stores).
 */

export type ChartSlice = {
  name: string
  value: number
  color: string
}

export type NamedAmount = {
  name: string
  amount: number
  count?: number
}

export type TrendPoint = {
  month: string
  value: number
}

export type TopProductRow = {
  id: string
  name: string
  code: string
  policyCount: number
  premium: number
}

export type TopCustomerRow = {
  id: string
  name: string
  customerNumber: string
  policyCount: number
  premium: number
}

export type RecentPolicyRow = {
  id: string
  policyNumber: string
  customerName: string
  productName: string
  premium: number
  status: string
  createdAt: string
}

export type RecentClaimRow = {
  id: string
  claimNumber: string
  customerName: string
  productName: string
  claimAmount: number
  status: string
  createdAt: string
}

export type RecentCustomerRow = {
  id: string
  name: string
  customerNumber: string
  customerType: string
  state: string
  status: string
  createdAt: string
}

export type ReportKpis = {
  products: number
  customers: number
  policies: number
  claims: number
  users: number
  totalPremium: number
  totalSumInsured: number
  totalClaims: number
  approvedClaims: number
  rejectedClaims: number
  openClaims: number
  activePolicies: number
  expiredPolicies: number
  pendingPolicies: number
}

export type ReportSnapshot = {
  kpis: ReportKpis
  policiesByProduct: ChartSlice[]
  premiumByProduct: ChartSlice[]
  claimsByStatus: ChartSlice[]
  claimsByProduct: ChartSlice[]
  customersByState: ChartSlice[]
  customersByType: ChartSlice[]
  usersByDepartment: ChartSlice[]
  monthlyPremiumTrend: TrendPoint[]
  monthlyClaimsTrend: TrendPoint[]
  topProductsByPremium: TopProductRow[]
  topCustomersByPremium: TopCustomerRow[]
  recentPolicies: RecentPolicyRow[]
  recentClaims: RecentClaimRow[]
  recentCustomers: RecentCustomerRow[]
}
