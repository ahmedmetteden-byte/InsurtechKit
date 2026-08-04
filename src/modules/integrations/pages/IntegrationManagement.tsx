/**
 * IntegrationManagement — admin framework register with search, filters, CRUD, and simulated test.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Card, CardBody, CardHeader, Row, Stack } from '../../../components/ui'
import { IntegrationService } from '../../../data/services'
import type { Integration, IntegrationStatus, IntegrationType } from '../types/Integration'
import {
  INTEGRATION_STATUSES,
  INTEGRATION_TYPES,
  integrationStatusLabel,
} from '../types/Integration'
import IntegrationForm, { type IntegrationFormValues } from '../components/IntegrationForm'

type ModalMode = 'view' | 'edit' | 'create' | 'delete' | null

function formatDateTime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function StatusPill({ status }: { status: IntegrationStatus }) {
  const map: Record<IntegrationStatus, { bg: string; color: string; dot: string }> = {
    connected: { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' },
    configured: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#1D4ED8' },
    pending: { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' },
    disabled: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
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
      {integrationStatusLabel(status)}
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
        style={{ width: '100%', maxWidth: wide ? 760 : 560, maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', boxShadow: '0 24px 60px rgba(15,23,42,0.2)' }}
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

function maskSecret(value: string) {
  if (!value) return '—'
  if (value.length <= 4) return '••••'
  return `${value.slice(0, 4)}••••••••`
}

function ViewDetails({
  row,
  onTest,
  testMessage,
}: {
  row: Integration
  onTest: () => void
  testMessage: string | null
}) {
  const rows: [string, string][] = [
    ['Name', row.name],
    ['Provider', row.provider],
    ['Type', row.type],
    ['Status', integrationStatusLabel(row.status)],
    ['Enabled', row.enabled ? 'Yes' : 'No'],
    ['Endpoint', row.baseUrl || '—'],
    ['API Key', maskSecret(row.apiKey)],
    ['API Secret', maskSecret(row.apiSecret)],
    ['Username', row.username || '—'],
    ['Password', row.password ? '••••••••' : '—'],
    ['Webhook URL', row.webhookUrl || '—'],
    ['Timeout', `${row.timeout} ms`],
    ['Last Health Check', formatDateTime(row.lastHealthCheck)],
    ['Notes', row.notes || '—'],
    ['Created', new Date(row.createdAt).toLocaleString()],
    ['Updated', new Date(row.updatedAt).toLocaleString()],
  ]

  return (
    <Stack gap={16}>
      <Stack gap={10}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', textAlign: 'right', fontWeight: 500, wordBreak: 'break-all' }}>{value}</span>
          </div>
        ))}
      </Stack>

      <div style={{ paddingTop: 4, borderTop: '1px solid #E4E2DC' }}>
        <Button variant="primary" size="md" onClick={onTest}>Test Connection</Button>
        {testMessage && (
          <p style={{
            marginTop: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: testMessage.startsWith('Connection successful') ? '#166534' : '#92400E',
            background: testMessage.startsWith('Connection successful') ? '#F0FDF4' : '#FFFBEB',
            border: `1px solid ${testMessage.startsWith('Connection successful') ? '#BBF7D0' : '#FDE68A'}`,
            borderRadius: 8,
            padding: '8px 12px',
          }}>
            {testMessage}
          </p>
        )}
      </div>
    </Stack>
  )
}

export default function IntegrationManagement() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | IntegrationType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | IntegrationStatus>('all')
  const [modal, setModal] = useState<ModalMode>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [testMessage, setTestMessage] = useState<string | null>(null)

  const refresh = () => setTick(t => t + 1)

  const rows = useMemo(() => {
    void tick
    return IntegrationService.getAll()
  }, [tick])

  const selected = selectedId
    ? rows.find(r => r.id === selectedId) ?? IntegrationService.getById(selectedId)
    : null

  const stats = useMemo(() => ({
    configured: rows.filter(r => r.status === 'configured').length,
    connected: rows.filter(r => r.status === 'connected').length,
    pending: rows.filter(r => r.status === 'pending').length,
    disabled: rows.filter(r => r.status === 'disabled').length,
  }), [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(r => {
      const matchesSearch =
        !q ||
        r.provider.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q)
      const matchesType = typeFilter === 'all' || r.type === typeFilter
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [rows, search, typeFilter, statusFilter])

  const open = (mode: ModalMode, id: string | null = null) => {
    setSelectedId(id)
    setTestMessage(null)
    setModal(mode)
  }

  const close = () => {
    setModal(null)
    setSelectedId(null)
    setTestMessage(null)
  }

  const handleCreate = async (values: IntegrationFormValues) => {
    await Promise.resolve(IntegrationService.create(values))
    refresh()
    close()
  }

  const handleUpdate = async (values: IntegrationFormValues) => {
    if (!selectedId) return
    await Promise.resolve(IntegrationService.update({ id: selectedId, ...values }))
    refresh()
    close()
  }

  const handleDelete = async () => {
    if (!selectedId) return
    await Promise.resolve(IntegrationService.delete(selectedId))
    refresh()
    close()
  }

  const handleTest = async () => {
    if (!selectedId) return
    const result = await Promise.resolve(IntegrationService.testConnection(selectedId))
    setTestMessage(result.message)
    refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="Integration Framework"
          subtitle={`${filtered.length} of ${rows.length} integrations · in-memory config only`}
          action={
            <Button variant="primary" size="md" onClick={() => open('create')}>
              + New Integration
            </Button>
          }
        />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Configured', val: String(stats.configured) },
          { label: 'Connected', val: String(stats.connected) },
          { label: 'Pending', val: String(stats.pending) },
          { label: 'Disabled', val: String(stats.disabled) },
        ].map(s => (
          <div key={s.label} style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E4E2DC', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B' }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{s.val}</p>
          </div>
        ))}
      </div>

      <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF">
        <Row gap={12} wrap align="center">
          <input
            style={inputStyle}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search provider or type…"
          />
          <select
            style={selectStyle}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'all' | IntegrationType)}
          >
            <option value="all">All types</option>
            {INTEGRATION_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            style={selectStyle}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | IntegrationStatus)}
          >
            <option value="all">All statuses</option>
            {INTEGRATION_STATUSES.map(s => (
              <option key={s} value={s}>{integrationStatusLabel(s)}</option>
            ))}
          </select>
        </Row>
      </Card>

      <Card padding={0} radius={14} border="1px solid #E4E2DC" background="#FFFFFF" gap={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #E4E2DC' }}>
                {['Provider', 'Type', 'Status', 'Endpoint', 'Last Health Check', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E4E2DC' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{r.provider}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{r.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{r.type}</td>
                  <td style={{ padding: '14px 16px' }}><StatusPill status={r.status} /></td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#475569', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.baseUrl || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#475569' }}>{formatDateTime(r.lastHealthCheck)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Row gap={6} wrap={false}>
                      <Button variant="ghost" size="sm" onClick={() => open('view', r.id)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => open('edit', r.id)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => open('delete', r.id)}>Delete</Button>
                    </Row>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B' }}>
                    No integrations match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal === 'view' && selected && (
        <ModalShell title={selected.name} subtitle={selected.provider} onClose={close} wide>
          <ViewDetails row={selected} onTest={handleTest} testMessage={testMessage} />
        </ModalShell>
      )}

      {modal === 'create' && (
        <ModalShell title="New Integration" subtitle="Framework configuration only" onClose={close} wide>
          <IntegrationForm onSubmit={handleCreate} onCancel={close} submitLabel="Create Integration" />
        </ModalShell>
      )}

      {modal === 'edit' && selected && (
        <ModalShell title="Edit Integration" subtitle={selected.provider} onClose={close} wide>
          <IntegrationForm initial={selected} onSubmit={handleUpdate} onCancel={close} submitLabel="Update Integration" />
        </ModalShell>
      )}

      {modal === 'delete' && selected && (
        <ModalShell title="Delete Integration" subtitle="This cannot be undone in this session" onClose={close}>
          <CardBody>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
              Delete <strong>{selected.name}</strong> ({selected.provider}) from the in-memory framework?
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
