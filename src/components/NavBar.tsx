import { useState } from 'react'
import { Icon } from '../icons'
import { branding } from '../config/branding'
import { Button, Row } from './ui'

type Page = 'home' | 'product' | 'claims' | 'contact'

interface NavBarProps {
  current: Page
  onNavigate: (p: Page) => void
  onAdminClick?: () => void
  onMobileClick?: () => void
}

const links: { label: string; page: Page }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Coverage', page: 'product' },
  { label: 'Claims', page: 'claims' },
  { label: 'Contact', page: 'contact' },
]

export default function NavBar({ current, onNavigate, onAdminClick, onMobileClick }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>

      {/* ── Top info strip ── */}
      <div style={{ background: '#1E3A8A', padding: '6px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Row: flex-wrap means this collapses gracefully at any width */}
          <Row gap={16} justify="space-between" wrap>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>
              NAICOM Licensed · Claims hotline:&nbsp;
              <strong style={{ color: 'white' }}>{branding.supportPhone}</strong>
            </p>
            <Row gap={12} wrap={false} className="hidden md:flex">
              {[
                { icon: Icon.twitter, label: 'Twitter' },
                { icon: Icon.linkedin, label: 'LinkedIn' },
                { icon: Icon.whatsapp, label: 'WhatsApp' },
              ].map(s => (
                <button key={s.label} aria-label={s.label}
                  style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {s.icon}
                </button>
              ))}
            </Row>
          </Row>
        </div>
      </div>

      {/* ── Main nav ── */}
      <div className="max-w-[1200px] mx-auto px-6" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* Logo — hug-content layout, never fixed width */}
        <button onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${branding.primaryColor}, #1E3A8A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20 }}>{Icon.shield}</div>
          </div>
          <div style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.1 }}>{branding.companyName}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: '#94A3B8', textTransform: 'uppercase' }}>{branding.portalLabel}</p>
          </div>
        </button>

        {/* Desktop nav links — Auto Layout row, each link hugs its label */}
        <Row gap={2} wrap={false} className="hidden md:flex" style={{ flex: 1, justifyContent: 'center' }}>
          {links.map(l => (
            <button key={l.page} onClick={() => onNavigate(l.page)}
              /*
               * Auto Layout: padding defines spacing, NOT width.
               * Change "Coverage" to "All Coverage Products" and this button
               * expands automatically — no layout breaks.
               */
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',           /* padding drives width, not min-width */
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: current === l.page ? 600 : 500,
                color: current === l.page ? '#1D4ED8' : '#475569',
                background: current === l.page ? '#EFF6FF' : 'transparent',
                whiteSpace: 'nowrap',          /* text never wraps inside the button */
                transition: 'all 0.15s',
                flexShrink: 0,                 /* never let flex crush the label */
              }}>
              {l.label}
            </button>
          ))}
        </Row>

        {/* Desktop CTAs — Button components handle Auto Layout natively */}
        <Row gap={10} wrap={false} className="hidden md:flex" style={{ flexShrink: 0 }}>
          {onMobileClick && (
            <button onClick={onMobileClick}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 13px', borderRadius: 8, border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#475569', background: '#F8FAFC', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Mobile ↗
            </button>
          )}
          {onAdminClick && (
            <button onClick={onAdminClick}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 13px', borderRadius: 8, border: '1px solid #E2E8F0', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#475569', background: '#F8FAFC', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Admin ↗
            </button>
          )}
          <Button variant="ghost" size="sm" onClick={() => {}}>
            Log In
          </Button>
          <Button variant="primary" size="md" onClick={() => onNavigate('product')}>
            Get Instant Quote
          </Button>
        </Row>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(o => !o)}
          style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', flexShrink: 0 }}>
          <div style={{ width: 20, height: 20 }}>{mobileOpen ? Icon.x : Icon.menu}</div>
        </button>
      </div>

      {/* Mobile menu — each item is a full-width button that hugs its content */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'white', padding: '12px 20px 20px' }}>
          {links.map(l => (
            <button key={l.page} onClick={() => { onNavigate(l.page); setMobileOpen(false) }}
              style={{ display: 'flex', width: '100%', padding: '12px 0', textAlign: 'left', border: 'none', background: 'none', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: current === l.page ? 600 : 400, color: current === l.page ? '#1D4ED8' : '#334155', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' }}>
              {l.label}
            </button>
          ))}
          {/* Full-width CTA uses al-btn-full which sets display:flex;width:100% */}
          <div style={{ marginTop: 14 }}>
            <Button variant="primary" size="lg" full onClick={() => { onNavigate('product'); setMobileOpen(false) }}>
              Get Instant Quote
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
