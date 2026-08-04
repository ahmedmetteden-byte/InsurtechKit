/**
 * ProductForm — create / edit product fields (in-memory).
 */
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Button, Stack } from '../../../components/ui'
import type { CreateProductInput, Product, ProductCategory } from '../types/Product'

const CATEGORIES: ProductCategory[] = ['motor', 'health', 'travel', 'marine', 'property', 'life']
const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR']

export type ProductFormValues = CreateProductInput

const emptyForm: ProductFormValues = {
  name: '',
  code: '',
  description: '',
  category: 'motor',
  status: 'active',
  minimumPremium: 0,
  currency: 'NGN',
  requiresInspection: false,
  active: true,
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

function toForm(product?: Product | null): ProductFormValues {
  if (!product) return { ...emptyForm }
  return {
    name: product.name,
    code: product.code,
    description: product.description,
    category: product.category,
    status: product.status,
    minimumPremium: product.minimumPremium,
    currency: product.currency,
    requiresInspection: product.requiresInspection,
    active: product.active,
  }
}

type ProductFormProps = {
  initial?: Product | null
  submitLabel?: string
  onSubmit: (values: ProductFormValues) => void
  onCancel: () => void
}

export default function ProductForm({ initial, submitLabel = 'Save Product', onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>(() => toForm(initial))

  useEffect(() => {
    setForm(toForm(initial))
  }, [initial])

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'active') {
        next.status = value ? 'active' : 'inactive'
      }
      return next
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return
    onSubmit({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      minimumPremium: Number(form.minimumPremium) || 0,
      status: form.active ? 'active' : 'inactive',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Name">
            <input style={fieldStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
          </Field>
          <Field label="Code">
            <input style={fieldStyle} value={form.code} onChange={e => set('code', e.target.value)} required />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            style={{ ...fieldStyle, minHeight: 88, resize: 'vertical' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Category">
            <select style={fieldStyle} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label="Minimum Premium">
            <input
              type="number"
              min={0}
              style={fieldStyle}
              value={form.minimumPremium}
              onChange={e => set('minimumPremium', Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Currency">
            <select style={fieldStyle} value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A' }}>
            <input
              type="checkbox"
              checked={form.requiresInspection}
              onChange={e => set('requiresInspection', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1D4ED8' }}
            />
            Requires Inspection
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A' }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => set('active', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1D4ED8' }}
            />
            Active
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #E4E2DC' }}>
          <Button type="submit" variant="primary" size="md">{submitLabel}</Button>
          <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
        </div>
      </Stack>
    </form>
  )
}

export { CATEGORIES }
