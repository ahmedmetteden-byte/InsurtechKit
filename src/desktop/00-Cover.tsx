/**
 * Desktop / 00-Cover — "Start Here" guide
 * Frame name: Thumbnail · 1920 × 1080
 *
 * The first thing a buyer sees when they open the file.
 * Communicates brand identity, kit scope, and customisation steps.
 */

import { useBranding } from '../config/BrandingContext'

interface Props {
    onEnter: () => void
  }
  
  // ── Token preview swatches (sourced from Layer 1 of tokens.css) ───────────
  const palette = [
    { group: 'Brand / Primary',    shades: ['#EFF6FF', '#BFDBFE', '#60A5FA', '#1D4ED8', '#1E3A8A'] },
    { group: 'Brand / Secondary',  shades: ['#F0FDF4', '#BBF7D0', '#4ADE80', '#16A34A', '#14532D'] },
    { group: 'Brand / Accent',     shades: ['#FEF3C7', '#FDE68A', '#FCD34D', '#F59E0B', '#D97706'] },
    { group: 'Neutral / Surface',  shades: ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#94A3B8'] },
    { group: 'Neutral / Text',     shades: ['#F8FAFC', '#CBD5E1', '#64748B', '#334155', '#0F172A'] },
  ]
  
  // ── Screen inventory ──────────────────────────────────────────────────────
  const screens = [
    { group: 'Mobile', color: '#7C3AED', items: ['01 · Onboarding', '02 · Dashboard', '03 · Get Quote', '04 · Policy Details', '05 · Claims Submit'] },
    { group: 'Desktop', color: '#1D4ED8', items: ['01 · Homepage', '02 · Product Details', '03 · Claims Process', '04 · Contact & Agents'] },
    { group: 'Admin', color: '#F59E0B', items: ['01 · Analytics Overview', '02 · Claims Queue'] },
  ]
  
  // ── Customisation steps ───────────────────────────────────────────────────
  const steps = [
    {
      num: '01',
      title: 'Swap Logos',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: '🔁',
      body: 'Select the logo component on Page 01 | Component Library and replace the placeholder SVG or image. The logo propagates instantly to NavBar, Footer, Admin Sidebar, and all Mobile screens via the shared component.',
      tag: 'Components → Logo',
    },
    {
      num: '02',
      title: 'Change Brand Colors',
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      icon: '🎨',
      body: 'Open src/styles/tokens.css. In the "Brand / Primary" block (Layer 1), update --brand-primary-700 to your hex code. Every button, header, badge, nav strip, chart fill, and sidebar accent updates instantly — no component files to touch.',
      tag: 'tokens.css → Layer 1',
    },
    {
      num: '03',
      title: 'Developer Export',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      icon: '⚙️',
      body: 'Switch to Dev Mode (top-right toggle) to inspect layout measurements, CSS custom properties, spacing tokens, and copyable code. All components use semantic token names (--primary, --border) that map directly to your design system variables.',
      tag: 'Dev Mode → Inspect',
    },
  ]
  
  // ── Tech stack badges ─────────────────────────────────────────────────────
  const techStack = [
    { label: 'React 19', bg: '#EFF6FF', text: '#1D4ED8' },
    { label: 'TypeScript', bg: '#EFF6FF', text: '#1D4ED8' },
    { label: 'Vite 8', bg: '#FEF3C7', text: '#92400E' },
    { label: 'Tailwind CSS v4', bg: '#F0FDF4', text: '#15803D' },
    { label: 'Recharts 3', bg: '#F5F3FF', text: '#6D28D9' },
    { label: 'Auto Layout UI', bg: '#FDF2F8', text: '#9D174D' },
  ]
  
  export default function Cover({ onEnter }: Props) {
    const { branding } = useBranding()
    return (
      /*
       * Thumbnail frame — 1920 × 1080 (16:9)
       * In a real Figma export this would be a fixed 1920×1080 frame.
       * In the browser we maintain the ratio with aspect-ratio + max-width.
       */
      <div style={{ background: '#F4F3EF', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0', fontFamily: 'var(--font-body)' }}>
        <div
          id="Thumbnail"
          style={{
            width: '100%',
            maxWidth: 1920,
            aspectRatio: '16 / 9',
            background: '#060F2A',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
          }}>
  
          {/* ── Background geometry ── */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* Dot grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1.2px)', backgroundSize: '32px 32px' }} />
            {/* Primary glow */}
            <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '55%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 65%)' }} />
            {/* Amber glow */}
            <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: '35%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 65%)' }} />
            {/* Vertical rule — Swiss grid marker */}
            <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: 'rgba(255,255,255,0.04)' }} />
          </div>
  
          {/* ══════════════════════════════════════════════════════════════════
              TOP BAND — Brand identity + kit metadata
              ═════════════════════════════════════════════════════════════════ */}
          <header style={{ padding: 'clamp(24px,3.5%,60px) clamp(32px,5%,96px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
            {/* Logo lockup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,1.5%,18px)' }}>
              <div style={{ width: 'clamp(32px,3.5vw,52px)', height: 'clamp(32px,3.5vw,52px)', borderRadius: 'clamp(8px,1vw,14px)', background: `linear-gradient(135deg, ${branding.primaryColor}, #1E3A8A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: '55%', height: '55%' }}>
                  <path d="M12 2l9 5v6c0 5-4 9-9 10C7 22 3 18 3 13V7l9-5z" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(16px,2vw,28px)', letterSpacing: '-0.04em', color: 'white', lineHeight: 1 }}>{branding.companyName}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(8px,0.7vw,11px)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>{branding.kitLabel}</p>
              </div>
            </div>
  
            {/* Kit metadata pills */}
            <div style={{ display: 'flex', gap: 'clamp(6px,0.8%,12px)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {[
                { val: '11', label: 'Screens' },
                { val: '3', label: 'Brand Layers' },
                { val: '4', label: 'Theme Presets' },
                { val: 'NAICOM', label: 'Licensed' },
              ].map(m => (
                <div key={m.label} style={{ padding: 'clamp(4px,0.6%,8px) clamp(10px,1%,18px)', borderRadius: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(12px,1.2vw,18px)', fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.03em' }}>{m.val}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px,0.55vw,9px)', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{m.label}</p>
                </div>
              ))}
            </div>
          </header>
  
  
          {/* ══════════════════════════════════════════════════════════════════
              CENTRE — Hero title + Customisation guide (two-column grid)
              ═════════════════════════════════════════════════════════════════ */}
          <main style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 'clamp(20px,3%,56px)', padding: 'clamp(24px,3.5%,56px) clamp(32px,5%,96px)', alignItems: 'start', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
  
            {/* Left: Hero title + palette + screen index */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px,2.5%,36px)' }}>
              {/* Eyebrow */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 40, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', width: 'fit-content' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(8px,0.65vw,10px)', color: '#F59E0B', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Start Here</span>
              </div>
  
              {/* Hero type */}
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3.8vw,64px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'white', lineHeight: 0.95, marginBottom: 'clamp(8px,1%,16px)' }}>
                  The Complete<br />
                  <span style={{ background: 'linear-gradient(90deg, #60A5FA 0%, #93C5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Insurtech Kit</span><br />
                  for Nigeria.
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(10px,1vw,15px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '80%' }}>
                  Production-ready React components, a three-layer design token system,
                  and 11 high-fidelity screens — desktop, mobile, and admin.
                </p>
              </div>
  
              {/* ── Color palette display ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px,0.8%,10px)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px,0.6vw,9px)', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Local Styles · Color Variables</p>
                {palette.map(row => (
                  <div key={row.group} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px,0.5%,8px)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(6px,0.55vw,8.5px)', color: 'rgba(255,255,255,0.28)', width: 'clamp(80px,8vw,130px)', flexShrink: 0, letterSpacing: '0.04em' }}>{row.group}</span>
                    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                      {row.shades.map((hex, i) => (
                        <div key={hex} title={hex}
                          style={{ height: 'clamp(14px,1.6vw,24px)', flex: 1, borderRadius: 4, background: hex, border: i === 3 ? '1.5px solid rgba(255,255,255,0.3)' : 'none' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
  
              {/* ── Screen inventory ── */}
              <div style={{ display: 'flex', gap: 'clamp(6px,0.8%,12px)', flexWrap: 'wrap' }}>
                {screens.map(grp => (
                  <div key={grp.group} style={{ padding: 'clamp(8px,1%,14px) clamp(10px,1.2%,18px)', borderRadius: 'clamp(8px,1vw,14px)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'clamp(4px,0.5%,8px)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: grp.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px,0.6vw,9px)', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{grp.group}</span>
                    </div>
                    {grp.items.map(item => (
                      <p key={item} style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(8px,0.7vw,11px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>{item}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
  
            {/* Right: "How to Customize" guide */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5%,20px)' }}>
              {/* Section header */}
              <div style={{ paddingBottom: 'clamp(10px,1.2%,16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px,0.6vw,9px)', color: '#F59E0B', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Getting Started</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px,1.8vw,28px)', fontWeight: 800, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  How to Customize This White-Label Kit
                </h2>
              </div>
  
              {/* Three steps */}
              {steps.map((s, i) => (
                <div key={s.num}
                  style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'clamp(10px,1.2%,18px)', padding: 'clamp(12px,1.4%,22px)', borderRadius: 'clamp(10px,1.2vw,18px)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.2s' }}>
                  {/* Step icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 'clamp(28px,3.2vw,50px)', height: 'clamp(28px,3.2vw,50px)', borderRadius: 'clamp(7px,0.9vw,13px)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(14px,1.6vw,24px)', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 8, background: 'rgba(255,255,255,0.07)' }} />
                    )}
                  </div>
                  {/* Step content */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px,0.7%,10px)', marginBottom: 'clamp(4px,0.5%,8px)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px,0.6vw,9px)', color: s.color, letterSpacing: '0.1em' }}>STEP {s.num}</span>
                      <span style={{ padding: 'clamp(2px,0.2%,3px) clamp(6px,0.7%,10px)', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontFamily: 'var(--font-mono)', fontSize: 'clamp(6px,0.55vw,8px)', color: s.color, letterSpacing: '0.06em' }}>{s.tag}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(11px,1.2vw,18px)', fontWeight: 800, color: 'white', letterSpacing: '-0.025em', marginBottom: 'clamp(3px,0.4%,6px)', lineHeight: 1.1 }}>{s.title}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(8px,0.7vw,11.5px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
  
  
          {/* ══════════════════════════════════════════════════════════════════
              BOTTOM BAR — Tech stack + CTA + frame label
              ═════════════════════════════════════════════════════════════════ */}
          <footer style={{ padding: 'clamp(12px,1.5%,20px) clamp(32px,5%,96px)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, position: 'relative', zIndex: 1 }}>
            {/* Tech stack */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px,0.5%,8px)', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(6px,0.55vw,8.5px)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>Built with</span>
              {techStack.map(t => (
                <span key={t.label} style={{ padding: 'clamp(2px,0.3%,4px) clamp(7px,0.7%,11px)', borderRadius: 20, background: t.bg, fontFamily: 'var(--font-mono)', fontSize: 'clamp(6px,0.55vw,8.5px)', fontWeight: 600, color: t.text, whiteSpace: 'nowrap' }}>
                  {t.label}
                </span>
              ))}
            </div>
  
            {/* Frame label (Swiss grid reference) */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(6px,0.55vw,8.5px)', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Frame: Thumbnail · 1920 × 1080 · Desktop / 00-Cover
              </p>
            </div>
  
            {/* Enter kit button */}
            <button onClick={onEnter}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 'clamp(8px,1%,13px) clamp(16px,1.8%,28px)', borderRadius: 'clamp(8px,1vw,12px)', background: '#F59E0B', color: '#1C1917', fontFamily: 'var(--font-display)', fontSize: 'clamp(10px,1vw,14px)', fontWeight: 800, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 4px 20px rgba(245,158,11,0.4)', transition: 'all 0.15s', letterSpacing: '-0.01em' }}>
              Open Kit
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 'clamp(12px,1.1vw,16px)', height: 'clamp(12px,1.1vw,16px)' }}>
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </button>
          </footer>
  
        </div>
      </div>
    )
  }
  