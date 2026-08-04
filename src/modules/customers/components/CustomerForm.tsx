/**
 * CustomerForm — create / edit customer fields (in-memory).
 */
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Button, Stack } from '../../../components/ui'
import type {
  CreateCustomerInput,
  Customer,
  CustomerStatus,
  CustomerType,
  Gender,
  IdentificationType,
} from '../types/Customer'

export const CUSTOMER_TYPES: CustomerType[] = ['Individual', 'Corporate']
export const CUSTOMER_STATUSES: CustomerStatus[] = ['active', 'inactive', 'pending', 'suspended']
export const GENDERS: Gender[] = ['Male', 'Female', 'Other']
export const ID_TYPES: IdentificationType[] = ['NIN', 'BVN', 'Passport', 'Drivers Licence', 'CAC', 'TIN']
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

export type CustomerFormValues = CreateCustomerInput

const emptyForm: CustomerFormValues = {
  customerNumber: '',
  customerType: 'Individual',
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  identificationType: 'NIN',
  identificationNumber: '',
  address: '',
  city: '',
  state: 'Lagos',
  country: 'Nigeria',
  occupation: '',
  status: 'active',
  notes: '',
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

function toForm(customer?: Customer | null): CustomerFormValues {
  if (!customer) return { ...emptyForm }
  return {
    customerNumber: customer.customerNumber,
    customerType: customer.customerType,
    firstName: customer.firstName,
    lastName: customer.lastName,
    companyName: customer.companyName,
    email: customer.email,
    phone: customer.phone,
    dateOfBirth: customer.dateOfBirth,
    gender: customer.gender,
    identificationType: customer.identificationType,
    identificationNumber: customer.identificationNumber,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    country: customer.country,
    occupation: customer.occupation,
    status: customer.status,
    notes: customer.notes,
  }
}

function nextCustomerNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `CUS-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`
}

type CustomerFormProps = {
  initial?: Customer | null
  submitLabel?: string
  onSubmit: (values: CustomerFormValues) => void
  onCancel: () => void
}

export default function CustomerForm({ initial, submitLabel = 'Save Customer', onSubmit, onCancel }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormValues>(() => {
    const base = toForm(initial)
    if (!initial && !base.customerNumber) {
      base.customerNumber = nextCustomerNumber()
    }
    return base
  })

  useEffect(() => {
    const next = toForm(initial)
    if (!initial && !next.customerNumber) {
      next.customerNumber = nextCustomerNumber()
    }
    setForm(next)
  }, [initial])

  const set = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'customerType') {
        if (value === 'Corporate') {
          next.identificationType = prev.identificationType === 'CAC' || prev.identificationType === 'TIN'
            ? prev.identificationType
            : 'CAC'
          next.firstName = ''
          next.lastName = ''
          next.gender = ''
          next.dateOfBirth = ''
        } else {
          next.companyName = ''
          next.identificationType = prev.identificationType === 'CAC' || prev.identificationType === 'TIN'
            ? 'NIN'
            : prev.identificationType
        }
      }
      return next
    })
  }

  const isCorporate = form.customerType === 'Corporate'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.customerNumber.trim() || !form.email.trim() || !form.phone.trim()) return
    if (isCorporate && !form.companyName.trim()) return
    if (!isCorporate && (!form.firstName.trim() || !form.lastName.trim())) return

    onSubmit({
      ...form,
      customerNumber: form.customerNumber.trim().toUpperCase(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      companyName: form.companyName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      identificationNumber: form.identificationNumber.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim() || 'Nigeria',
      occupation: form.occupation.trim(),
      notes: form.notes.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Customer Number">
            <input style={fieldStyle} value={form.customerNumber} onChange={e => set('customerNumber', e.target.value)} required />
          </Field>
          <Field label="Customer Type">
            <select style={fieldStyle} value={form.customerType} onChange={e => set('customerType', e.target.value as CustomerType)}>
              {CUSTOMER_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select style={fieldStyle} value={form.status} onChange={e => set('status', e.target.value as CustomerStatus)}>
              {CUSTOMER_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
        </div>

        {isCorporate ? (
          <Field label="Company Name">
            <input style={fieldStyle} value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
          </Field>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="First Name">
              <input style={fieldStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            </Field>
            <Field label="Last Name">
              <input style={fieldStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </Field>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Email">
            <input type="email" style={fieldStyle} value={form.email} onChange={e => set('email', e.target.value)} required />
          </Field>
          <Field label="Phone">
            <input style={fieldStyle} value={form.phone} onChange={e => set('phone', e.target.value)} required />
          </Field>
        </div>

        {!isCorporate && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Date of Birth">
              <input type="date" style={fieldStyle} value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
            </Field>
            <Field label="Gender">
              <select style={fieldStyle} value={form.gender} onChange={e => set('gender', e.target.value as Gender)}>
                <option value="">—</option>
                {GENDERS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Identification Type">
            <select style={fieldStyle} value={form.identificationType} onChange={e => set('identificationType', e.target.value)}>
              {ID_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Identification Number">
            <input style={fieldStyle} value={form.identificationNumber} onChange={e => set('identificationNumber', e.target.value)} />
          </Field>
        </div>

        <Field label="Address">
          <input style={fieldStyle} value={form.address} onChange={e => set('address', e.target.value)} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="City">
            <input style={fieldStyle} value={form.city} onChange={e => set('city', e.target.value)} />
          </Field>
          <Field label="State">
            <select style={fieldStyle} value={form.state} onChange={e => set('state', e.target.value)}>
              {NIGERIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Country">
            <input style={fieldStyle} value={form.country} onChange={e => set('country', e.target.value)} />
          </Field>
        </div>

        <Field label="Occupation">
          <input style={fieldStyle} value={form.occupation} onChange={e => set('occupation', e.target.value)} />
        </Field>

        <Field label="Notes">
          <textarea
            style={{ ...fieldStyle, minHeight: 72, resize: 'vertical' }}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </Field>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #E4E2DC' }}>
          <Button type="submit" variant="primary" size="md">{submitLabel}</Button>
          <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
        </div>
      </Stack>
    </form>
  )
}
