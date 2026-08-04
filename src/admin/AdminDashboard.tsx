import { useState, useEffect, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { useBranding } from '../config/BrandingContext'
import { useFeatures } from '../config/FeatureContext'
import type { FeatureKey } from '../config/features'
import CompanySettings from '../settings/CompanySettings'
import { ProductManagement } from '../modules/products'
import { CustomerManagement } from '../modules/customers'
import { PolicyManagement } from '../modules/policies'
import { ClaimManagement } from '../modules/claims'
import { ReportsDashboard } from '../modules/reports'
import { IntegrationManagement } from '../modules/integrations'
import { UserManagement } from '../modules/users'
import { onMemoryDataChange } from './memoryDataEvents'
import {
  formatNairaCompact,
  getDashboardMetrics,
  getModuleHealth,
  getPoliciesByProductType,
  getPremiumTrendFromPolicies,
  getRecentActivity,
  getWeeklyCreateActivity,
} from './dashboardData'

// â”€â”€ Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const T = {
  sidebar: '#0A1628',
  sidebarBorder: 'rgba(255,255,255,0.07)',
  sidebarText: 'rgba(255,255,255,0.5)',
  sidebarActive: '#F59E0B',
  canvas: '#F4F3EF',        // parchment
  card: '#FFFFFF',
  border: '#E4E2DC',
  text: '#0F172A',
  muted: '#64748B',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberBorder: '#FDE68A',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  greenBorder: '#BBF7D0',
  red: '#DC2626',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  blue: '#1D4ED8',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',
  navy: '#1E3A5F',
  mono: "'DM Mono', monospace",
  display: "'Plus Jakarta Sans', sans-serif",
  body: "'DM Sans', sans-serif",
}

// â”€â”€ Chart data is derived live in OverviewSection via dashboardData helpers â”€â”€â”€

// â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type AdminView = 'overview' | 'claims' | 'policyholders' | 'premiums' | 'products' | 'users' | 'reports' | 'integrations' | 'settings'

const navItems: { id: AdminView; label: string; icon: React.ReactNode; badge?: number; feature: FeatureKey }[] = [
  { id: 'overview', label: 'Overview', icon: <OverviewIcon />, feature: 'dashboard' },
  { id: 'claims', label: 'Claims', icon: <ClaimsIcon />, feature: 'claims' },
  { id: 'policyholders', label: 'Policyholders', icon: <PeopleIcon />, feature: 'customers' },
  { id: 'premiums', label: 'Premiums', icon: <PremiumIcon />, feature: 'policies' },
  { id: 'products', label: 'Products', icon: <ProductsIcon />, feature: 'products' },
  { id: 'users', label: 'Users', icon: <UsersIcon />, feature: 'users' },
  { id: 'reports', label: 'Reports', icon: <ReportIcon />, feature: 'reports' },
  { id: 'integrations', label: 'Integrations', icon: <IntegrationsIcon />, feature: 'integrations' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, feature: 'settings' },
]

function OverviewIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg> }
function ClaimsIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M7 9h6M7 12h4"/></svg> }
function PeopleIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><circle cx="8" cy="7" r="3"/><path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5"/><circle cx="15" cy="8" r="2"/><path d="M17 17c0-2-1.3-3.5-3-4"/></svg> }
function PremiumIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M10 2L3 7v11h14V7L10 2z"/><path d="M10 12v3M10 8v2"/></svg> }
function ReportIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M4 2h8l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M12 2v4h4M7 10h6M7 13h4"/></svg> }
function ProductsIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M3 5l7-2 7 2v10l-7 2-7-2V5z"/><path d="M10 3v14M3 5l7 2 7-2"/></svg> }
function UsersIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><circle cx="7" cy="7" r="2.5"/><circle cx="14" cy="8" r="2"/><path d="M2 16c0-2.5 2.2-4 5-4s5 1.5 5 4"/><path d="M12 16c0-1.8 1.3-3.2 3-3.5"/></svg> }
function IntegrationsIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M7 3h6v4H7zM3 13h6v4H3zM11 13h6v4h-6z"/><path d="M10 7v3M6 13v-3h8v3"/></svg> }
function SettingsIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg> }
function BellIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M10 2a6 6 0 00-6 6v3l-1 2h14l-1-2V8a6 6 0 00-6-6z"/><path d="M8.5 17a1.5 1.5 0 003 0"/></svg> }
function ChevDownIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M5 8l5 5 5-5"/></svg> }
function TrendUpIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M3 14l5-5 4 3 5-6"/><path d="M14 6h3v3"/></svg> }

