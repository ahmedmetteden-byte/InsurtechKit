import { useState, useCallback, useEffect, useMemo } from 'react'
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

// ── Tokens ────────────────────────────────────────────────────────────────────
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

// ── Chart data is derived live in OverviewSection via dashboardData helpers ───

type ClaimStatus = 'Under Review' | 'Approved' | 'Denied' | 'Pending Docs' | 'Escalated'
type ClaimUrgency = 'Critical' | 'High' | 'Medium' | 'Low'
type ClaimType = 'Motor' | 'Health' | 'Property' | 'Marine' | 'Life'

interface Claim {
  id: string
  policyholder: string
  policy: string
  type: ClaimType
  status: ClaimStatus
  urgency: ClaimUrgency
  amount: number
  filed: string
  handler: string
  state: string
  description: string
}

const allClaims: Claim[] = [
  { id: 'CLM-2024-00891', policyholder: 'Amaka Okafor', policy: 'POL-2024-00234', type: 'Motor', status: 'Under Review', urgency: 'Critical', amount: 1850000, filed: '2024-11-21', handler: 'Emeka N.', state: 'Lagos', description: 'Total loss — head-on collision on Lagos-Ibadan expressway' },
  { id: 'CLM-2024-00887', policyholder: 'Biodun Adeyemi', policy: 'POL-2024-00189', type: 'Health', status: 'Pending Docs', urgency: 'High', amount: 420000, filed: '2024-11-20', handler: 'Ngozi A.', state: 'FCT', description: 'Emergency surgery — National Hospital Abuja' },
  { id: 'CLM-2024-00884', policyholder: 'Chisom Eze', policy: 'POL-2024-00312', type: 'Property', status: 'Approved', urgency: 'Medium', amount: 3200000, filed: '2024-11-19', handler: 'Femi A.', state: 'Rivers', description: 'Flood damage to residential property, GRA Phase 2' },
  { id: 'CLM-2024-00881', policyholder: 'Damilola Fashola', policy: 'POL-2024-00078', type: 'Motor', status: 'Denied', urgency: 'Low', amount: 280000, filed: '2024-11-18', handler: 'Chidera O.', state: 'Lagos', description: 'Third-party claim — disputed liability' },
  { id: 'CLM-2024-00879', policyholder: 'Emmanuel Nwosu', policy: 'POL-2024-00445', type: 'Health', status: 'Approved', urgency: 'Medium', amount: 185000, filed: '2024-11-17', handler: 'Ngozi A.', state: 'Oyo', description: 'Hospitalisation — University College Hospital Ibadan' },
  { id: 'CLM-2024-00876', policyholder: 'Fatima Bello', policy: 'POL-2024-00390', type: 'Life', status: 'Escalated', urgency: 'Critical', amount: 15000000, filed: '2024-11-17', handler: 'Musa I.', state: 'Kano', description: 'Death benefit claim — awaiting coroner certificate' },
  { id: 'CLM-2024-00872', policyholder: 'Gbenga Olusanya', policy: 'POL-2024-00201', type: 'Motor', status: 'Under Review', urgency: 'High', amount: 640000, filed: '2024-11-16', handler: 'Emeka N.', state: 'Lagos', description: 'Vehicle theft — reported to Victoria Island Police' },
  { id: 'CLM-2024-00869', policyholder: 'Hauwa Suleiman', policy: 'POL-2024-00156', type: 'Property', status: 'Pending Docs', urgency: 'High', amount: 890000, filed: '2024-11-15', handler: 'Femi A.', state: 'Kano', description: 'Fire damage to commercial property — Sabon Gari market' },
  { id: 'CLM-2024-00865', policyholder: 'Ikenna Obi', policy: 'POL-2024-00567', type: 'Marine', status: 'Approved', urgency: 'Medium', amount: 4700000, filed: '2024-11-14', handler: 'Chidera O.', state: 'Rivers', description: 'Cargo loss in transit — Apapa Port' },
  { id: 'CLM-2024-00861', policyholder: 'Jumoke Adewale', policy: 'POL-2024-00099', type: 'Health', status: 'Under Review', urgency: 'Medium', amount: 320000, filed: '2024-11-14', handler: 'Ngozi A.', state: 'Lagos', description: 'Cancer treatment — Luth Oncology department' },
  { id: 'CLM-2024-00857', policyholder: 'Kola Martins', policy: 'POL-2024-00421', type: 'Motor', status: 'Approved', urgency: 'Low', amount: 175000, filed: '2024-11-13', handler: 'Emeka N.', state: 'Ogun', description: 'Minor collision damage — windscreen and bumper' },
  { id: 'CLM-2024-00853', policyholder: 'Lara Adeleke', policy: 'POL-2024-00344', type: 'Property', status: 'Denied', urgency: 'Low', amount: 220000, filed: '2024-11-12', handler: 'Femi A.', state: 'Edo', description: 'Burglary claim — insufficient evidence provided' },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────
type AdminView = 'overview' | 'claims' | 'policyholders' | 'premiums' | 'products' | 'reports' | 'settings'

const navItems: { id: AdminView; label: string; icon: React.ReactNode; badge?: number; feature: FeatureKey }[] = [
  { id: 'overview', label: 'Overview', icon: <OverviewIcon />, feature: 'dashboard' },
  { id: 'claims', label: 'Claims', icon: <ClaimsIcon />, badge: 14, feature: 'claims' },
  { id: 'policyholders', label: 'Policyholders', icon: <PeopleIcon />, feature: 'customers' },
  { id: 'premiums', label: 'Premiums', icon: <PremiumIcon />, feature: 'policies' },
  { id: 'products', label: 'Products', icon: <ProductsIcon />, feature: 'products' },
  { id: 'reports', label: 'Reports', icon: <ReportIcon />, feature: 'reports' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, feature: 'settings' },
]

function OverviewIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg> }
function ClaimsIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M7 9h6M7 12h4"/></svg> }
function PeopleIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><circle cx="8" cy="7" r="3"/><path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5"/><circle cx="15" cy="8" r="2"/><path d="M17 17c0-2-1.3-3.5-3-4"/></svg> }
function PremiumIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M10 2L3 7v11h14V7L10 2z"/><path d="M10 12v3M10 8v2"/></svg> }
function ReportIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M4 2h8l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M12 2v4h4M7 10h6M7 13h4"/></svg> }
function ProductsIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M3 5l7-2 7 2v10l-7 2-7-2V5z"/><path d="M10 3v14M3 5l7 2 7-2"/></svg> }
function SettingsIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg> }
function BellIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}><path d="M10 2a6 6 0 00-6 6v3l-1 2h14l-1-2V8a6 6 0 00-6-6z"/><path d="M8.5 17a1.5 1.5 0 003 0"/></svg> }
function SearchIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}><circle cx="9" cy="9" r="6"/><path d="M14 14l3 3"/></svg> }
function ChevDownIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M5 8l5 5 5-5"/></svg> }
function FilterIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M3 5h14M6 10h8M9 15h2"/></svg> }
function ExportIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M10 3v10M6 9l4 4 4-4"/><path d="M4 17h12"/></svg> }
function TrendUpIcon() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M3 14l5-5 4 3 5-6"/><path d="M14 6h3v3"/></svg> }

