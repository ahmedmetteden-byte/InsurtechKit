import { useState, useEffect, useRef } from 'react'
import { Icon } from '../icons'
import { useBranding } from '../config/BrandingContext'

type Page = 'home' | 'product' | 'claims' | 'contact' | 'quote' | 'track'
interface Props { onNavigate: (p: Page) => void }

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = target / 60
        const timer = setInterval(() => {
          start = Math.min(start + step, target)
          setVal(Math.round(start))
          if (start >= target) clearInterval(timer)
        }, 16)
        obs.disconnect()
      }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{prefix}{val.toLocaleString('en-NG')}{suffix}</span>
}

// ── Section chrome ────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 14 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D4ED8', display: 'inline-block' }} />
      {children}
    </span>
  )
}

function H2({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.2vw,42px)', fontWeight: 800, letterSpacing: '-0.035em', color: '#0F172A', lineHeight: 1.1, marginBottom: 16, textAlign: center ? 'center' : 'left' }}>
      {children}
    </h2>
  )
}

function Lead({ children, center = false }: { children: string; center?: boolean }) {
  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: '#64748B', lineHeight: 1.75, maxWidth: 560, textAlign: center ? 'center' : 'left', margin: center ? '0 auto' : undefined }}>
      {children}
    </p>
  )
}

// ── HERO ─────────────────────────────────────────────────────────────────────