// â”€â”€ KPI Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KpiCard({ label, value, sub, trend, trendDir, accent }: {
  label: string; value: string; sub: string; trend: string; trendDir: 'up' | 'down' | 'neutral'; accent: string
}) {
  const trendColor = trendDir === 'up' ? T.green : trendDir === 'down' ? T.red : T.muted
  return (
    <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          <TrendUpIcon />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: T.display, fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
        <p style={{ fontFamily: T.body, fontSize: 12, color: T.muted, marginTop: 5 }}>{sub}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 6, borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: trendColor }}>{trend}</span>
      </div>
    </div>
  )
}

// â”€â”€ Overview section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OverviewSection({ onNavigate }: { onNavigate: (view: AdminView) => void }) {
  const [version, setVersion] = useState(0)
  const { isEnabled } = useFeatures()

  useEffect(() => onMemoryDataChange(() => setVersion(v => v + 1)), [])

  const metrics = useMemo(() => {
    void version
    return getDashboardMetrics()
  }, [version])

  const recent = useMemo(() => {
    void version
    return getRecentActivity(10)
  }, [version])

  const health = useMemo(() => {
    void version
    return getModuleHealth()
  }, [version])

  const premiumTrend = useMemo(() => {
    void version
    return getPremiumTrendFromPolicies()
  }, [version])

  const policiesByType = useMemo(() => {
    void version
    return getPoliciesByProductType()
  }, [version])

  const weeklyActivity = useMemo(() => {
    void version
    return getWeeklyCreateActivity()
  }, [version])

  const policiesByTypeTotal = policiesByType.reduce((sum, d) => sum + d.value, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs â€” live module values, same card layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard
          label="Active Customers"
          value={metrics.customers.active.toLocaleString()}
          sub={`${metrics.customers.total} total Â· ${metrics.customers.individuals} ind. / ${metrics.customers.corporate} corp.`}
          trend={`${metrics.customers.individuals} individuals Â· ${metrics.customers.corporate} corporate`}
          trendDir="neutral"
          accent={T.blue}
        />
        <KpiCard
          label="Total Premium"
          value={formatNairaCompact(metrics.policies.totalPremium)}
          sub={`Sum insured ${formatNairaCompact(metrics.policies.totalSumInsured)}`}
          trend={`${metrics.policies.total} policies in book`}
          trendDir="neutral"
          accent={T.amber}
        />
        <KpiCard
          label="Pending Policies"
          value={String(metrics.policies.pending)}
          sub={`${metrics.policies.expired} expired Â· ${metrics.policies.cancelled} cancelled`}
          trend={`${metrics.policies.active} active`}
          trendDir={metrics.policies.pending > 0 ? 'down' : 'up'}
          accent={T.red}
        />
        <KpiCard
          label="Active Products"
          value={String(metrics.products.active)}
          sub={`${metrics.products.total} total Â· ${metrics.products.inactive} inactive`}
          trend={`${metrics.products.active} of ${metrics.products.total} active`}
          trendDir="up"
          accent={T.green}
        />
      </div>

      {/* Secondary KPIs â€” live module counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Policies', val: String(metrics.policies.total) },
          { label: 'Active Policies', val: String(metrics.policies.active) },
          { label: 'Total Customers', val: String(metrics.customers.total) },
          { label: 'Total Products', val: String(metrics.products.total) },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>{s.label}</p>
            <p style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Claims KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Claims', val: String(metrics.claims.total) },
          { label: 'Open Claims', val: String(metrics.claims.open) },
          { label: 'Approved Claims', val: String(metrics.claims.approved) },
          { label: 'Rejected Claims', val: String(metrics.claims.rejected) },
          { label: 'Paid Claims', val: String(metrics.claims.paid) },
          { label: 'Under Review', val: String(metrics.claims.underReview) },
          { label: 'Total Claims Amount', val: formatNairaCompact(metrics.claims.totalClaimed) },
          { label: 'Approved Amount', val: formatNairaCompact(metrics.claims.totalApproved) },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>{s.label}</p>
            <p style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Users KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Users', val: String(metrics.users.total) },
          { label: 'Active Users', val: String(metrics.users.active) },
          { label: 'Online Today', val: String(metrics.users.onlineToday) },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>{s.label}</p>
            <p style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Integration KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Configured', val: String(metrics.integrations.configured) },
          { label: 'Connected', val: String(metrics.integrations.connected) },
          { label: 'Pending', val: String(metrics.integrations.pending) },
          { label: 'Disabled', val: String(metrics.integrations.disabled) },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>{s.label}</p>
            <p style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Users by department / role */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '22px 24px' }}>
          <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Users by Department</p>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Live identity register</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {metrics.users.byDepartment.map(row => (
              <div key={row.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>{row.name}</span>
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: T.text }}>{row.count}</span>
              </div>
            ))}
            {metrics.users.byDepartment.length === 0 && (
              <p style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>No users yet</p>
            )}
          </div>
        </div>
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '22px 24px' }}>
          <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Users by Role</p>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Assigned roles</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {metrics.users.byRole.map(row => (
              <div key={row.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>{row.name}</span>
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: T.text }}>{row.count}</span>
              </div>
            ))}
            {metrics.users.byRole.length === 0 && (
              <p style={{ fontFamily: T.body, fontSize: 13, color: T.muted }}>No users yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        {/* Premium trend */}
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>Monthly Premium Revenue</p>
              <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>â‚¦ millions Â· from live policies</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ dot: T.blue, label: 'Actual' }, { dot: T.border, label: 'Target' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.dot }} />
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={premiumTrend} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.blue} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={T.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }} formatter={(v: number | string | ReadonlyArray<number | string> | undefined) => [`â‚¦${v}M`, '']} />
              <Area type="monotone" dataKey="target" stroke={T.border} strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
              <Area type="monotone" dataKey="premium" stroke={T.blue} strokeWidth={2.5} fill="url(#premGrad)" dot={false} activeDot={{ r: 5, fill: T.blue }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Policies by type (replaces demo claims pie with live policy mix) */}
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>Policies by Type</p>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{policiesByTypeTotal} total live</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={policiesByType} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="value">
                  {policiesByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {policiesByType.map(d => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: T.body, fontSize: 12, color: T.muted }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.text }}>{d.value}</span>
                </div>
              ))}
              {policiesByType.length === 0 && (
                <span style={{ fontFamily: T.body, fontSize: 12, color: T.muted }}>No policies yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly activity bars */}
      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>Module Activity by Weekday</p>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Creates vs. active policy updates</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ dot: T.blue, label: 'New' }, { dot: T.green, label: 'Active' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.dot }} />
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyActivity} barGap={4} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: T.mono, fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }} />
            <Bar dataKey="new" fill={T.blue} radius={[4, 4, 0, 0]} />
            <Bar dataKey="resolved" fill={T.green} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick actions + health + recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 20 }}>
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '22px 24px' }}>
          <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Quick Actions</p>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Jump to module</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isEnabled('products') && (
              <button
                onClick={() => onNavigate('products')}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: T.blue, color: 'white', fontFamily: T.display, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                Create Product
              </button>
            )}
            {isEnabled('customers') && (
              <button
                onClick={() => onNavigate('policyholders')}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: T.canvas, color: T.text, fontFamily: T.display, fontSize: 13, fontWeight: 700, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left' }}
              >
                Create Customer
              </button>
            )}
            {isEnabled('policies') && (
              <button
                onClick={() => onNavigate('premiums')}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: T.canvas, color: T.text, fontFamily: T.display, fontSize: 13, fontWeight: 700, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left' }}
              >
                Issue Policy
              </button>
            )}
            {isEnabled('claims') && (
              <button
                onClick={() => onNavigate('claims')}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: T.canvas, color: T.text, fontFamily: T.display, fontSize: 13, fontWeight: 700, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left' }}
              >
                File Claim
              </button>
            )}
            {isEnabled('reports') && (
              <button
                onClick={() => onNavigate('reports')}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: T.canvas, color: T.text, fontFamily: T.display, fontSize: 13, fontWeight: 700, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left' }}
              >
                Open Reports
              </button>
            )}
            {isEnabled('users') && (
              <button
                onClick={() => onNavigate('users')}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: T.canvas, color: T.text, fontFamily: T.display, fontSize: 13, fontWeight: 700, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left' }}
              >
                Manage Users
              </button>
            )}
            {isEnabled('integrations') && (
              <button
                onClick={() => onNavigate('integrations')}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: T.canvas, color: T.text, fontFamily: T.display, fontSize: 13, fontWeight: 700, border: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left' }}
              >
                Manage Integrations
              </button>
            )}
          </div>
        </div>

        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '22px 24px' }}>
          <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>System Status</p>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Data source Â· in-memory</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {health.map(h => (
              <div key={h.module} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <p style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.text }}>{h.module}</p>
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{h.detail}</p>
                </div>
                <span style={{
                  padding: '3px 9px',
                  borderRadius: 20,
                  background: h.status === 'Healthy' ? T.greenLight : T.amberLight,
                  fontFamily: T.mono,
                  fontSize: 11,
                  fontWeight: 600,
                  color: h.status === 'Healthy' ? T.green : '#92400E',
                }}>
                  {h.status}
                </span>
              </div>
            ))}
            <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4 }}>Data Source: In-memory</p>
          </div>
        </div>

        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '22px 24px' }}>
          <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Recent Activity</p>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Latest 10 Â· by createdAt</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 280, overflowY: 'auto' }}>
            {recent.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{item.module} Â· {item.subtitle}</p>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, flexShrink: 0 }}>
                  {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
            {recent.length === 0 && (
              <p style={{ fontFamily: T.body, fontSize: 13, color: T.muted, padding: '12px 0' }}>No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Main dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<AdminView>('overview')
  const { branding } = useBranding()
  const { isEnabled } = useFeatures()

  const visibleNav = navItems.filter(item => {
    if (item.id === 'settings') return isEnabled('settings') || view === 'settings'
    if (item.id === 'overview') return isEnabled('dashboard') || isEnabled('analytics')
    return isEnabled(item.feature)
  })
  const activeView = visibleNav.some(n => n.id === view)
    ? view
    : (visibleNav[0]?.id ?? 'settings')

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: T.body, background: T.canvas, overflow: 'hidden' }}>
      {/* â”€â”€ Sidebar â”€â”€ */}
      <aside style={{ width: 220, background: T.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: `1px solid ${T.sidebarBorder}` }}>
        {/* Logo */}
        <div style={{ padding: '22px 22px 16px', borderBottom: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M10 2l7 4v5c0 4-3 7-7 8C6 18 3 15 3 11V6l7-4z" /></svg>
            </div>
            <div>
              <p style={{ fontFamily: T.display, fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '-0.01em', lineHeight: 1 }}>{branding.companyName}</p>
              <p style={{ fontFamily: T.mono, fontSize: 9, color: T.sidebarText, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{branding.adminLabel}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visibleNav.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, background: activeView === item.id ? 'rgba(245,158,11,0.12)' : 'transparent', border: activeView === item.id ? `1px solid rgba(245,158,11,0.2)` : '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: activeView === item.id ? T.amber : T.sidebarText }}>
                {item.icon}
                <span style={{ fontFamily: T.body, fontSize: 13, fontWeight: activeView === item.id ? 700 : 400, color: activeView === item.id ? T.amber : T.sidebarText }}>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{ padding: '2px 7px', borderRadius: 10, background: T.red, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: 'white' }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom strip */}
        <div style={{ padding: '14px 12px', borderTop: `1px solid ${T.sidebarBorder}` }}>
          <button onClick={onExit} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'transparent', border: `1px solid ${T.sidebarBorder}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: T.sidebarText }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M13 3H4a1 1 0 00-1 1v12a1 1 0 001 1h9M17 10H7M17 10l-3-3M17 10l-3 3"/></svg>
            <span style={{ fontFamily: T.body, fontSize: 12, fontWeight: 500 }}>Exit to Website</span>
          </button>
        </div>
      </aside>

      {/* â”€â”€ Main area â”€â”€ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {navItems.find(n => n.id === activeView)?.label ?? 'Dashboard'}
            </p>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 1 }}>Mon, 25 Nov 2024 Â· 14:37 WAT</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Alert badge */}
            <div style={{ position: 'relative' }}>
              <button style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.muted }}>
                <BellIcon />
              </button>
              <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, color: 'white' }}>3</span>
              </div>
            </div>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.canvas, cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: 'white' }}>KA</span>
              </div>
              <div>
                <p style={{ fontFamily: T.body, fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1 }}>Kunle Adesanya</p>
                <p style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 1 }}>Head of Claims</p>
              </div>
              <div style={{ color: T.muted }}><ChevDownIcon /></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {activeView === 'overview' && (isEnabled('dashboard') || isEnabled('analytics')) && <OverviewSection onNavigate={setView} />}
          {activeView === 'claims' && isEnabled('claims') && <ClaimManagement />}
          {activeView === 'policyholders' && isEnabled('customers') && <CustomerManagement />}
          {activeView === 'premiums' && isEnabled('policies') && <PolicyManagement />}
          {activeView === 'products' && isEnabled('products') && <ProductManagement />}
          {activeView === 'users' && isEnabled('users') && <UserManagement />}
          {activeView === 'reports' && isEnabled('reports') && <ReportsDashboard />}
          {activeView === 'integrations' && isEnabled('integrations') && <IntegrationManagement />}
          {activeView === 'settings' && <CompanySettings />}
        </main>
      </div>
    </div>
  )
}
