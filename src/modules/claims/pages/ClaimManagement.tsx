/**
 * ClaimManagement — admin claims register with status dashboard, search, filters, CRUD.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Card, CardBody, CardHeader, Row, Stack } from '../../../components/ui'
import { ClaimService } from '../services/ClaimService'
import type { Claim, ClaimStatus } from '../types/Claim'
import { claimStatusLabel } from '../types/Claim'
import ClaimForm, { CLAIM_STATUSES, type ClaimFormValues } from '../components/ClaimForm'

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

function StatusPill({ status }: { status: ClaimStatus }) {
  const map: Record<ClaimStatus, { bg: string; color: string; dot: string }> = {
    open: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#1D4ED8' },
    under_review: { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' },
    approved: { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' },
    rejected: { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' },
    paid: { bg: '#F0FDF4', color: '#15803D', dot: '#15803D' },
  }
  const s = map[status] ?? map.open
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
      {claimStatusLabel(status)}
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

function ViewDetails({ claim }: { claim: Claim }) {
  const rows: [string, string][] = [
    ['Claim Number', claim.claimNumber],
    ['Policy Number', claim.policyNumber],
    ['Customer', claim.customerName],
    ['Product', claim.productName],
    ['Incident Date', formatDate(claim.incidentDate)],
    ['Reported Date', formatDate(claim.reportedDate)],
    ['Claim Amount', formatMoney(claim.claimAmount, claim.currency)],
    ['Approved Amount', formatMoney(claim.approvedAmount, claim.currency)],
    ['Status', claimStatusLabel(claim.status)],
    ['Assigned To', claim.assignedTo],
    ['Description', claim.description],
    ['Notes', claim.notes || '—'],
    ['Created', new Date(claim.createdAt).toLocaleString()],
    ['Updated', new Date(claim.updatedAt).toLocaleString()],
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
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{value}</p>
      {hint && <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#94A3B8' }}>{hint}</p>}
    </Card>
  )
}

export default function ClaimManagement() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all')
  const [productFilter, setProductFilter] = useState('all')
  const [modal, setModal] = useState<ModalMode>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = () => setTick(t => t + 1)

  const claims = useMemo(() => {
    void tick
    return ClaimService.getAll()
  }, [tick])

  const selected = selectedId
    ? claims.find(c => c.id === selectedId) ?? ClaimService.getById(selectedId)
    : null

  const productOptions = useMemo(
    () => [...new Set(claims.map(c => c.productName).filter(Boolean))].sort(),
    [claims],
  )

  const stats = useMemo(() => {
    const total = claims.length
    const open = claims.filter(c => c.status === 'open').length
    const underReview = claims.filter(c => c.status === 'under_review').length
    const approved = claims.filter(c => c.status === 'approved').length
    const rejected = claims.filter(c => c.status === 'rejected').length
    const paid = claims.filter(c => c.status === 'paid').length
    const totalClaimed = claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0)
    const totalApproved = claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0)
    return { total, open, underReview, approved, rejected, paid, totalClaimed, totalApproved }
  }, [claims])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return claims.filter(c => {
      const matchesSearch =
        !q ||
        c.claimNumber.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.policyNumber.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesProduct = productFilter === 'all' || c.productName === productFilter
      return matchesSearch && matchesStatus && matchesProduct
    })
  }, [claims, search, statusFilter, productFilter])

  const open = (mode: ModalMode, id: string | null = null) => {
    setSelectedId(id)
    setModal(mode)
  }

  const close = () => {
    setModal(null)
    setSelectedId(null)
  }

  const handleCreate = (values: ClaimFormValues) => {
    ClaimService.create(values)
    refresh()
    close()
  }

  const handleUpdate = (values: ClaimFormValues) => {
    if (!selectedId) return
    ClaimService.update({ id: selectedId, ...values })
    refresh()
    close()
  }

  const handleDelete = () => {
    if (!selectedId) return
    ClaimService.delete(selectedId)
    refresh()
    close()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="Claims Register"
          subtitle={`${filtered.length} of ${claims.length} claims · in-memory`}
          action={
            <Button variant="primary" size="md" onClick={() => open('create')}>
              + New Claim
            </Button>
          }
        />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <StatCard label="Total Claims" value={String(stats.total)} />
        <StatCard label="Open" value={String(stats.open)} />
        <StatCard label="Under Review" value={String(stats.underReview)} />
        <StatCard label="Approved" value={String(stats.approved)} />
        <StatCard label="Rejected" value={String(stats.rejected)} />
        <StatCard label="Paid" value={String(stats.paid)} />
        <StatCard label="Total Claimed" value={formatMoney(stats.totalClaimed)} />
        <StatCard label="Total Approved" value={formatMoney(stats.totalApproved)} />
      </div>

      <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF">
        <Row gap={12} wrap align="center">
          <input
            style={inputStyle}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search claim, customer, policy…"
          />
          <select
            style={selectStyle}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | ClaimStatus)}
          >
            <option value="all">All statuses</option>
            {CLAIM_STATUSES.map(s => (
              <option key={s} value={s}>{claimStatusLabel(s)}</option>
            ))}
          </select>
          <select style={selectStyle} value={productFilter} onChange={e => setProductFilter(e.target.value)}>
            <option value="all">All products</option>
            {productOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Row>
      </Card>

      <Card padding={0} radius={14} border="1px solid #E4E2DC" background="#FFFFFF" gap={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #E4E2DC' }}>
                {['Claim Number', 'Policy Number', 'Customer', 'Product', 'Claim Amount', 'Status', 'Reported Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E4E2DC' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{c.claimNumber}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{c.policyNumber}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{c.customerName}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{c.productName}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{formatMoney(c.claimAmount, c.currency)}</td>
                  <td style={{ padding: '14px 16px' }}><StatusPill status={c.status} /></td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{formatDate(c.reportedDate)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Row gap={6} wrap={false}>
                      <Button variant="ghost" size="sm" onClick={() => open('view', c.id)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => open('edit', c.id)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => open('delete', c.id)}>Delete</Button>
                    </Row>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B' }}>
                    No claims match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal === 'view' && selected && (
        <ModalShell title={selected.claimNumber} subtitle={selected.customerName} onClose={close}>
          <ViewDetails claim={selected} />
        </ModalShell>
      )}

      {modal === 'create' && (
        <ModalShell title="New Claim" subtitle="Create register entry" onClose={close} wide>
          <ClaimForm onSubmit={handleCreate} onCancel={close} submitLabel="Create Claim" />
        </ModalShell>
      )}

      {modal === 'edit' && selected && (
        <ModalShell title="Edit Claim" subtitle={selected.claimNumber} onClose={close} wide>
          <ClaimForm initial={selected} onSubmit={handleUpdate} onCancel={close} submitLabel="Update Claim" />
        </ModalShell>
      )}

      {modal === 'delete' && selected && (
        <ModalShell title="Delete Claim" subtitle="This cannot be undone in this session" onClose={close}>
          <CardBody>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
              Delete <strong>{selected.claimNumber}</strong> ({selected.customerName} · {selected.policyNumber}) from the in-memory register?
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
