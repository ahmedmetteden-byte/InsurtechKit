/**
 * UserForm — create / edit user fields (in-memory).
 * Assigns an existing role; role editor is out of scope for this phase.
 */
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Button, Stack } from '../../../components/ui'
import { UserService } from '../../../data/services'
import type { CreateUserInput, User, UserStatus } from '../types/User'

export const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended']
export const DEPARTMENTS = [
  'Claims', 'Customer Service', 'Underwriting', 'Operations', 'Finance',
  'Branch Management', 'Sales', 'IT', 'Compliance',
]
export const BRANCHES = [
  'Lagos Island', 'Ikeja', 'Lekki', 'Abuja Central', 'Ibadan',
  'Port Harcourt', 'Kano', 'Kaduna', 'Enugu', 'Warri',
]

export type UserFormValues = CreateUserInput

const emptyForm: UserFormValues = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: DEPARTMENTS[0],
  roleId: '',
  roleName: '',
  branch: BRANCHES[0],
  status: 'active',
  lastLogin: '',
}

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #E4E2DC',
  background: '#FAFAF8',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#0F172A',
  outline: 'none',
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
  display: 'block',
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function nextEmployeeId(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `EMP-${n}`
}

function toForm(user?: User | null): UserFormValues {
  if (!user) {
    const roles = UserService.getRoles()
    const first = roles[0]
    return {
      ...emptyForm,
      employeeId: nextEmployeeId(),
      roleId: first?.id ?? '',
      roleName: first?.name ?? '',
    }
  }
  return {
    employeeId: user.employeeId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    department: user.department,
    roleId: user.roleId,
    roleName: user.roleName,
    branch: user.branch,
    status: user.status,
    lastLogin: user.lastLogin,
  }
}

type UserFormProps = {
  initial?: User | null
  submitLabel?: string
  onSubmit: (values: UserFormValues) => void
  onCancel: () => void
}

export default function UserForm({ initial, submitLabel = 'Save User', onSubmit, onCancel }: UserFormProps) {
  const roles = useMemo(() => UserService.getRoles(), [])
  const [form, setForm] = useState<UserFormValues>(() => toForm(initial))

  useEffect(() => {
    setForm(toForm(initial))
  }, [initial])

  const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'roleId') {
        const role = roles.find(r => r.id === value)
        next.roleName = role?.name ?? ''
      }
      return next
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.employeeId.trim() || !form.firstName.trim() || !form.lastName.trim()) return
    if (!form.email.trim() || !form.roleId) return

    const role = roles.find(r => r.id === form.roleId)
    onSubmit({
      ...form,
      employeeId: form.employeeId.trim().toUpperCase(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      branch: form.branch.trim(),
      roleName: role?.name ?? form.roleName,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Employee ID">
            <input style={fieldStyle} value={form.employeeId} onChange={e => set('employeeId', e.target.value)} required />
          </Field>
          <Field label="First Name">
            <input style={fieldStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
          </Field>
          <Field label="Last Name">
            <input style={fieldStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Email">
            <input type="email" style={fieldStyle} value={form.email} onChange={e => set('email', e.target.value)} required />
          </Field>
          <Field label="Phone">
            <input style={fieldStyle} value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Department">
            <select style={fieldStyle} value={form.department} onChange={e => set('department', e.target.value)}>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Branch">
            <select style={fieldStyle} value={form.branch} onChange={e => set('branch', e.target.value)}>
              {BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Role">
            <select style={fieldStyle} value={form.roleId} onChange={e => set('roleId', e.target.value)} required>
              <option value="">Select role…</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select style={fieldStyle} value={form.status} onChange={e => set('status', e.target.value as UserStatus)}>
              {USER_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #E4E2DC' }}>
          <Button type="submit" variant="primary" size="md">{submitLabel}</Button>
          <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
        </div>
      </Stack>
    </form>
  )
}
