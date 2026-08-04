import { useState, type FormEvent } from 'react'
import { useBranding } from '../config/BrandingContext'
import { useAuth } from './AuthContext'
import { ApiError } from '../data/http'

const T = {
  canvas: '#F4F3EF',
  card: '#FFFFFF',
  border: '#E4E2DC',
  text: '#0F172A',
  muted: '#64748B',
  amber: '#F59E0B',
  navy: '#0A1628',
  blue: '#1D4ED8',
  red: '#DC2626',
  display: 'var(--font-display)',
  body: 'var(--font-body)',
  mono: 'var(--font-mono)',
}

type Props = {
  onCancel: () => void
}

export default function LoginPage({ onCancel }: Props) {
  const { branding } = useBranding()
  const { login } = useAuth()
  const [email, setEmail] = useState('ada.okafor@insureng.com.ng')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Login failed'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(165deg, ${T.navy} 0%, #12233d 48%, ${T.canvas} 48%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: T.card,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          padding: '36px 32px',
          boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
        }}
      >
        <p
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: T.amber,
            marginBottom: 10,
          }}
        >
          {branding.adminLabel}
        </p>
        <h1
          style={{
            fontFamily: T.display,
            fontSize: 28,
            fontWeight: 800,
            color: T.text,
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {branding.companyName}
        </h1>
        <p style={{ fontFamily: T.body, fontSize: 14, color: T.muted, marginTop: 10, marginBottom: 28 }}>
          Sign in with your staff account to open the admin console.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Email
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                padding: '11px 12px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.canvas,
                fontFamily: T.body,
                fontSize: 14,
                color: T.text,
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                padding: '11px 12px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.canvas,
                fontFamily: T.body,
                fontSize: 14,
                color: T.text,
                outline: 'none',
              }}
            />
          </label>

          {error && (
            <p style={{ fontFamily: T.body, fontSize: 13, color: T.red, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              background: busy ? '#94A3B8' : T.blue,
              color: 'white',
              fontFamily: T.body,
              fontSize: 14,
              fontWeight: 700,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.muted,
              fontFamily: T.body,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Back to website
          </button>
        </form>

        <p style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 22, lineHeight: 1.5 }}>
          Demo: ada.okafor@insureng.com.ng / Password123!
        </p>
      </div>
    </div>
  )
}
