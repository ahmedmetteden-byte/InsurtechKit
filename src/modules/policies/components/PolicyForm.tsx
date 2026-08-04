/**
 * PolicyForm — create / edit policy fields (in-memory).
 * Resolves customer/product names from CustomerService and ProductService.
 */
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Button, Stack } from '../../../components/ui'
import { CustomerService, ProductService } from '../../../data/services'
import { customerDisplayName } from '../../customers/types/Customer'
import type { CreatePolicyInput, Policy, PolicyStatus } from '../types/Policy'

export const POLICY_STATUSES: PolicyStatus[] = ['active', 'pending', 'expired', 'cancelled']
export const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR']
export const BRANCHES = [
  'Lagos Island', 'Ikeja', 'Lekki', 'Apapa', 'Abuja Central', 'Ibadan',
  'Port Harcourt', 'Kano', 'Kaduna', 'Enugu', 'Warri',
]
export const AGENTS = [
  'Kunle Adesanya', 'Amaka Okeke', 'Chidi Nwosu', 'Hauwa Ibrahim', 'Tolu Adeyemi',
]

export type PolicyFormValues = CreatePolicyInput

const emptyForm: PolicyFormValues = {
  policyNumber: '',
  customerId: '',
  productId: '',
  customerName: '',
  productName: '',
  policyType: '',
  effectiveDate: '',
  expiryDate: '',
  premium: 0,
  sumInsured: 0,
  currency: 'NGN',
  status: 'pending',
  agent: AGENTS[0],
  branch: BRANCHES[0],
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

function nextPolicyNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `POL-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`
}

function toForm(policy?: Policy | null): PolicyFormValues {
  if (!policy) {
    return { ...emptyForm, policyNumber: nextPolicyNumber() }
  }
  return {
    policyNumber: policy.policyNumber,
    customerId: policy.customerId,
    productId: policy.productId,
    customerName: policy.customerName,
    productName: policy.productName,
    policyType: policy.policyType,
    effectiveDate: policy.effectiveDate,
    expiryDate: policy.expiryDate,
    premium: policy.premium,
    sumInsured: policy.sumInsured,
    currency: policy.currency,
    status: policy.status,
    agent: policy.agent,
    branch: policy.branch,
  }
}

type PolicyFormProps = {
  initial?: Policy | null
  submitLabel?: string
  onSubmit: (values: PolicyFormValues) => void
  onCancel: () => void
}

export default function PolicyForm({ initial, submitLabel = 'Save Policy', onSubmit, onCancel }: PolicyFormProps) {
  const customers = useMemo(() => CustomerService.getAll(), [])
  const products = useMemo(() => ProductService.getAll(), [])
  const [form, setForm] = useState<PolicyFormValues>(() => toForm(initial))

  useEffect(() => {
    setForm(toForm(initial))
  }, [initial])

  const set = <K extends keyof PolicyFormValues>(key: K, value: PolicyFormValues[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'customerId') {
        const c = customers.find(x => x.id === value)
        next.customerName = c ? customerDisplayName(c) : ''
      }
      if (key === 'productId') {
        const p = products.find(x => x.id === value)
        next.productName = p?.name ?? ''
        next.policyType = p ? String(p.category) : ''
        if (p && (!prev.premium || prev.premium === 0)) {
          next.premium = p.minimumPremium
          next.currency = p.currency
        }
      }
      return next
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.policyNumber.trim() || !form.customerId || !form.productId) return
    if (!form.effectiveDate || !form.expiryDate) return

    const customer = customers.find(c => c.id === form.customerId)
    const product = products.find(p => p.id === form.productId)

    onSubmit({
      ...form,
      policyNumber: form.policyNumber.trim().toUpperCase(),
      customerName: customer ? customerDisplayName(customer) : form.customerName.trim(),
      productName: product?.name ?? form.productName.trim(),
      policyType: product ? String(product.category) : form.policyType.trim(),
      premium: Number(form.premium) || 0,
      sumInsured: Number(form.sumInsured) || 0,
      agent: form.agent.trim(),
      branch: form.branch.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Policy Number">
            <input style={fieldStyle} value={form.policyNumber} onChange={e => set('policyNumber', e.target.value)} required />
          </Field>
          <Field label="Status">
            <select style={fieldStyle} value={form.status} onChange={e => set('status', e.target.value as PolicyStatus)}>
              {POLICY_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Customer">
            <select style={fieldStyle} value={form.customerId} onChange={e => set('customerId', e.target.value)} required>
              <option value="">Select customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{customerDisplayName(c)} ({c.customerNumber})</option>
              ))}
            </select>
          </Field>
          <Field label="Product">
            <select style={fieldStyle} value={form.productId} onChange={e => set('productId', e.target.value)} required>
              <option value="">Select product…</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Effective Date">
            <input type="date" style={fieldStyle} value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} required />
          </Field>
          <Field label="Expiry Date">
            <input type="date" style={fieldStyle} value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} required />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Premium">
            <input type="number" min={0} style={fieldStyle} value={form.premium} onChange={e => set('premium', Number(e.target.value))} required />
          </Field>
          <Field label="Sum Insured">
            <input type="number" min={0} style={fieldStyle} value={form.sumInsured} onChange={e => set('sumInsured', Number(e.target.value))} />
          </Field>
          <Field label="Currency">
            <select style={fieldStyle} value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Agent">
            <select style={fieldStyle} value={form.agent} onChange={e => set('agent', e.target.value)}>
              {AGENTS.map(a => (
                <option key={a} value={a}>{a}</option>
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

        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #E4E2DC' }}>
          <Button type="submit" variant="primary" size="md">{submitLabel}</Button>
          <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
        </div>
      </Stack>
    </form>
  )
}
