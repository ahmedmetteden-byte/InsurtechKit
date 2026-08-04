/**
 * Company Settings — in-memory branding editor (Phase 1).
 * Saves update BrandingContext immediately. No persistence.
 */
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Button, Stack } from '../components/ui'
import { useBranding } from '../config/BrandingContext'
import { useFeatures } from '../config/FeatureContext'
import { FEATURE_KEYS, FEATURE_LABELS, type FeatureKey } from '../config/features'
import type { BrandingConfig } from '../config/branding'

type FormState = {
  companyName: string
  shortName: string
  tagline: string
  website: string
  supportEmail: string
  supportPhone: string
  address: string
  licenceNo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logoUrl: string
}

function toForm(b: BrandingConfig): FormState {
  return {
    companyName: b.companyName,
    shortName: b.shortName,
    tagline: b.tagline,
    website: b.website,
    supportEmail: b.supportEmail,
    supportPhone: b.supportPhone,
    address: b.address,
    licenceNo: b.licenceNo,
    primaryColor: b.primaryColor,
    secondaryColor: b.secondaryColor,
    accentColor: b.accentColor,
    logoUrl: b.logoLight,
  }
}

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #E4E2DC',
  background: '#FAFAF8',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: '#0F172A',
  outline: 'none',
}

const labelStyle: CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
  display: 'block',
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function CompanySettings() {
  const { branding, updateBranding, resetBranding } = useBranding()
  const { features, setFeature, resetFeatures } = useFeatures()
  const [form, setForm] = useState<FormState>(() => toForm(branding))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(toForm(branding))
  }, [branding])

  const set = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    updateBranding({
      companyName: form.companyName.trim() || branding.companyName,
      shortName: form.shortName.trim() || form.companyName.trim() || branding.shortName,
      tagline: form.tagline,
      website: form.website,
      supportEmail: form.supportEmail,
      supportPhone: form.supportPhone,
      address: form.address,
      licenceNo: form.licenceNo.trim() || branding.licenceNo,
      primaryColor: form.primaryColor || branding.primaryColor,
      secondaryColor: form.secondaryColor || branding.secondaryColor,
      accentColor: form.accentColor || branding.accentColor,
      logoLight: form.logoUrl,
      logoDark: form.logoUrl,
    })
    setSaved(true)
  }

  const handleReset = () => {
    resetBranding()
    resetFeatures()
    setSaved(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', padding: '22px 24px' }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 19, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Company Settings
        </p>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#64748B' }}>
          Edit in-memory branding · changes apply immediately · refresh resets
        </p>
      </div>

      <form onSubmit={handleSave} style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Stack gap={16}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Company Name">
              <input style={fieldStyle} value={form.companyName} onChange={e => set('companyName', e.target.value)} />
            </Field>
            <Field label="Short Name">
              <input style={fieldStyle} value={form.shortName} onChange={e => set('shortName', e.target.value)} />
            </Field>
          </div>

          <Field label="Tagline">
            <textarea style={{ ...fieldStyle, minHeight: 72, resize: 'vertical' }} value={form.tagline} onChange={e => set('tagline', e.target.value)} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Website">
              <input style={fieldStyle} value={form.website} onChange={e => set('website', e.target.value)} />
            </Field>
            <Field label="Licence Number">
              <input style={fieldStyle} value={form.licenceNo} onChange={e => set('licenceNo', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Support Email">
              <input type="email" style={fieldStyle} value={form.supportEmail} onChange={e => set('supportEmail', e.target.value)} />
            </Field>
            <Field label="Support Phone">
              <input style={fieldStyle} value={form.supportPhone} onChange={e => set('supportPhone', e.target.value)} />
            </Field>
          </div>

          <Field label="Address">
            <input style={fieldStyle} value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>

          <Field label="Logo URL (placeholder)">
            <input style={fieldStyle} value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://… or leave blank for default mark" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Field label="Primary Color">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} style={{ width: 40, height: 40, border: '1px solid #E4E2DC', borderRadius: 8, padding: 2, background: '#FAFAF8', cursor: 'pointer' }} />
                <input style={fieldStyle} value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} />
              </div>
            </Field>
            <Field label="Secondary Color">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.secondaryColor} onChange={e => set('secondaryColor', e.target.value)} style={{ width: 40, height: 40, border: '1px solid #E4E2DC', borderRadius: 8, padding: 2, background: '#FAFAF8', cursor: 'pointer' }} />
                <input style={fieldStyle} value={form.secondaryColor} onChange={e => set('secondaryColor', e.target.value)} />
              </div>
            </Field>
            <Field label="Accent Color">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.accentColor} onChange={e => set('accentColor', e.target.value)} style={{ width: 40, height: 40, border: '1px solid #E4E2DC', borderRadius: 8, padding: 2, background: '#FAFAF8', cursor: 'pointer' }} />
                <input style={fieldStyle} value={form.accentColor} onChange={e => set('accentColor', e.target.value)} />
              </div>
            </Field>
          </div>
        </Stack>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid #E4E2DC' }}>
          <Button type="submit" variant="primary" size="md">
            Save Branding
          </Button>
          <Button type="button" variant="outline" size="md" onClick={handleReset}>
            Reset Defaults
          </Button>
          {saved && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#16A34A', fontWeight: 600 }}>
              Applied to live app
            </span>
          )}
        </div>
      </form>

      {/* Platform Features */}
      <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', padding: '24px' }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Platform Features
        </p>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#64748B', marginBottom: 18 }}>
          Enable or disable modules · changes apply immediately · refresh resets
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {FEATURE_KEYS.map((key: FeatureKey) => (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid #E4E2DC',
                background: features[key] ? '#FAFAF8' : '#F8FAFC',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={features[key]}
                onChange={e => setFeature(key, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: branding.primaryColor, cursor: 'pointer' }}
              />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#0F172A' }}>
                {FEATURE_LABELS[key]}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: "'DM Mono', monospace", fontSize: 10, color: features[key] ? '#16A34A' : '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {features[key] ? 'Enabled' : 'Off'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E4E2DC', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{branding.companyName}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#64748B' }}>{branding.tagline}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {[branding.primaryColor, branding.secondaryColor, branding.accentColor].map(c => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 4, background: c, border: '1px solid #E4E2DC' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
