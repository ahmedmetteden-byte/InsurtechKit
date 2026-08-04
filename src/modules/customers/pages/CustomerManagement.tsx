/**
 * CustomerManagement — admin customer table with search, filters, and in-memory CRUD.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Card, CardBody, CardHeader, Row, Stack } from '../../../components/ui'
import { CustomerService } from '../services/CustomerService'
import { customerDisplayName, type Customer, type CustomerStatus, type CustomerType } from '../types/Customer'
import CustomerForm, {
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
  NIGERIAN_STATES,
  type CustomerFormValues,
} from '../components/CustomerForm'

type ModalMode = 'view' | 'edit' | 'create' | 'delete' | null

function StatusPill({ status }: { status: CustomerStatus }) {
  const map: Record<CustomerStatus, { bg: string; color: string; dot: string; label: string }> = {
    active: { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A', label: 'Active' },
    inactive: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Inactive' },
    pending: { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', label: 'Pending' },
    suspended: { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626', label: 'Suspended' },
  }
  const s = map[status] ?? map.inactive
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

function ViewDetails({ customer }: { customer: Customer }) {
  const rows: [string, string][] = [
    ['Customer Number', customer.customerNumber],
    ['Type', customer.customerType],
    ['Name', customerDisplayName(customer)],
    ...(customer.customerType === 'Individual'
      ? ([
          ['First Name', customer.firstName],
          ['Last Name', customer.lastName],
          ['Date of Birth', customer.dateOfBirth || '—'],
          ['Gender', customer.gender || '—'],
        ] as [string, string][])
      : ([['Company Name', customer.companyName]] as [string, string][])),
    ['Email', customer.email],
    ['Phone', customer.phone],
    ['ID Type', String(customer.identificationType)],
    ['ID Number', customer.identificationNumber || '—'],
    ['Address', customer.address || '—'],
    ['City', customer.city || '—'],
    ['State', customer.state || '—'],
    ['Country', customer.country || '—'],
    ['Occupation', customer.occupation || '—'],
    ['Status', customer.status],
    ['Notes', customer.notes || '—'],
    ['Created', new Date(customer.createdAt).toLocaleString()],
    ['Updated', new Date(customer.updatedAt).toLocaleString()],
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

export default function CustomerManagement() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | CustomerType>('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all')
  const [modal, setModal] = useState<ModalMode>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = () => setTick(t => t + 1)

  const customers = useMemo(() => {
    void tick
    return CustomerService.getAll()
  }, [tick])

  const selected = selectedId
    ? customers.find(c => c.id === selectedId) ?? CustomerService.getById(selectedId)
    : null

  const stateOptions = useMemo(() => {
    const fromData = [...new Set(customers.map(c => c.state).filter(Boolean))].sort()
    return fromData.length > 0 ? fromData : NIGERIAN_STATES
  }, [customers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter(c => {
      const name = customerDisplayName(c).toLowerCase()
      const matchesSearch =
        !q ||
        c.customerNumber.toLowerCase().includes(q) ||
        name.includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      const matchesType = typeFilter === 'all' || c.customerType === typeFilter
      const matchesState = stateFilter === 'all' || c.state === stateFilter
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesType && matchesState && matchesStatus
    })
  }, [customers, search, typeFilter, stateFilter, statusFilter])

  const open = (mode: ModalMode, id: string | null = null) => {
    setSelectedId(id)
    setModal(mode)
  }

  const close = () => {
    setModal(null)
    setSelectedId(null)
  }

  const handleCreate = (values: CustomerFormValues) => {
    CustomerService.create(values)
    refresh()
    close()
  }

  const handleUpdate = (values: CustomerFormValues) => {
    if (!selectedId) return
    CustomerService.update({ id: selectedId, ...values })
    refresh()
    close()
  }

  const handleDelete = () => {
    if (!selectedId) return
    CustomerService.delete(selectedId)
    refresh()
    close()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="Customer Register"
          subtitle={`${filtered.length} of ${customers.length} customers · in-memory`}
          action={
            <Button variant="primary" size="md" onClick={() => open('create')}>
              + New Customer
            </Button>
          }
        />
      </Card>

      <Card padding={16} radius={12} border="1px solid #E4E2DC" background="#FFFFFF">
        <Row gap={12} wrap align="center">
          <input
            style={inputStyle}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search number, name, company, email…"
          />
          <select
            style={selectStyle}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'all' | CustomerType)}
          >
            <option value="all">All types</option>
            {CUSTOMER_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select style={selectStyle} value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
            <option value="all">All states</option>
            {stateOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            style={selectStyle}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | CustomerStatus)}
          >
            <option value="all">All statuses</option>
            {CUSTOMER_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </Row>
      </Card>

      <Card padding={0} radius={14} border="1px solid #E4E2DC" background="#FFFFFF" gap={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #E4E2DC' }}>
                {['Customer Number', 'Customer Name', 'Type', 'Phone', 'Email', 'State', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E4E2DC' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{c.customerNumber}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{customerDisplayName(c)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{c.customerType}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{c.phone}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{c.email}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{c.state}</td>
                  <td style={{ padding: '14px 16px' }}><StatusPill status={c.status} /></td>
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
                    No customers match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal === 'view' && selected && (
        <ModalShell title={customerDisplayName(selected)} subtitle={selected.customerNumber} onClose={close}>
          <ViewDetails customer={selected} />
        </ModalShell>
      )}

      {modal === 'create' && (
        <ModalShell title="New Customer" subtitle="Create register entry" onClose={close} wide>
          <CustomerForm onSubmit={handleCreate} onCancel={close} submitLabel="Create Customer" />
        </ModalShell>
      )}

      {modal === 'edit' && selected && (
        <ModalShell title="Edit Customer" subtitle={selected.customerNumber} onClose={close} wide>
          <CustomerForm initial={selected} onSubmit={handleUpdate} onCancel={close} submitLabel="Update Customer" />
        </ModalShell>
      )}

      {modal === 'delete' && selected && (
        <ModalShell title="Delete Customer" subtitle="This cannot be undone in this session" onClose={close}>
          <CardBody>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
              Delete <strong>{customerDisplayName(selected)}</strong> ({selected.customerNumber}) from the in-memory register?
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