// ── Status + Urgency badges ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: ClaimStatus }) {
  const map: Record<ClaimStatus, { bg: string; text: string; dot: string }> = {
    'Under Review': { bg: T.blueLight, text: T.blue, dot: T.blue },
    'Approved':     { bg: T.greenLight, text: T.green, dot: T.green },
    'Denied':       { bg: T.redLight, text: T.red, dot: T.red },
    'Pending Docs': { bg: T.amberLight, text: '#92400E', dot: T.amber },
    'Escalated':    { bg: '#FDF2F8', text: '#9D174D', dot: '#EC4899' },
  }
  const s = map[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: s.bg, fontFamily: T.mono, fontSize: 11, fontWeight: 500, color: s.text, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  )
}

function UrgencyBadge({ urgency }: { urgency: ClaimUrgency }) {
  const map: Record<ClaimUrgency, { bg: string; text: string }> = {
    'Critical': { bg: T.red, text: 'white' },
    'High':     { bg: '#FFF7ED', text: '#C2410C' },
    'Medium':   { bg: T.amberLight, text: '#92400E' },
    'Low':      { bg: '#F1F5F9', text: '#475569' },
  }
  const s = map[urgency]
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, background: s.bg, fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: s.text, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
      {urgency}
    </span>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
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

// ── Overview section ──────────────────────────────────────────────────────────
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
      {/* KPIs — live module values, same card layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard
          label="Active Customers"
          value={metrics.customers.active.toLocaleString()}
          sub={`${metrics.customers.total} total · ${metrics.customers.individuals} ind. / ${metrics.customers.corporate} corp.`}
          trend={`${metrics.customers.individuals} individuals · ${metrics.customers.corporate} corporate`}
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
          sub={`${metrics.policies.expired} expired · ${metrics.policies.cancelled} cancelled`}
          trend={`${metrics.policies.active} active`}
          trendDir={metrics.policies.pending > 0 ? 'down' : 'up'}
          accent={T.red}
        />
        <KpiCard
          label="Active Products"
          value={String(metrics.products.active)}
          sub={`${metrics.products.total} total · ${metrics.products.inactive} inactive`}
          trend={`${metrics.products.active} of ${metrics.products.total} active`}
          trendDir="up"
          accent={T.green}
        />
      </div>

      {/* Secondary KPIs — live policy / product / customer counts */}
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

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        {/* Premium trend */}
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>Monthly Premium Revenue</p>
              <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>₦ millions · from live policies</p>
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
              <Tooltip contentStyle={{ fontFamily: T.mono, fontSize: 11, background: T.text, border: 'none', borderRadius: 8, color: 'white' }} formatter={(v: number | string | ReadonlyArray<number | string> | undefined) => [`₦${v}M`, '']} />
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
          </div>
        </div>

        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '22px 24px' }}>
          <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>System Status</p>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Data source · in-memory</p>
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
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Latest 10 · by createdAt</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 280, overflowY: 'auto' }}>
            {recent.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                  <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>{item.module} · {item.subtitle}</p>
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

// ── Claims Management section ─────────────────────────────────────────────────
function ClaimsSection() {
  const [filterUrgency, setFilterUrgency] = useState<ClaimUrgency | 'All'>('All')
  const [filterType, setFilterType] = useState<ClaimType | 'All'>('All')
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | 'All'>('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [sortCol, setSortCol] = useState<'filed' | 'amount' | 'urgency'>('filed')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const urgencyOrder: Record<ClaimUrgency, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }

  const filtered = allClaims
    .filter(c => filterUrgency === 'All' || c.urgency === filterUrgency)
    .filter(c => filterType === 'All' || c.type === filterType)
    .filter(c => filterStatus === 'All' || c.status === filterStatus)
    .filter(c => !search || c.policyholder.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()) || c.policy.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortCol === 'amount') return (a.amount - b.amount) * dir
      if (sortCol === 'urgency') return (urgencyOrder[a.urgency] - urgencyOrder[b.urgency]) * dir
      return (a.filed < b.filed ? -1 : 1) * dir
    })

  const toggleSort = useCallback((col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }, [sortCol])

  const selectedClaim = allClaims.find(c => c.id === selected)

  const urgencies: (ClaimUrgency | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low']
  const types: (ClaimType | 'All')[] = ['All', 'Motor', 'Health', 'Property', 'Marine', 'Life']
  const statuses: (ClaimStatus | 'All')[] = ['All', 'Under Review', 'Pending Docs', 'Approved', 'Denied', 'Escalated']

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header + Stats */}
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: T.display, fontSize: 19, fontWeight: 800, color: T.text, letterSpacing: '-0.02em', marginBottom: 2 }}>Claims Queue</h2>
              <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{filtered.length} of {allClaims.length} claims · Last updated 2 min ago</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.canvas, fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.muted, cursor: 'pointer' }}>
                <ExportIcon /> Export CSV
              </button>
              <button style={{ padding: '8px 16px', borderRadius: 8, background: T.blue, color: 'white', fontFamily: T.display, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                + New Claim
              </button>
            </div>
          </div>

          {/* Urgency summary pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Critical', count: allClaims.filter(c => c.urgency === 'Critical').length, bg: T.redLight, text: T.red, border: T.redBorder },
              { label: 'High', count: allClaims.filter(c => c.urgency === 'High').length, bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
              { label: 'Pending Docs', count: allClaims.filter(c => c.status === 'Pending Docs').length, bg: T.amberLight, text: '#92400E', border: T.amberBorder },
              { label: 'Escalated', count: allClaims.filter(c => c.status === 'Escalated').length, bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8' },
              { label: 'Resolved Today', count: 8, bg: T.greenLight, text: T.green, border: T.greenBorder },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: s.text }}>{s.count}</span>
                <span style={{ fontFamily: T.body, fontSize: 12, color: s.text }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '1 1 220px', padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.canvas }}>
            <SearchIcon />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, claim ID, policy…"
              style={{ border: 'none', background: 'transparent', fontFamily: T.body, fontSize: 13, color: T.text, outline: 'none', width: '100%' }} />
          </div>

          {[
            { label: 'Urgency', options: urgencies, value: filterUrgency, set: setFilterUrgency as (v: string) => void },
            { label: 'Type', options: types, value: filterType, set: setFilterType as (v: string) => void },
            { label: 'Status', options: statuses, value: filterStatus, set: setFilterStatus as (v: string) => void },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{f.label}</span>
              <div style={{ position: 'relative' }}>
                <select value={f.value} onChange={e => f.set(e.target.value)}
                  style={{ padding: '7px 28px 7px 10px', borderRadius: 7, border: `1px solid ${T.border}`, fontFamily: T.body, fontSize: 12, color: T.text, background: T.canvas, cursor: 'pointer', appearance: 'none' }}>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.muted }}>
                  <ChevDownIcon />
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: T.muted }}>
            <FilterIcon />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{filtered.length} results</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          {/* Table head */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 110px 110px 120px 88px', padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: '#FAFAF8' }}>
            {[
              { label: 'Policyholder / ID' },
              { label: 'Type' },
              { label: 'Filed', sortKey: 'filed' as const },
              { label: 'Amount (₦)', sortKey: 'amount' as const },
              { label: 'Urgency', sortKey: 'urgency' as const },
              { label: 'Status' },
              { label: 'Handler' },
            ].map(col => (
              <button key={col.label} onClick={col.sortKey ? () => toggleSort(col.sortKey!) : undefined}
                style={{ textAlign: 'left', background: 'none', border: 'none', cursor: col.sortKey ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{col.label}</span>
                {col.sortKey && sortCol === col.sortKey && (
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.blue }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
          </div>

          {/* Table rows */}
          {filtered.map((claim, i) => (
            <div key={claim.id} onClick={() => setSelected(selected === claim.id ? null : claim.id)}
              style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 110px 110px 120px 88px', padding: '12px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none', background: selected === claim.id ? T.blueLight : 'transparent', cursor: 'pointer', transition: 'background 0.12s' }}>
              <div>
                <p style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{claim.policyholder}</p>
                <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{claim.id} · {claim.state}</p>
              </div>
              <span style={{ fontFamily: T.body, fontSize: 12, color: T.muted, alignSelf: 'center' }}>{claim.type}</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, alignSelf: 'center' }}>{claim.filed}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.text, alignSelf: 'center' }}>₦{(claim.amount / 1000000).toFixed(2)}M</span>
              <div style={{ alignSelf: 'center' }}><UrgencyBadge urgency={claim.urgency} /></div>
              <div style={{ alignSelf: 'center' }}><StatusBadge status={claim.status} /></div>
              <span style={{ fontFamily: T.body, fontSize: 12, color: T.muted, alignSelf: 'center' }}>{claim.handler}</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ fontFamily: T.body, fontSize: 14, color: T.muted }}>No claims match the current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Claim detail panel */}
      {selectedClaim && (
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden', position: 'sticky', top: 20 }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAF8' }}>
            <div>
              <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 2 }}>CLAIM DETAIL</p>
              <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.text }}>{selectedClaim.id}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${T.border}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 14, color: T.muted }}>×</button>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <UrgencyBadge urgency={selectedClaim.urgency} />
              <StatusBadge status={selectedClaim.status} />
            </div>

            {[
              { label: 'Policyholder', val: selectedClaim.policyholder },
              { label: 'Policy Ref.', val: selectedClaim.policy },
              { label: 'Claim Type', val: selectedClaim.type },
              { label: 'State', val: selectedClaim.state },
              { label: 'Date Filed', val: selectedClaim.filed },
              { label: 'Claim Amount', val: `₦${selectedClaim.amount.toLocaleString()}` },
              { label: 'Handler', val: selectedClaim.handler },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontFamily: T.body, fontSize: 13, fontWeight: 500, color: T.text, textAlign: 'right' }}>{row.val}</span>
              </div>
            ))}

            <div style={{ padding: '12px', background: T.canvas, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <p style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description</p>
              <p style={{ fontFamily: T.body, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{selectedClaim.description}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
              {selectedClaim.status !== 'Approved' && selectedClaim.status !== 'Denied' && (
                <button style={{ width: '100%', padding: '11px', borderRadius: 9, background: T.green, color: 'white', fontFamily: T.display, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Approve Claim
                </button>
              )}
              {selectedClaim.status !== 'Denied' && (
                <button style={{ width: '100%', padding: '11px', borderRadius: 9, background: T.redLight, color: T.red, fontFamily: T.display, fontSize: 13, fontWeight: 700, border: `1px solid ${T.redBorder}`, cursor: 'pointer' }}>
                  Deny Claim
                </button>
              )}
              <button style={{ width: '100%', padding: '11px', borderRadius: 9, background: T.canvas, color: T.muted, fontFamily: T.display, fontSize: 13, fontWeight: 600, border: `1px solid ${T.border}`, cursor: 'pointer' }}>
                Request More Docs
              </button>
              {selectedClaim.status !== 'Escalated' && (
                <button style={{ width: '100%', padding: '11px', borderRadius: 9, background: '#FDF2F8', color: '#9D174D', fontFamily: T.display, fontSize: 13, fontWeight: 600, border: '1px solid #FBCFE8', cursor: 'pointer' }}>
                  Escalate to Senior
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Placeholder sections ──────────────────────────────────────────────────────
function PlaceholderSection({ title }: { title: string }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: '60px', textAlign: 'center' }}>
      <p style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{title}</p>
      <p style={{ fontFamily: T.body, fontSize: 14, color: T.muted }}>This section is under construction.</p>
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
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
      {/* ── Sidebar ── */}
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

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: T.display, fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {navItems.find(n => n.id === activeView)?.label ?? 'Dashboard'}
            </p>
            <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 1 }}>Mon, 25 Nov 2024 · 14:37 WAT</p>
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
          {activeView === 'claims' && isEnabled('claims') && <ClaimsSection />}
          {activeView === 'policyholders' && isEnabled('customers') && <CustomerManagement />}
          {activeView === 'premiums' && isEnabled('policies') && <PolicyManagement />}
          {activeView === 'products' && isEnabled('products') && <ProductManagement />}
          {activeView === 'reports' && isEnabled('reports') && <PlaceholderSection title="Reports & Analytics" />}
          {activeView === 'settings' && <CompanySettings />}
        </main>
      </div>
    </div>
  )
}
