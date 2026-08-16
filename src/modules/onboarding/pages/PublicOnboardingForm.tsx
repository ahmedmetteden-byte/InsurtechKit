import { useEffect, useState } from 'react'
import { useBranding } from '../../../config/BrandingContext'
import { OnboardingService } from '../../../data/services'
import { getPublicActiveProducts, type PublicProduct } from '../services/publicCatalogue'
import type { OnboardingApplication } from '../types/OnboardingApplication'

interface Props {
  /** Product category to preselect, e.g. passed from the marketing Product page CTA. */
  initialCategory?: string
  /** Prefilled message, e.g. the calculator's indicative quote summary. */
  initialMessage?: string
  onBackToHome: () => void
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8, display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
  background: 'white', fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A', boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function PublicOnboardingForm({ initialCategory, initialMessage, onBackToHome }: Props) {
  const { branding } = useBranding()
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [catalogueError, setCatalogueError] = useState('')

  const [productId, setProductId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(initialMessage ?? '')
  const [consent, setConsent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OnboardingApplication | null>(null)

  useEffect(() => {
    let cancelled = false
    getPublicActiveProducts()
      .then(list => {
        if (cancelled) return
        setProducts(list)
        const preselect = initialCategory ? list.find(p => p.category === initialCategory) : undefined
        setProductId((preselect ?? list[0])?.id ?? '')
      })
      .catch(() => {
        if (!cancelled) setCatalogueError('Could not load products right now. Please try again shortly.')
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false)
      })
    return () => { cancelled = true }
  }, [initialCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!productId) { setError('Please select a product.'); return }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) { setError('Please fill in your name and email.'); return }
    if (!consent) { setError('Please confirm consent to be contacted before submitting.'); return }

    setSubmitting(true)
    try {
      const application = await OnboardingService.submit({
        productId,
        applicantFirstName: firstName.trim(),
        applicantLastName: lastName.trim(),
        applicantEmail: email.trim(),
        applicantPhone: phone.trim(),
        message: message.trim(),
        consent: true,
      })
      setResult(application)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong submitting your application.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <section style={{ background: '#F8FAFC', minHeight: '70vh', padding: '80px 24px' }}>
        <div className="max-w-[560px] mx-auto" style={{ background: 'white', borderRadius: 22, border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#16A34A', fontSize: 24 }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 10 }}>Application received</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 8 }}>
            Thanks, {result.applicantFirstName}. Your reference number is below — a member of the {branding.companyName} team will be in touch shortly.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 22 }}>
            We've also sent a confirmation to {result.applicantEmail}.
          </p>
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Reference Number</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#1D4ED8' }}>{result.reference}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={onBackToHome} style={{ padding: '12px 22px', borderRadius: 10, background: '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Back to Home
            </button>
            <button onClick={() => setResult(null)} style={{ padding: '12px 22px', borderRadius: 10, background: 'white', color: '#1D4ED8', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: '1.5px solid #BFDBFE', cursor: 'pointer' }}>
              Submit Another
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: '#F8FAFC', minHeight: '70vh', padding: '56px 24px 80px' }}>
      <div className="max-w-[640px] mx-auto">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 10 }}>Get Started</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px,3.4vw,38px)', letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.1, marginBottom: 10 }}>
          Request your instant quote
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 28 }}>
          Tell us a little about yourself and we'll follow up with pricing and next steps — no payment required to apply.
        </p>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Product">
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={productId} onChange={e => setProductId(e.target.value)} disabled={loadingProducts || products.length === 0}>
              {products.length === 0 && <option value="">{loadingProducts ? 'Loading products…' : 'No products available'}</option>}
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First name">
              <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Chinwe" />
            </Field>
            <Field label="Last name">
              <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Obi" />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Email">
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Phone">
              <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
            </Field>
          </div>

          <Field label="Anything we should know? (optional)">
            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: 'var(--font-body)' }} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us about what you'd like covered…" />
          </Field>

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: '#1D4ED8', cursor: 'pointer' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              I consent to {branding.companyName} contacting me about this application by phone, email, or WhatsApp.
            </span>
          </label>

          {(error || catalogueError) && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontFamily: 'var(--font-body)', fontSize: 13, color: '#B91C1C' }}>
              {error || catalogueError}
            </div>
          )}

          <button type="submit" disabled={submitting} style={{ padding: '14px', borderRadius: 12, background: submitting ? '#93C5FD' : '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, border: 'none', cursor: submitting ? 'default' : 'pointer', boxShadow: '0 4px 16px rgba(29,78,216,0.4)' }}>
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
          <button type="button" onClick={onBackToHome} style={{ padding: '4px', background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: '#94A3B8', cursor: 'pointer' }}>
            ← Back to home
          </button>
        </form>
      </div>
    </section>
  )
}
