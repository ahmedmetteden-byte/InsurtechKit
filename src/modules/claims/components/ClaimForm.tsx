/**
 * ClaimForm — create / edit claim fields (in-memory).
 * Resolves policy / customer / product fields from PolicyService.
 */
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Button, Stack } from '../../../components/ui'
import { PolicyService } from '../../../data/services'
import type { Claim, ClaimStatus, CreateClaimInput } from '../types/Claim'
import { claimStatusLabel } from '../types/Claim'

export const CLAIM_STATUSES: ClaimStatus[] = ['open', 'under_review', 'approved', 'rejected', 'paid']
export const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR']
export const ASSIGNEES = [
  'Kunle Adesanya', 'Amaka Okeke', 'Chidi Nwosu', 'Hauwa Ibrahim', 'Tolu Adeyemi',
  'Emeka N.', 'Ngozi A.', 'Chidera O.',
]

export type ClaimFormValues = CreateClaimInput

const emptyForm: ClaimFormValues = {
  claimNumber: '',
  policyId: '',
  policyNumber: '',
  customerId: '',
  customerName: '',
  productName: '',
  incidentDate: '',
  reportedDate: '',
  claimAmount: 0,
  approvedAmount: 0,
  currency: 'NGN',
  description: '',
  status: 'open',
  assignedTo: ASSIGNEES[0],
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

function nextClaimNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `CLM-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`
}

function toForm(claim?: Claim | null): ClaimFormValues {
  if (!claim) {
    return {
      ...emptyForm,
      claimNumber: nextClaimNumber(),
      reportedDate: new Date().toISOString().slice(0, 10),
    }
  }
  return {
    claimNumber: claim.claimNumber,
    policyId: claim.policyId,
    policyNumber: claim.policyNumber,
    customerId: claim.customerId,
    customerName: claim.customerName,
    productName: claim.productName,
    incidentDate: claim.incidentDate,
    reportedDate: claim.reportedDate,
    claimAmount: claim.claimAmount,
    approvedAmount: claim.approvedAmount,
    currency: claim.currency,
    description: claim.description,
    status: claim.status,
    assignedTo: claim.assignedTo,
    notes: claim.notes,
  }
}

type ClaimFormProps = {
  initial?: Claim | null
  submitLabel?: string
  onSubmit: (values: ClaimFormValues) => void
  onCancel: () => void
}

export default function ClaimForm({ initial, submitLabel = 'Save Claim', onSubmit, onCancel }: ClaimFormProps) {
  const policies = useMemo(() => PolicyService.getAll(), [])
  const [form, setForm] = useState<ClaimFormValues>(() => toForm(initial))

  useEffect(() => {
    setForm(toForm(initial))
  }, [initial])

  const set = <K extends keyof ClaimFormValues>(key: K, value: ClaimFormValues[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'policyId') {
        const p = policies.find(x => x.id === value)
        if (p) {
          next.policyNumber = p.policyNumber
          next.customerId = p.customerId
          next.customerName = p.customerName
          next.productName = p.productName
          next.currency = p.currency
        }
      }
      return next
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.claimNumber.trim() || !form.policyId) return
    if (!form.incidentDate || !form.reportedDate) return

    onSubmit({
      ...form,
      claimNumber: form.claimNumber.trim().toUpperCase(),
      claimAmount: Number(form.claimAmount) || 0,
      approvedAmount: Number(form.approvedAmount) || 0,
      description: form.description.trim(),
      notes: form.notes.trim(),
      assignedTo: form.assignedTo.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Claim Number">
            <input style={fieldStyle} value={form.claimNumber} onChange={e => set('claimNumber', e.target.value)} required />
          </Field>
          <Field label="Status">
            <select style={fieldStyle} value={form.status} onChange={e => set('status', e.target.value as ClaimStatus)}>
              {CLAIM_STATUSES.map(s => (
                <option key={s} value={s}>{claimStatusLabel(s)}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Policy">
          <select style={fieldStyle} value={form.policyId} onChange={e => set('policyId', e.target.value)} required>
            <option value="">Select policy…</option>
            {policies.map(p => (
              <option key={p.id} value={p.id}>
                {p.policyNumber} — {p.customerName} ({p.productName})
              </option>
            ))}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Incident Date">
            <input type="date" style={fieldStyle} value={form.incidentDate} onChange={e => set('incidentDate', e.target.value)} required />
          </Field>
          <Field label="Reported Date">
            <input type="date" style={fieldStyle} value={form.reportedDate} onChange={e => set('reportedDate', e.target.value)} required />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Claim Amount">
            <input type="number" min={0} style={fieldStyle} value={form.claimAmount} onChange={e => set('claimAmount', Number(e.target.value))} required />
          </Field>
          <Field label="Approved Amount">
            <input type="number" min={0} style={fieldStyle} value={form.approvedAmount} onChange={e => set('approvedAmount', Number(e.target.value))} />
          </Field>
          <Field label="Currency">
            <select style={fieldStyle} value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Assigned To">
          <select style={fieldStyle} value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
            {ASSIGNEES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            style={{ ...fieldStyle, minHeight: 80, resize: 'vertical' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            required
          />
        </Field>

        <Field label="Notes">
          <textarea
            style={{ ...fieldStyle, minHeight: 64, resize: 'vertical' }}
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
