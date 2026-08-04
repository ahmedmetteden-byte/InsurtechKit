/**
 * IntegrationForm — create / edit integration config (in-memory framework only).
 */
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Button, Stack } from '../../../components/ui'
import { providersForType } from '../config/providers'
import type {
  CreateIntegrationInput,
  Integration,
  IntegrationStatus,
  IntegrationType,
} from '../types/Integration'
import { INTEGRATION_STATUSES, INTEGRATION_TYPES } from '../types/Integration'

export type IntegrationFormValues = CreateIntegrationInput

const emptyForm: IntegrationFormValues = {
  name: '',
  type: 'Payment Gateway',
  provider: 'Paystack',
  status: 'pending',
  baseUrl: '',
  apiKey: '',
  apiSecret: '',
  username: '',
  password: '',
  webhookUrl: '',
  timeout: 30000,
  enabled: true,
  lastHealthCheck: '',
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

function toForm(row?: Integration | null): IntegrationFormValues {
  if (!row) {
    const type = emptyForm.type
    const providers = providersForType(type)
    return { ...emptyForm, provider: providers[0] ?? '' }
  }
  return {
    name: row.name,
    type: row.type,
    provider: row.provider,
    status: row.status,
    baseUrl: row.baseUrl,
    apiKey: row.apiKey,
    apiSecret: row.apiSecret,
    username: row.username,
    password: row.password,
    webhookUrl: row.webhookUrl,
    timeout: row.timeout,
    enabled: row.enabled,
    lastHealthCheck: row.lastHealthCheck,
    notes: row.notes,
  }
}

type IntegrationFormProps = {
  initial?: Integration | null
  submitLabel?: string
  onSubmit: (values: IntegrationFormValues) => void
  onCancel: () => void
}

export default function IntegrationForm({
  initial,
  submitLabel = 'Save Integration',
  onSubmit,
  onCancel,
}: IntegrationFormProps) {
  const [form, setForm] = useState<IntegrationFormValues>(() => toForm(initial))

  useEffect(() => {
    setForm(toForm(initial))
  }, [initial])

  const set = <K extends keyof IntegrationFormValues>(key: K, value: IntegrationFormValues[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'type') {
        const providers = providersForType(value as IntegrationType)
        if (!providers.includes(next.provider)) {
          next.provider = providers[0] ?? ''
        }
      }
      if (key === 'status') {
        next.enabled = (value as IntegrationStatus) !== 'disabled'
      }
      if (key === 'enabled') {
        if (!value && next.status !== 'disabled') next.status = 'disabled'
        if (value && next.status === 'disabled') next.status = 'configured'
      }
      return next
    })
  }

  const providerOptions = providersForType(form.type)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.provider.trim()) return
    onSubmit({
      ...form,
      name: form.name.trim(),
      provider: form.provider.trim(),
      baseUrl: form.baseUrl.trim(),
      apiKey: form.apiKey.trim(),
      apiSecret: form.apiSecret.trim(),
      username: form.username.trim(),
      password: form.password,
      webhookUrl: form.webhookUrl.trim(),
      timeout: Number(form.timeout) || 30000,
      notes: form.notes.trim(),
      enabled: form.status === 'disabled' ? false : form.enabled,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={16}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Name">
            <input style={fieldStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
          </Field>
          <Field label="Provider">
            <select style={fieldStyle} value={form.provider} onChange={e => set('provider', e.target.value)} required>
              {providerOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
              {!providerOptions.includes(form.provider) && form.provider && (
                <option value={form.provider}>{form.provider}</option>
              )}
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Type">
            <select style={fieldStyle} value={form.type} onChange={e => set('type', e.target.value as IntegrationType)}>
              {INTEGRATION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select style={fieldStyle} value={form.status} onChange={e => set('status', e.target.value as IntegrationStatus)}>
              {INTEGRATION_STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label="Timeout (ms)">
            <input
              type="number"
              min={1000}
              step={1000}
              style={fieldStyle}
              value={form.timeout}
              onChange={e => set('timeout', Number(e.target.value))}
            />
          </Field>
        </div>

        <Field label="Base URL / Endpoint">
          <input style={fieldStyle} value={form.baseUrl} onChange={e => set('baseUrl', e.target.value)} placeholder="https://…" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="API Key">
            <input style={fieldStyle} value={form.apiKey} onChange={e => set('apiKey', e.target.value)} autoComplete="off" />
          </Field>
          <Field label="API Secret">
            <input style={fieldStyle} value={form.apiSecret} onChange={e => set('apiSecret', e.target.value)} autoComplete="off" />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Username">
            <input style={fieldStyle} value={form.username} onChange={e => set('username', e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Password">
            <input type="password" style={fieldStyle} value={form.password} onChange={e => set('password', e.target.value)} autoComplete="off" />
          </Field>
        </div>

        <Field label="Webhook URL">
          <input style={fieldStyle} value={form.webhookUrl} onChange={e => set('webhookUrl', e.target.value)} placeholder="https://hooks.…" />
        </Field>

        <Field label="Notes">
          <textarea
            style={{ ...fieldStyle, minHeight: 72, resize: 'vertical' }}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </Field>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: '#334155', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={e => set('enabled', e.target.checked)}
          />
          Enabled
        </label>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #E4E2DC' }}>
          <Button type="submit" variant="primary" size="md">{submitLabel}</Button>
          <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
        </div>
      </Stack>
    </form>
  )
}