function Hero({ onNavigate }: Props) {
  const [email, setEmail] = useState('')

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#060F2A' }}>
      {/* Radial glow */}
      <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.30) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 60%)', pointerEvents: 'none' }} />
      {/* Dot field */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1.2px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div className="max-w-[1200px] mx-auto px-6 w-full" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: '92vh', alignItems: 'center', paddingTop: 80, paddingBottom: 80, position: 'relative' }}>

        {/* ── LEFT copy ─────────────────────── */}
        <div style={{ paddingRight: 40 }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: '#86EFAC' }}>NAICOM LICENSED · 180,000+ POLICYHOLDERS</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px,4.8vw,64px)', letterSpacing: '-0.045em', lineHeight: 1.0, color: 'white', marginBottom: 24 }}>
            Insurance built<br />
            for every<br />
            <span style={{ background: 'linear-gradient(90deg, #60A5FA 0%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nigerian.</span>
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, marginBottom: 36, maxWidth: 420 }}>
            Get motor, health, and home coverage in minutes — no agents, no paperwork. Instant NAICOM-approved certificates delivered to your phone.
          </p>

          {/* CTA bar */}
          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '6px', marginBottom: 22, maxWidth: 460, border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email to get started"
              style={{ flex: 1, padding: '13px 16px', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 14, color: 'white', background: 'transparent', borderRadius: 10 }}
            />
            <button
              onClick={() => onNavigate('product')}
              style={{ padding: '13px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(29,78,216,0.5)', transition: 'all 0.2s' }}>
              Get Instant Quote
            </button>
          </div>

          {/* Trust pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {['No credit card', '5-min certificate', 'Cancel anytime', '24hr claims'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.48)' }}>
                <div style={{ width: 13, height: 13, color: '#22C55E' }}>{Icon.check}</div>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT visual ───────────────────── */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Background glow ring */}
          <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%)' }} />

          {/* Image card */}
          <div style={{ position: 'relative', width: 360, height: 460, borderRadius: 28, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img
              src="https://images.unsplash.com/photo-1584012961487-006d0c5c3c99?w=720&h=920&fit=crop&auto=format"
              alt="Nigerian professional reviewing insurance"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,15,42,0.85) 0%, rgba(6,15,42,0.1) 60%)' }} />

            {/* Bottom info */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 18, height: 18, color: 'white' }}>{Icon.check}</div>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'white' }}>Policy Active</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>Motor Comprehensive · ₦42,000/yr</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat cards */}
          <div style={{ position: 'absolute', left: -30, top: '20%', background: 'white', borderRadius: 16, padding: '14px 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.8)', minWidth: 150 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Claims paid out</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>₦4.2B+</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#16A34A', marginTop: 3 }}>↑ 38% this year</p>
          </div>

          <div style={{ position: 'absolute', right: -20, top: '40%', background: 'white', borderRadius: 16, padding: '14px 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.8)', minWidth: 150 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Avg. claim time</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>18 hrs</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#16A34A', marginTop: 3 }}>Industry avg: 7 days</p>
          </div>

          <div style={{ position: 'absolute', right: 10, bottom: '12%', background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 8px 28px rgba(29,78,216,0.5)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>⭐</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'white' }}>4.9 / 5.0</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>2,341 REVIEWS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,24 C400,48 1040,0 1440,24 L1440,48 L0,48 Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  )
}

// ── TRUST BAND ────────────────────────────────────────────────────────────────

function TrustBand() {
  const stats = [
    { val: 180000, prefix: '', suffix: '+', label: 'Active Policyholders', icon: Icon.users },
    { val: 4, prefix: '₦', suffix: 'B+ Paid', label: 'Claims Settled', icon: Icon.dollar },
    { val: 18, prefix: '', suffix: ' hrs', label: 'Average Claim', icon: Icon.clock },
    { val: 984, prefix: '', suffix: '%', label: 'Satisfaction Rate', icon: Icon.star },
    { val: 36, prefix: '', suffix: ' States', label: 'Nationwide', icon: Icon.globe },
  ]
  return (
    <section style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
      <div className="max-w-[1200px] mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ padding: '28px 20px', textAlign: 'center', borderRight: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                <div style={{ width: 18, height: 18 }}>{s.icon}</div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1, marginBottom: 5 }}>
              {s.label === 'Satisfaction Rate'
                ? <span>98.4<span style={{ fontSize: 16 }}>%</span></span>
                : s.label === 'Claims Settled'
                  ? <span>₦4.2<span style={{ fontSize: 16 }}>B+</span></span>
                  : <AnimatedNumber target={s.val} prefix={s.prefix} suffix={s.suffix} />
              }
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── COVERAGE PLANS ────────────────────────────────────────────────────────────

function CoveragePlans({ onNavigate }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const plans = [
    {
      id: 'health', label: 'Health Insurance', icon: Icon.heart,
      color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
      img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=360&fit=crop&auto=format',
      tag: 'Most Popular',
      tagColor: '#16A34A',
      sub: 'Comprehensive medical care for individuals and families at 800+ hospitals.',
      features: ['Inpatient & outpatient care', 'Maternity & newborn cover', 'Emergency evacuation', 'Dental & optical benefits'],
      from: '₦6,500', period: '/month',
    },
    {
      id: 'motor', label: 'Motor Insurance', icon: Icon.car,
      color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE',
      img: 'https://images.unsplash.com/photo-1583429891508-015ef9cd958e?w=600&h=360&fit=crop&auto=format',
      tag: 'MVTPI Compliant',
      tagColor: '#1D4ED8',
      sub: 'Third-party and comprehensive cover meeting all NAICOM requirements.',
      features: ['Third-party liability', 'Comprehensive own-damage', 'Fire, theft & flood', '24/7 roadside assistance'],
      from: '₦1,250', period: '/month',
    },
    {
      id: 'home', label: 'Home Insurance', icon: Icon.home,
      color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
      img: 'https://images.unsplash.com/photo-1577896849786-738ed6c78bd3?w=600&h=360&fit=crop&auto=format',
      tag: null, tagColor: '',
      sub: 'Protect your property, contents, and household against every risk.',
      features: ['Building & structure cover', 'Contents & valuables', 'Burglary & vandalism', 'Water damage & flood'],
      from: '₦2,625', period: '/month',
    },
  ]

  return (
    <section style={{ background: '#F8FAFC', padding: '100px 24px' }}>
      <div className="max-w-[1200px] mx-auto">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Eyebrow>Popular Coverage Plans</Eyebrow>
          <H2 center>Built for every Nigerian household</H2>
          <Lead center>NAICOM-approved plans, digital certificates in 5 minutes, 24/7 claims support.</Lead>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {plans.map(p => (
            <div
              key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: 'white', borderRadius: 22, overflow: 'hidden',
                border: `2px solid ${hovered === p.id ? p.color : 'transparent'}`,
                boxShadow: hovered === p.id ? `0 20px 60px ${p.color}1a` : '0 2px 16px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease', cursor: 'default', transform: hovered === p.id ? 'translateY(-6px)' : 'none',
              }}>

              {/* Photo header */}
              <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: p.bg }}>
                <img src={p.img} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered === p.id ? 'scale(1.05)' : 'scale(1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55))` }} />
                {p.tag && (
                  <div style={{ position: 'absolute', top: 14, left: 14, padding: '4px 12px', borderRadius: 20, background: p.tagColor, color: 'white', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', fontWeight: 500 }}>
                    {p.tag}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <div style={{ width: 18, height: 18 }}>{p.icon}</div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'white' }}>{p.label}</p>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 22px 24px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B', lineHeight: 1.65, marginBottom: 18 }}>{p.sub}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, flexShrink: 0 }}>
                        <div style={{ width: 9, height: 9 }}>{Icon.check}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#334155' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 18 }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>From</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: p.color }}>{p.from}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#94A3B8' }}>{p.period}</span>
                    </div>
                  </div>
                  <button onClick={() => onNavigate('product')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', borderRadius: 10, background: p.color, color: 'white', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: `0 4px 12px ${p.color}40` }}>
                    Get Quote <span style={{ width: 14, height: 14 }}>{Icon.arrow}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button onClick={() => onNavigate('product')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            View all 12 coverage types <span style={{ width: 16, height: 16 }}>{Icon.chevRight}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────

function HowItWorks({ onNavigate }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const { branding } = useBranding()

  const steps = [
    {
      num: '01', color: '#1D4ED8', bg: '#EFF6FF', icon: Icon.search,
      title: 'Choose your coverage',
      desc: 'Browse motor, health, home, life, or business plans. Compare side-by-side with full pricing in Naira — no surprises, no hidden fees.',
      time: '~2 minutes',
    },
    {
      num: '02', color: '#16A34A', bg: '#F0FDF4', icon: Icon.dollar,
      title: 'Get an instant quote',
      desc: 'Answer a few questions about your vehicle, household, or health needs. Our engine generates a personalised Naira premium in seconds.',
      time: '~1 minute',
    },
    {
      num: '03', color: '#7C3AED', bg: '#F5F3FF', icon: Icon.zap,
      title: 'Pay securely online',
      desc: 'Pay by card, bank transfer, or USSD — all protected by 256-bit SSL through CBN-approved payment gateways. Monthly or annual options.',
      time: '~2 minutes',
    },
    {
      num: '04', color: '#D97706', bg: '#FFFBEB', icon: Icon.award,
      title: 'Receive your certificate',
      desc: "Your NAICOM-approved digital certificate arrives via email and SMS immediately. Valid, legal, and ready for FRSC checkpoints.",
      time: 'Instant',
    },
  ]

  return (
    <section style={{ background: 'white', padding: '100px 24px', overflow: 'hidden' }}>
      <div className="max-w-[1200px] mx-auto">
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 80, alignItems: 'center' }}>

          {/* Left sticky text */}
          <div>
            <Eyebrow>How It Works</Eyebrow>
            <H2>From quote to certificate in under 5 minutes</H2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#64748B', lineHeight: 1.75, marginBottom: 32 }}>
              {branding.companyName} removes every friction point from traditional insurance. No brokers, no offices, no waiting — just fast, transparent digital cover.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => onNavigate('product')} style={{ padding: '13px 24px', borderRadius: 10, background: '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,78,216,0.35)' }}>
                Start Now
              </button>
              <button onClick={() => onNavigate('claims')} style={{ padding: '13px 20px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                Claims Process
              </button>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 32 }}>
              {[
                { val: '5 min', label: 'To get covered' },
                { val: '24hrs', label: 'Claim resolution' },
                { val: '0', label: 'Office visits needed' },
                { val: '100%', label: 'Digital process' },
              ].map(s => (
                <div key={s.label} style={{ padding: '14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#1D4ED8', marginBottom: 3 }}>{s.val}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: interactive steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((s, i) => (
              <button key={s.num} onClick={() => setActiveStep(i)}
                style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 16, alignItems: 'center',
                  padding: '20px 22px', borderRadius: 16, border: `2px solid ${activeStep === i ? s.color : 'var(--border)'}`,
                  background: activeStep === i ? s.bg : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s',
                  boxShadow: activeStep === i ? `0 8px 24px ${s.color}18` : 'none',
                }}>
                {/* Icon */}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: activeStep === i ? s.color : s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeStep === i ? 'white' : s.color, transition: 'all 0.25s' }}>
                  <div style={{ width: 24, height: 24 }}>{s.icon}</div>
                </div>
                {/* Text */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, letterSpacing: '0.1em', fontWeight: 600 }}>{s.num}</span>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{s.title}</h4>
                  </div>
                  {activeStep === i && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#475569', lineHeight: 1.65, marginTop: 4 }}>{s.desc}</p>
                  )}
                </div>
                {/* Time badge */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap', border: `1px solid ${s.color}30` }}>{s.time}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────

function Testimonials() {
  const { branding } = useBranding()
  const reviews = [
    {
      name: 'Emeka Okafor', role: 'Business Owner', location: 'Lagos Island',
      quote: `Filed my motor claim after an accident on the Third Mainland Bridge. ${branding.companyName} processed it in under 18 hours. I've never experienced anything like it with insurance in Nigeria.`,
      rating: 5, product: 'Motor — Comprehensive', color: '#1D4ED8', initials: 'EO',
    },
    {
      name: 'Fatima Aliyu', role: 'Civil Servant', location: 'Abuja FCT',
      quote: "Bought a family health plan in under 7 minutes. My daughter needed surgery and the hospital was fully covered. The app tracked the claim in real time — amazing transparency.",
      rating: 5, product: 'Health — Family Plan', color: '#16A34A', initials: 'FA',
    },
    {
      name: 'Chukwuebuka Nze', role: 'Engineer', location: 'Port Harcourt',
      quote: "Very sceptical about online insurance but the NAICOM certificate arrived in 4 minutes. Professional platform, WhatsApp support responds in under 5 minutes.",
      rating: 5, product: 'Motor — Third-Party', color: '#7C3AED', initials: 'CN',
    },
    {
      name: 'Ngozi Adeyemi', role: 'Entrepreneur', location: 'Ibadan, Oyo',
      quote: "The pricing calculator is completely transparent. I could compare third-party vs comprehensive and see exactly what I'm paying for. Finally, insurance that treats Nigerians with respect.",
      rating: 5, product: 'Home — Property Cover', color: '#D97706', initials: 'NA',
    },
  ]

  return (
    <section style={{ background: '#F8FAFC', padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1200px] mx-auto">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Eyebrow>Customer Stories</Eyebrow>
          <H2 center>Trusted across all 36 states</H2>
          <Lead center>Real policyholders, real outcomes. Unedited reviews from Nigerians who've claimed.</Lead>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {reviews.map(r => (
            <div key={r.name} style={{ background: 'white', borderRadius: 20, padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {Array(r.rating).fill(0).map((_, i) => <span key={i} style={{ width: 14, height: 14, color: '#F59E0B' }}>{Icon.star}</span>)}
              </div>
              {/* Quote */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: '#334155', lineHeight: 1.7, marginBottom: 'auto', paddingBottom: 18, fontStyle: 'italic' }}>
                "{r.quote}"
              </p>
              {/* Divider */}
              <div style={{ height: 1, background: '#F1F5F9', marginBottom: 16 }} />
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: r.color }}>{r.initials}</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{r.name}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#94A3B8' }}>{r.role} · {r.location}</p>
                </div>
              </div>
              {/* Product tag */}
              <div style={{ marginTop: 10, display: 'inline-flex' }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, background: r.color + '12', fontFamily: 'var(--font-mono)', fontSize: 10, color: r.color, border: `1px solid ${r.color}25` }}>{r.product}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── APP DOWNLOAD CTA ──────────────────────────────────────────────────────────

function AppBanner({ onNavigate: _onNavigate }: Props) {
  const { branding } = useBranding()
  return (
    <section style={{ background: '#060F2A', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '5%', top: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.25) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div className="max-w-[1200px] mx-auto" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative' }}>
        <div>
          <Eyebrow>Mobile App</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px,3vw,40px)', letterSpacing: '-0.035em', color: 'white', lineHeight: 1.15, marginBottom: 18 }}>
            Manage your cover<br />from anywhere in Nigeria.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 32 }}>
            File claims with photos, download certificates, chat with your agent, and track renewal dates — all from your phone. Works on 2G and 3G networks.
          </p>
          <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Download on the App Store', sub: 'iOS 14+', bg: 'white', color: '#0F172A' },
              { label: 'Get it on Google Play', sub: 'Android 8+', bg: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' },
            ].map(btn => (
              <button key={btn.label} style={{ padding: '12px 20px', borderRadius: 12, background: btn.bg, color: btn.color, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, border: btn.border ?? 'none', cursor: 'pointer' }}>
                {btn.label}
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 2, opacity: 0.6, fontWeight: 400 }}>{btn.sub}</p>
              </button>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
            4.9★ · 24,800+ ratings · Available in Hausa, Yoruba, Igbo & English
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          {/* Phone mockup */}
          {[1, 2].map(n => (
            <div key={n} style={{ width: 180, height: 340, borderRadius: 28, background: '#1E293B', border: '3px solid #334155', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', overflow: 'hidden', transform: n === 1 ? 'rotate(-4deg) translateY(10px)' : 'rotate(4deg) translateY(-10px)', flexShrink: 0 }}>
              <div style={{ height: 20, background: '#0F172A', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 4 }}>
                <div style={{ width: 60, height: 4, borderRadius: 2, background: '#334155' }} />
              </div>
              <div style={{ padding: '12px', height: '100%', background: 'linear-gradient(160deg, #1E3A8A 0%, #1D4ED8 50%, #15803D 100%)' }}>
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'white' }}>{branding.companyName}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>Policy #{n === 1 ? '00847' : '01203'}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>COVERAGE</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: 'white' }}>{n === 1 ? 'Motor' : 'Health'}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: '#86EFAC' }}>● Active</p>
                </div>
                <div style={{ height: 40, background: 'rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 6 }} />
                <div style={{ height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── PARTNERS ──────────────────────────────────────────────────────────────────

function Partners() {
  const names = ['AXA Mansard', 'Leadway Assurance', 'AIICO Insurance', 'FBN Insurance', 'ARM Life', 'Coronation Insurance', 'NEM Insurance', 'Custodian Life']
  return (
    <section style={{ background: 'white', padding: '48px 24px', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-[1200px] mx-auto">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: '#94A3B8', textAlign: 'center', marginBottom: 24, textTransform: 'uppercase' }}>
          Underwritten by Nigeria's most trusted insurers
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {names.map(n => (
            <div key={n} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: '#F8FAFC' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#475569' }}>{n}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage({ onNavigate }: Props) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <TrustBand />
      <CoveragePlans onNavigate={onNavigate} />
      <HowItWorks onNavigate={onNavigate} />
      <Testimonials />
      <AppBanner onNavigate={onNavigate} />
      <Partners />
    </>
  )
}
