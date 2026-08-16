/**
 * OnboardingQueue — Operations Inbox: staff review of public onboarding applications.
 */
import { useMemo, useState, type CSSProperties } from 'react'
import { Button, Card, CardBody, CardHeader, Row, Stack } from '../../../components/ui'
import { OnboardingService } from '../../../data/services'
import { ONBOARDING_STATUSES, onboardingStatusLabel, type OnboardingApplication, type OnboardingStatus } from '../types/OnboardingApplication'

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusPill({ status }: { status: OnboardingStatus }) {
  const map: Record<OnboardingStatus, { bg: string; color: string; dot: string }> = {
    submitted: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#1D4ED8' },
    in_review: { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' },
    info_required: { bg: '#FEF2F2', color: '#B91C1C', dot: '#DC2626' },
    approved: { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' },
    declined: { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' },
  }
  const s = map[status] ?? map.submitted
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: s.bg, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: s.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {onboardingStatusLabel(status)}
    </span>
  )
}

const selectStyle: CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid #E4E2DC', background: '#FAFAF8',
  fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', cursor: 'pointer',
}

const inputStyle: CSSProperties = { ...selectStyle, minWidth: 240, cursor: 'text' }

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', boxShadow: '0 24px 60px rgba(15,23,42,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E4E2DC', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{title}</p>
            {subtitle && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748B', marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E4E2DC', background: 'white', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#64748B' }}>×</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF" gap={6}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{value}</p>
    </Card>
  )
}

function ReviewPanel({ application, onSave, onClose }: { application: OnboardingApplication; onSave: (status: OnboardingStatus, notes: string) => void; onClose: () => void }) {
  const [status, setStatus] = useState<OnboardingStatus>(application.status)
  const [notes, setNotes] = useState(application.reviewNotes)

  const rows: [string, string][] = [
    ['Reference', application.reference],
    ['Product', application.productName],
    ['Applicant', `${application.applicantFirstName} ${application.applicantLastName}`],
    ['Email', application.applicantEmail],
    ['Phone', application.applicantPhone || '—'],
    ['Message', application.message || '—'],
    ['Consent Given', application.consent ? `Yes · ${new Date(application.consentAt).toLocaleString()}` : 'No'],
    ['Submitted', new Date(application.createdAt).toLocaleString()],
  ]

  return (
    <Stack gap={16}>
      <Stack gap={10}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', textAlign: 'right', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </Stack>

      {application.customerId && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#16A34A', fontSize: 14 }}>✓</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#15803D' }}>
            Converted to customer record <span style={{ fontFamily: 'var(--font-mono)' }}>{application.customerId}</span> — visible in the Customers module.
          </span>
        </div>
      )}

      <div>
        <label style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 6, display: 'block' }}>Status</label>
        <select style={{ ...selectStyle, width: '100%' }} value={status} onChange={e => setStatus(e.target.value as OnboardingStatus)}>
          {ONBOARDING_STATUSES.map(s => (
            <option key={s} value={s}>{onboardingStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#0F172A', marginBottom: 6, display: 'block' }}>Internal review notes</label>
        <textarea style={{ width: '100%', minHeight: 90, padding: '10px 12px', borderRadius: 8, border: '1px solid #E4E2DC', background: '#FAFAF8', fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', resize: 'vertical', boxSizing: 'border-box' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes visible to staff only…" />
      </div>

      <Row gap={10}>
        <Button variant="primary" size="md" onClick={() => onSave(status, notes)}>Save Review</Button>
        <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
      </Row>
    </Stack>
  )
}

export default function OnboardingQueue() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OnboardingStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = () => setTick(t => t + 1)

  const applications = useMemo(() => {
    void tick
    return OnboardingService.getAll()
  }, [tick])

  const selected = selectedId ? applications.find(a => a.id === selectedId) ?? null : null

  const stats = useMemo(() => {
    const total = applications.length
    const submitted = applications.filter(a => a.status === 'submitted').length
    const inReview = applications.filter(a => a.status === 'in_review').length
    const infoRequired = applications.filter(a => a.status === 'info_required').length
    const approved = applications.filter(a => a.status === 'approved').length
    const declined = applications.filter(a => a.status === 'declined').length
    return { total, submitted, inReview, infoRequired, approved, declined }
  }, [applications])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applications.filter(a => {
      const matchesSearch =
        !q ||
        a.reference.toLowerCase().includes(q) ||
        `${a.applicantFirstName} ${a.applicantLastName}`.toLowerCase().includes(q) ||
        a.applicantEmail.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  const handleSave = async (status: OnboardingStatus, reviewNotes: string) => {
    if (!selectedId) return
    await Promise.resolve(OnboardingService.update({ id: selectedId, status, reviewNotes }))
    refresh()
    setSelectedId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="Onboarding · Operations Inbox"
          subtitle={`${filtered.length} of ${applications.length} applications`}
        />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12 }}>
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Submitted" value={String(stats.submitted)} />
        <StatCard label="In Review" value={String(stats.inReview)} />
        <StatCard label="Info Required" value={String(stats.infoRequired)} />
        <StatCard label="Approved" value={String(stats.approved)} />
        <StatCard label="Declined" value={String(stats.declined)} />
      </div>

      <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF">
        <Row gap={12} wrap align="center">
          <input style={inputStyle} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reference, applicant, email…" />
          <select style={selectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | OnboardingStatus)}>
            <option value="all">All statuses</option>
            {ONBOARDING_STATUSES.map(s => (
              <option key={s} value={s}>{onboardingStatusLabel(s)}</option>
            ))}
          </select>
        </Row>
      </Card>

      <Card padding={0} radius={14} border="1px solid #E4E2DC" background="#FFFFFF" gap={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #E4E2DC' }}>
                {['Reference', 'Applicant', 'Product', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E4E2DC' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{a.reference}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{a.applicantFirstName} {a.applicantLastName}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{a.productName}</td>
                  <td style={{ padding: '14px 16px' }}><StatusPill status={a.status} /></td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{formatDate(a.createdAt)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedId(a.id)}>Review</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B' }}>
                    No applications match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <ModalShell title={selected.reference} subtitle={`${selected.applicantFirstName} ${selected.applicantLastName}`} onClose={() => setSelectedId(null)}>
          <CardBody>
            <ReviewPanel application={selected} onSave={handleSave} onClose={() => setSelectedId(null)} />
          </CardBody>
        </ModalShell>
      )}
    </div>
  )
}
