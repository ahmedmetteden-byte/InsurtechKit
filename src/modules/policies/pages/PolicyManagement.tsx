/**
 * PolicyManagement — admin policy register with status dashboard, search, filters, CRUD.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Card, CardBody, CardHeader, Row, Stack } from '../../../components/ui'
import { ProductService, PolicyService } from '../../../data/services'
import type { Policy, PolicyStatus } from '../types/Policy'
import PolicyForm, { POLICY_STATUSES, type PolicyFormValues } from '../components/PolicyForm'

type ModalMode = 'view' | 'edit' | 'create' | 'delete' | null

function formatMoney(amount: number, currency = 'NGN') {
  return `${currency} ${amount.toLocaleString()}`
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusPill({ status }: { status: PolicyStatus }) {
  const map: Record<PolicyStatus, { bg: string; color: string; dot: string; label: string }> = {
    active: { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A', label: 'Active' },
    pending: { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', label: 'Pending' },
    expired: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Expired' },
    cancelled: { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626', label: 'Cancelled' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 20,
      background: s.bg,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 500,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

const selectStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #E4E2DC',
  background: '#FAFAF8',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#0F172A',
  cursor: 'pointer',
}

const inputStyle: CSSProperties = {
  ...selectStyle,
  minWidth: 240,
  cursor: 'text',
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: wide ? 760 : 520, maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', boxShadow: '0 24px 60px rgba(15,23,42,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E4E2DC', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{title}</p>
            {subtitle && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748B', marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E4E2DC', background: 'white', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#64748B' }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}

function ViewDetails({ policy }: { policy: Policy }) {
  const rows: [string, string][] = [
    ['Policy Number', policy.policyNumber],
    ['Customer', policy.customerName],
    ['Product', policy.productName],
    ['Policy Type', policy.policyType],
    ['Effective Date', formatDate(policy.effectiveDate)],
    ['Expiry Date', formatDate(policy.expiryDate)],
    ['Premium', formatMoney(policy.premium, policy.currency)],
    ['Sum Insured', formatMoney(policy.sumInsured, policy.currency)],
    ['Currency', policy.currency],
    ['Status', policy.status],
    ['Agent', policy.agent],
    ['Branch', policy.branch],
    ['Created', new Date(policy.createdAt).toLocaleString()],
    ['Updated', new Date(policy.updatedAt).toLocaleString()],
  ]

  return (
    <Stack gap={10}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', textAlign: 'right', fontWeight: 500 }}>{value}</span>
        </div>
      ))}
    </Stack>
  )
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF" gap={6}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{value}</p>
      {hint && <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#94A3B8' }}>{hint}</p>}
    </Card>
  )
}

export default function PolicyManagement() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PolicyStatus>('all')
  const [productFilter, setProductFilter] = useState('all')
  const [modal, setModal] = useState<ModalMode>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = () => setTick(t => t + 1)

  const policies = useMemo(() => {
    void tick
    return PolicyService.getAll()
  }, [tick])

  const products = useMemo(() => ProductService.getAll(), [])

  const selected = selectedId
    ? policies.find(p => p.id === selectedId) ?? PolicyService.getById(selectedId)
    : null

  const stats = useMemo(() => {
    const total = policies.length
    const active = policies.filter(p => p.status === 'active').length
    const pending = policies.filter(p => p.status === 'pending').length
    const expired = policies.filter(p => p.status === 'expired').length
    const cancelled = policies.filter(p => p.status === 'cancelled').length
    const totalPremium = policies.reduce((sum, p) => sum + (p.premium || 0), 0)
    return { total, active, pending, expired, cancelled, totalPremium }
  }, [policies])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return policies.filter(p => {
      const matchesSearch =
        !q ||
        p.policyNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const matchesProduct = productFilter === 'all' || p.productId === productFilter
      return matchesSearch && matchesStatus && matchesProduct
    })
  }, [policies, search, statusFilter, productFilter])

  const open = (mode: ModalMode, id: string | null = null) => {
    setSelectedId(id)
    setModal(mode)
  }

  const close = () => {
    setModal(null)
    setSelectedId(null)
  }

  const handleCreate = async (values: PolicyFormValues) => {
    await Promise.resolve(PolicyService.create(values))
    refresh()
    close()
  }

  const handleUpdate = async (values: PolicyFormValues) => {
    if (!selectedId) return
    await Promise.resolve(PolicyService.update({ id: selectedId, ...values }))
    refresh()
    close()
  }

  const handleDelete = async () => {
    if (!selectedId) return
    await Promise.resolve(PolicyService.delete(selectedId))
    refresh()
    close()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="Policy Register"
          subtitle={`${filtered.length} of ${policies.length} policies · in-memory`}
          action={
            <Button variant="primary" size="md" onClick={() => open('create')}>
              + New Policy
            </Button>
          }
        />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12 }}>
        <StatCard label="Total Policies" value={String(stats.total)} />
        <StatCard label="Active" value={String(stats.active)} />
        <StatCard label="Pending" value={String(stats.pending)} />
        <StatCard label="Expired" value={String(stats.expired)} />
        <StatCard label="Cancelled" value={String(stats.cancelled)} />
        <StatCard label="Total Premium" value={formatMoney(stats.totalPremium)} hint="All statuses" />
      </div>

      <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF">
        <Row gap={12} wrap align="center">
          <input
            style={inputStyle}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search policy, customer, product…"
          />
          <select
            style={selectStyle}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | PolicyStatus)}
          >
            <option value="all">All statuses</option>
            {POLICY_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select style={selectStyle} value={productFilter} onChange={e => setProductFilter(e.target.value)}>
            <option value="all">All products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Row>
      </Card>

      <Card padding={0} radius={14} border="1px solid #E4E2DC" background="#FFFFFF" gap={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #E4E2DC' }}>
                {['Policy Number', 'Customer', 'Product', 'Premium', 'Expiry', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E4E2DC' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{p.policyNumber}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{p.customerName}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{p.productName}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{formatMoney(p.premium, p.currency)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{formatDate(p.expiryDate)}</td>
                  <td style={{ padding: '14px 16px' }}><StatusPill status={p.status} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    <Row gap={6} wrap={false}>
                      <Button variant="ghost" size="sm" onClick={() => open('view', p.id)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => open('edit', p.id)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => open('delete', p.id)}>Delete</Button>
                    </Row>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B' }}>
                    No policies match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal === 'view' && selected && (
        <ModalShell title={selected.policyNumber} subtitle={selected.customerName} onClose={close}>
          <ViewDetails policy={selected} />
        </ModalShell>
      )}

      {modal === 'create' && (
        <ModalShell title="New Policy" subtitle="Create register entry" onClose={close} wide>
          <PolicyForm onSubmit={handleCreate} onCancel={close} submitLabel="Create Policy" />
        </ModalShell>
      )}

      {modal === 'edit' && selected && (
        <ModalShell title="Edit Policy" subtitle={selected.policyNumber} onClose={close} wide>
          <PolicyForm initial={selected} onSubmit={handleUpdate} onCancel={close} submitLabel="Update Policy" />
        </ModalShell>
      )}

      {modal === 'delete' && selected && (
        <ModalShell title="Delete Policy" subtitle="This cannot be undone in this session" onClose={close}>
          <CardBody>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
              Delete <strong>{selected.policyNumber}</strong> ({selected.customerName} · {selected.productName}) from the in-memory register?
            </p>
            <Row gap={10}>
              <Button variant="danger" size="md" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="md" onClick={close}>Cancel</Button>
            </Row>
          </CardBody>
        </ModalShell>
      )}
    </div>
  )
}
