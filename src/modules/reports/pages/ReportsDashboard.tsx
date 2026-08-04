/**
 * ReportsDashboard — live analytics over Products, Customers, Policies, Claims, Users.
 * Charts and cards reuse Admin Overview design language (recharts + existing tokens).
 */
import { useEffect, useMemo, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Card, CardHeader } from '../../../components/ui'
import { onMemoryDataChange } from '../../../admin/memoryDataEvents'
import { ReportService } from '../services/ReportService'
import type { ChartSlice } from '../types/Report'
import ExportActions from '../components/ExportActions'
import ReportChartCard, { reportTokens as T } from '../components/ReportChartCard'
import ReportTable from '../components/ReportTable'

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function PieWithLegend({ data, emptyLabel }: { data: ChartSlice[]; emptyLabel: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 140 }}>
      <ResponsiveContainer width="48%" height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="value">
            {data.map((entry, i) => <Cell key={entry.name + i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
            </div>
            <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.text, flexShrink: 0 }}>{d.value}</span>
          </div>
        ))}
        {data.length === 0 && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: T.muted }}>{emptyLabel}</span>
        )}
        {data.length > 0 && (
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4 }}>Total {total}</span>
        )}
      </div>
    </div>
  )
}

function HorizontalBars({ data, valueFormatter }: { data: ChartSlice[]; valueFormatter?: (n: number) => string }) {
  const fmt = valueFormatter ?? ((n: number) => String(n))
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 28 + 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
        <XAxis type="number" tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: T.muted }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }}
          formatter={(v: number | string | ReadonlyArray<number | string> | undefined) => [fmt(Number(v ?? 0)), '']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => <Cell key={entry.name + i} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function ReportsDashboard() {
  const [version, setVersion] = useState(0)

  useEffect(() => onMemoryDataChange(() => setVersion(v => v + 1)), [])

  const report = useMemo(() => {
    void version
    return ReportService.getSnapshot(8)
  }, [version])

  const { kpis } = report
  const money = (n: number) => ReportService.formatMoney(n)

  const primaryKpis = [
    { label: 'Products', val: String(kpis.products) },
    { label: 'Customers', val: String(kpis.customers) },
    { label: 'Policies', val: String(kpis.policies) },
    { label: 'Claims', val: String(kpis.claims) },
    { label: 'Users', val: String(kpis.users) },
  ]

  const financialKpis = [
    { label: 'Total Premium', val: money(kpis.totalPremium) },
    { label: 'Total Sum Insured', val: money(kpis.totalSumInsured) },
    { label: 'Total Claims', val: String(kpis.totalClaims) },
    { label: 'Approved Claims', val: String(kpis.approvedClaims) },
    { label: 'Rejected Claims', val: String(kpis.rejectedClaims) },
    { label: 'Open Claims', val: String(kpis.openClaims) },
    { label: 'Active Policies', val: String(kpis.activePolicies) },
    { label: 'Expired Policies', val: String(kpis.expiredPolicies) },
    { label: 'Pending Policies', val: String(kpis.pendingPolicies) },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="Reports & Analytics"
          subtitle="Live in-memory aggregates · Products · Customers · Policies · Claims · Users"
          action={<ExportActions compact />}
        />
      </Card>

      {/* Module summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {primaryKpis.map(s => (
          <div key={s.label} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: '16px 18px' }}>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.03em', marginTop: 6 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {financialKpis.map(s => (
          <div key={s.label} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: T.muted }}>{s.label}</p>
            <p style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Trend charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ReportChartCard title="Monthly Premium Trend" subtitle="₦ millions · from live policies">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={report.monthlyPremiumTrend} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="reportPremGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }} formatter={(v: number | string | ReadonlyArray<number | string> | undefined) => [`₦${v}M`, '']} />
              <Area type="monotone" dataKey="value" stroke="#1D4ED8" strokeWidth={2.5} fill="url(#reportPremGrad)" dot={false} activeDot={{ r: 5, fill: '#1D4ED8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ReportChartCard>

        <ReportChartCard title="Monthly Claims Trend" subtitle="Claim count by reported month">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={report.monthlyClaimsTrend} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="reportClaimGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }} />
              <Area type="monotone" dataKey="value" stroke="#DC2626" strokeWidth={2.5} fill="url(#reportClaimGrad)" dot={false} activeDot={{ r: 5, fill: '#DC2626' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ReportChartCard>
      </div>

      {/* Distribution pies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <ReportChartCard title="Policies by Product" subtitle="Live force book">
          <PieWithLegend data={report.policiesByProduct} emptyLabel="No policies yet" />
        </ReportChartCard>
        <ReportChartCard title="Claims by Status" subtitle="Register mix">
          <PieWithLegend data={report.claimsByStatus} emptyLabel="No claims yet" />
        </ReportChartCard>
        <ReportChartCard title="Customers by Type" subtitle="Individual vs corporate">
          <PieWithLegend data={report.customersByType} emptyLabel="No customers yet" />
        </ReportChartCard>
      </div>

      {/* Bar charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ReportChartCard title="Premium by Product" subtitle="Sum of policy premiums">
          <HorizontalBars data={report.premiumByProduct} valueFormatter={money} />
        </ReportChartCard>
        <ReportChartCard title="Claims by Product" subtitle="Claim count">
          <HorizontalBars data={report.claimsByProduct} />
        </ReportChartCard>
        <ReportChartCard title="Customers by State" subtitle="Geographic mix">
          <HorizontalBars data={report.customersByState} />
        </ReportChartCard>
        <ReportChartCard title="Users by Department" subtitle="Identity register">
          <HorizontalBars data={report.usersByDepartment} />
        </ReportChartCard>
      </div>

      {/* Top / recent tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border}` }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: T.text }}>Top Products by Premium</p>
          </div>
          <ReportTable
            rowKey={r => r.id}
            rows={report.topProductsByPremium}
            columns={[
              { key: 'name', header: 'Product', render: r => r.name },
              { key: 'code', header: 'Code', render: r => <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{r.code}</span> },
              { key: 'policies', header: 'Policies', align: 'right', render: r => r.policyCount },
              { key: 'premium', header: 'Premium', align: 'right', render: r => money(r.premium) },
            ]}
          />
        </div>

        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border}` }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: T.text }}>Top Customers by Premium</p>
          </div>
          <ReportTable
            rowKey={r => r.id}
            rows={report.topCustomersByPremium}
            columns={[
              { key: 'name', header: 'Customer', render: r => r.name },
              { key: 'num', header: 'Number', render: r => <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{r.customerNumber}</span> },
              { key: 'policies', header: 'Policies', align: 'right', render: r => r.policyCount },
              { key: 'premium', header: 'Premium', align: 'right', render: r => money(r.premium) },
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border}` }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: T.text }}>Recent Policies</p>
          </div>
          <ReportTable
            rowKey={r => r.id}
            rows={report.recentPolicies}
            columns={[
              { key: 'num', header: 'Policy', render: r => <span style={{ fontFamily: T.mono, fontSize: 12 }}>{r.policyNumber}</span> },
              { key: 'customer', header: 'Customer', render: r => r.customerName },
              { key: 'product', header: 'Product', render: r => r.productName },
              { key: 'premium', header: 'Premium', align: 'right', render: r => money(r.premium) },
              { key: 'status', header: 'Status', render: r => r.status },
              { key: 'date', header: 'Created', render: r => formatDate(r.createdAt) },
            ]}
          />
        </div>

        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border}` }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: T.text }}>Recent Claims</p>
          </div>
          <ReportTable
            rowKey={r => r.id}
            rows={report.recentClaims}
            columns={[
              { key: 'num', header: 'Claim', render: r => <span style={{ fontFamily: T.mono, fontSize: 12 }}>{r.claimNumber}</span> },
              { key: 'customer', header: 'Customer', render: r => r.customerName },
              { key: 'product', header: 'Product', render: r => r.productName },
              { key: 'amount', header: 'Amount', align: 'right', render: r => money(r.claimAmount) },
              { key: 'status', header: 'Status', render: r => r.status },
              { key: 'date', header: 'Created', render: r => formatDate(r.createdAt) },
            ]}
          />
        </div>

        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border}` }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: T.text }}>Recent Customers</p>
          </div>
          <ReportTable
            rowKey={r => r.id}
            rows={report.recentCustomers}
            columns={[
              { key: 'name', header: 'Customer', render: r => r.name },
              { key: 'num', header: 'Number', render: r => <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{r.customerNumber}</span> },
              { key: 'type', header: 'Type', render: r => r.customerType },
              { key: 'state', header: 'State', render: r => r.state },
              { key: 'status', header: 'Status', render: r => r.status },
              { key: 'date', header: 'Created', render: r => formatDate(r.createdAt) },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
