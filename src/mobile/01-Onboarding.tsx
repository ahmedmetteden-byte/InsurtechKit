/**
 * Mobile / 01-Onboarding
 * Splash screen + value proposition for new Nigerian users.
 * Screens: Welcome splash → App value props (3 slides) → Get Started CTA
 */
import { branding } from '../config/branding'

export default function MobileOnboarding() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '40px 24px', fontFamily: 'var(--font-body)', background: '#060F2A', minHeight: '100vh', justifyContent: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: 36, height: 36 }}>
            <path d="M12 2l9 5v6c0 5-4 9-9 10C7 22 3 18 3 13V7l9-5z"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-0.04em', marginBottom: 12 }}>{branding.companyName} Mobile</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Instant insurance coverage for every Nigerian.
          </p>
        </div>
        <div style={{ padding: '4px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mobile / 01-Onboarding</span>
        </div>
      </div>
    )
  }
  