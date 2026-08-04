/**
 * UserManagement — admin identity register with search, filters, and in-memory CRUD.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Card, CardBody, CardHeader, Row, Stack } from '../../../components/ui'
import { UserService } from '../../../data/services'
import type { User, UserStatus } from '../types/User'
import { userDisplayName } from '../types/User'
import UserForm, { DEPARTMENTS, USER_STATUSES, type UserFormValues } from '../components/UserForm'

type ModalMode = 'view' | 'edit' | 'create' | 'delete' | null

function formatDateTime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function StatusPill({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { bg: string; color: string; dot: string; label: string }> = {
    active: { bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A', label: 'Active' },
    inactive: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8', label: 'Inactive' },
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

function ViewDetails({ user }: { user: User }) {
  const role = UserService.getRoleById(user.roleId)
  const rows: [string, string][] = [
    ['Employee ID', user.employeeId],
    ['Name', userDisplayName(user)],
    ['Email', user.email],
    ['Phone', user.phone || '—'],
    ['Department', user.department],
    ['Role', user.roleName],
    ['Branch', user.branch],
    ['Status', user.status],
    ['Last Login', formatDateTime(user.lastLogin)],
    ['Created', new Date(user.createdAt).toLocaleString()],
    ['Updated', new Date(user.updatedAt).toLocaleString()],
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

      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Role permissions ({role?.permissions.length ?? 0})
        </p>
        {role?.description && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 1.5 }}>
            {role.description}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(role?.permissions ?? []).map(p => (
            <span
              key={p}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                background: '#FAFAF8',
                border: '1px solid #E4E2DC',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#475569',
              }}
            >
              {p}
            </span>
          ))}
          {!role && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B' }}>No role assigned.</span>
          )}
        </div>
      </div>
    </Stack>
  )
}

export default function UserManagement() {
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [modal, setModal] = useState<ModalMode>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const refresh = () => setTick(t => t + 1)

  const users = useMemo(() => {
    void tick
    return UserService.getAll()
  }, [tick])

  const roles = useMemo(() => UserService.getRoles(), [])

  const selected = selectedId
    ? users.find(u => u.id === selectedId) ?? UserService.getById(selectedId)
    : null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      const name = userDisplayName(u).toLowerCase()
      const matchesSearch =
        !q ||
        u.employeeId.toLowerCase().includes(q) ||
        name.includes(q) ||
        u.email.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'all' || u.roleId === roleFilter
      const matchesDept = departmentFilter === 'all' || u.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter
      return matchesSearch && matchesRole && matchesDept && matchesStatus
    })
  }, [users, search, roleFilter, departmentFilter, statusFilter])

  const open = (mode: ModalMode, id: string | null = null) => {
    setSelectedId(id)
    setModal(mode)
  }

  const close = () => {
    setModal(null)
    setSelectedId(null)
  }

  const handleCreate = async (values: UserFormValues) => {
    await Promise.resolve(UserService.create(values))
    refresh()
    close()
  }

  const handleUpdate = async (values: UserFormValues) => {
    if (!selectedId) return
    await Promise.resolve(UserService.update({ id: selectedId, ...values }))
    refresh()
    close()
  }

  const handleDelete = async () => {
    if (!selectedId) return
    await Promise.resolve(UserService.delete(selectedId))
    refresh()
    close()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding={22} radius={14} border="1px solid #E4E2DC" background="#FFFFFF">
        <CardHeader
          title="User Register"
          subtitle={`${filtered.length} of ${users.length} users · in-memory identity`}
          action={
            <Button variant="primary" size="md" onClick={() => open('create')}>
              + New User
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
            placeholder="Search employee ID, name, email…"
          />
          <select style={selectStyle} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select style={selectStyle} value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="all">All departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            style={selectStyle}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | UserStatus)}
          >
            <option value="all">All statuses</option>
            {USER_STATUSES.map(s => (
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
                {['Employee ID', 'Name', 'Department', 'Role', 'Branch', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #E4E2DC' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#475569' }}>{u.employeeId}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{userDisplayName(u)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{u.department}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{u.roleName}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>{u.branch}</td>
                  <td style={{ padding: '14px 16px' }}><StatusPill status={u.status} /></td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#475569' }}>{formatDateTime(u.lastLogin)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Row gap={6} wrap={false}>
                      <Button variant="ghost" size="sm" onClick={() => open('view', u.id)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => open('edit', u.id)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => open('delete', u.id)}>Delete</Button>
                    </Row>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B' }}>
                    No users match the current search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modal === 'view' && selected && (
        <ModalShell title={userDisplayName(selected)} subtitle={selected.employeeId} onClose={close} wide>
          <ViewDetails user={selected} />
        </ModalShell>
      )}

      {modal === 'create' && (
        <ModalShell title="New User" subtitle="Create identity entry" onClose={close} wide>
          <UserForm onSubmit={handleCreate} onCancel={close} submitLabel="Create User" />
        </ModalShell>
      )}

      {modal === 'edit' && selected && (
        <ModalShell title="Edit User" subtitle={selected.employeeId} onClose={close} wide>
          <UserForm initial={selected} onSubmit={handleUpdate} onCancel={close} submitLabel="Update User" />
        </ModalShell>
      )}

      {modal === 'delete' && selected && (
        <ModalShell title="Delete User" subtitle="This cannot be undone in this session" onClose={close}>
          <CardBody>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
              Delete <strong>{userDisplayName(selected)}</strong> ({selected.employeeId}) from the in-memory register?
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
