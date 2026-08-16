import { useState } from 'react'
import { Icon } from '../icons'
import { useBranding } from '../config/BrandingContext'
import type { BrandingConfig } from '../config/branding'

type Page = 'home' | 'product' | 'claims' | 'contact' | 'quote' | 'track'
interface Props { onNavigate: (p: Page) => void }

function Eyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: light ? 'rgba(255,255,255,0.1)' : '#EFF6FF', border: `1px solid ${light ? 'rgba(255,255,255,0.2)' : '#BFDBFE'}`, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: light ? 'rgba(255,255,255,0.7)' : '#1D4ED8', textTransform: 'uppercase', marginBottom: 14 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: light ? 'rgba(255,255,255,0.6)' : '#1D4ED8', display: 'inline-block' }} />
      {children}
    </span>
  )
}

// ── Timeline data ─────────────────────────────────────────────────────────────
function getSteps(branding: BrandingConfig) {
  return [
  {
    num: '01', title: 'Incident Occurs',
    color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE',
    icon: Icon.info, timeframe: 'Immediately', actor: 'Policyholder',
    short: 'Document & stay safe',
    desc: 'The moment a covered incident occurs — accident, theft, fire, or flood — ensure everyone is safe first. Photograph the scene thoroughly from multiple angles before anything is moved.',
    actions: [
      'Ensure personal safety — call 199 or 112 if needed',
      'Photograph damage from 4+ angles including wide shots',
      'Gather third-party details (name, plate, phone)',
      'Contact police for road accidents — FRSC report required',
    ],
  },
  {
    num: '02', title: 'Submit Online Claim',
    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    icon: Icon.upload, timeframe: 'Within 24 hrs', actor: 'Policyholder',
    short: 'Log in and file digitally',
    desc: `Log into your ${branding.companyName} dashboard or mobile app and click 'File a Claim.' Select your policy, upload all photos and supporting documents, and submit in under 5 minutes.`,
    actions: [
      "Log in to dashboard or app → 'File a Claim'",
      'Select the affected policy',
      'Choose incident type and enter date/location',
      'Upload photos, police report, and any third-party documents',
    ],
  },
  {
    num: '03', title: 'Claim Acknowledged',
    color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD',
    icon: Icon.check, timeframe: '< 1 hour', actor: branding.companyName,
    short: 'Reference issued instantly',
    desc: 'Our system auto-generates a claim reference number (e.g. CLM-NG-2024-00431) and assigns a dedicated claims handler within 60 minutes. You receive SMS and email confirmation.',
    actions: [
      'Auto-generated reference number sent via SMS + email',
      'Dedicated claims handler assigned',
      'Claim visible in dashboard with live tracking',
      'Handler contacts you within 1 hour to confirm receipt',
    ],
  },
  {
    num: '04', title: 'Assessment',
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
    icon: Icon.search, timeframe: '4 – 12 hrs', actor: branding.companyName,
    short: 'Desktop or physical review',
    desc: 'A licensed assessor reviews your evidence. For vehicle claims above ₦500,000, a physical inspection is scheduled at the nearest approved panel beater. You are notified of the inspection slot by SMS.',
    actions: [
      'Claims handler reviews all submitted photos and documents',
      'Desktop assessment for claims under ₦500,000',
      'Physical inspection scheduled for major claims',
      'Assessment report compiled within SLA window',
    ],
  },
  {
    num: '05', title: 'Decision',
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
    icon: Icon.award, timeframe: '12 – 24 hrs', actor: branding.companyName,
    short: 'Transparent written outcome',
    desc: 'The claims committee reviews the assessor\'s report and issues a formal decision — approved, approved with adjustment, or rejected — with a written explanation for every outcome.',
    actions: [
      'Claims committee formal review',
      'Settlement amount calculated and communicated',
      'Written decision sent via email with full breakdown',
      'Approval letter generated for policyholder records',
    ],
  },
  {
    num: '06', title: 'Settlement Paid',
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
    icon: Icon.dollar, timeframe: '24 – 48 hrs', actor: branding.companyName,
    short: 'Direct bank transfer',
    desc: "Settlement is transferred directly to your registered Nigerian bank account via NEFT/NIP within 48 hours of approval. For vehicle repairs, payment goes directly to the approved panel beater.",
    actions: [
      'NEFT/NIP transfer initiated within 24 hours of approval',
      'SMS confirmation with transfer reference number',
      'Funds in your account within 24–48 hours',
      'Claim closed and archived in your dashboard',
    ],
  },
  ]
}
// ── Claim Tracker widget ──────────────────────────────────────────────────────
function ClaimTracker() {
  const events = [
    { label: 'Filed', time: '18 Nov 10:42', done: true, active: false },
    { label: 'Acknowledged', time: '18 Nov 10:47', done: true, active: false },
    { label: 'Under Assessment', time: '18 Nov 12:15', done: true, active: false },
    { label: 'Assessment Done', time: '18 Nov 17:30', done: true, active: false },
    { label: 'Decision Pending', time: 'In progress', done: false, active: true },
    { label: 'Settlement', time: 'Awaiting', done: false, active: false },
  ]

  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Live Claim Tracker</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'white', letterSpacing: '0.04em' }}>CLM-NG-2024-00431</p>
          </div>
          <div style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.35)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#FCD34D', letterSpacing: '0.08em' }}>● IN PROGRESS</span>
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Motor Comprehensive · POL-NG-2024-00847</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>Filed: 18 Nov 2024, 10:42 AM</p>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {events.map((ev, i) => (
          <div key={ev.label} style={{ display: 'flex', gap: 14, marginBottom: i < events.length - 1 ? 4 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 26, flexShrink: 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                background: ev.active ? '#FBBF24' : ev.done ? '#22C55E' : 'rgba(255,255,255,0.1)',
                border: `2px solid ${ev.active ? '#FBBF24' : ev.done ? '#22C55E' : 'rgba(255,255,255,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ev.done && !ev.active && <div style={{ width: 10, height: 10, color: 'white' }}>{Icon.check}</div>}
                {ev.active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1C1917' }} />}
                {!ev.done && !ev.active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />}
              </div>
              {i < events.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 20, marginTop: 2, marginBottom: 2, borderRadius: 1, background: ev.done ? '#22C55E' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
            <div style={{ paddingBottom: i < events.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: ev.active ? 700 : 500, color: ev.done || ev.active ? 'white' : 'rgba(255,255,255,0.35)' }}>{ev.label}</p>
                {ev.active && <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', fontFamily: 'var(--font-mono)', fontSize: 8, color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Now</span>}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{ev.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Track My Claim</button>
        <button style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>Contact Handler</button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClaimsPage({ onNavigate }: Props) {
  const [activeStep, setActiveStep] = useState<number>(0)
  const { branding } = useBranding()
  const steps = getSteps(branding)
  const step = steps[activeStep]

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ background: '#060F2A', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '0', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1.2px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div className="max-w-[1200px] mx-auto" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 60, alignItems: 'center', position: 'relative' }}>
          <div>
            <Eyebrow light>Claims Process</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,4vw,52px)', letterSpacing: '-0.045em', color: 'white', lineHeight: 1.05, marginBottom: 18 }}>
              Valid claims paid<br />
              <span style={{ background: 'linear-gradient(90deg, #34D399, #22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>within 24 hours.</span>
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 36, maxWidth: 460 }}>
              Every step documented. Every timeframe committed. Every decision explained in writing. This is our promise to every Nigerian policyholder.
            </p>

            {/* KPI trio */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { val: '< 1 hr', label: 'Acknowledgement', icon: '⚡' },
                { val: '24 hrs', label: 'Most claims resolved', icon: '✅' },
                { val: '98.1%', label: 'Valid claims paid', icon: '🏆' },
              ].map(s => (
                <div key={s.label} style={{ padding: '18px 22px', background: 'rgba(255,255,255,0.07)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <p style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 3 }}>{s.val}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ClaimTracker />
          </div>
        </div>
      </section>

      {/* ── Interactive timeline ─────────────────────────────── */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div className="max-w-[1200px] mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Eyebrow>Step-by-Step Process</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,40px)', fontWeight: 800, letterSpacing: '-0.035em', color: '#0F172A', lineHeight: 1.1, marginBottom: 16 }}>
              Complete transparency at every stage
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#64748B', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
              Click any step to see exactly what happens, who does it, and how long it takes.
            </p>
          </div>

          {/* ── Step selector strip ── */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 40, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {steps.map((s, i) => (
              <button key={s.num} onClick={() => setActiveStep(i)}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 14px', borderRadius: 16, border: `2px solid ${activeStep === i ? s.color : 'var(--border)'}`,
                  background: activeStep === i ? s.bg : 'white', cursor: 'pointer', transition: 'all 0.25s', minWidth: 130,
                  boxShadow: activeStep === i ? `0 8px 24px ${s.color}22` : 'none',
                }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: activeStep === i ? s.color : s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeStep === i ? 'white' : s.color, transition: 'all 0.25s' }}>
                  <div style={{ width: 22, height: 22 }}>{s.icon}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: s.color, letterSpacing: '0.1em', marginBottom: 3 }}>STEP {s.num}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{s.title}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', marginTop: 3 }}>{s.timeframe}</p>
                </div>
              </button>
            ))}
          </div>

          {/* ── Active step detail ── */}
          <div style={{ background: step.bg, borderRadius: 24, border: `2px solid ${step.border}`, padding: '40px 44px', transition: 'all 0.3s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
              {/* Left */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 8px 20px ${step.color}40` }}>
                    <div style={{ width: 28, height: 28 }}>{step.icon}</div>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: step.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Step {step.num}</p>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>{step.title}</h3>
                  </div>
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#334155', lineHeight: 1.8, marginBottom: 24 }}>{step.desc}</p>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ padding: '7px 16px', borderRadius: 20, background: step.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'white', fontWeight: 600, letterSpacing: '0.06em' }}>{step.timeframe}</span>
                  </div>
                  <div style={{ padding: '7px 16px', borderRadius: 20, background: 'rgba(0,0,0,0.06)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#475569', letterSpacing: '0.06em' }}>{step.actor}</span>
                  </div>
                </div>
              </div>

              {/* Right: actions */}
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>Key actions at this stage</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {step.actions.map((action, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: '12px 14px', backdropFilter: 'blur(4px)' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 11, height: 11, color: 'white' }}>{Icon.check}</div>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#334155', lineHeight: 1.55 }}>{action}</p>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  {activeStep > 0 && (
                    <button onClick={() => setActiveStep(i => i - 1)}
                      style={{ padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${step.border}`, background: 'white', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 14, height: 14, transform: 'rotate(180deg)' }}>{Icon.arrow}</div>
                      Previous
                    </button>
                  )}
                  {activeStep < steps.length - 1 && (
                    <button onClick={() => setActiveStep(i => i + 1)}
                      style={{ padding: '10px 20px', borderRadius: 10, background: step.color, color: 'white', border: 'none', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Next Step <div style={{ width: 14, height: 14 }}>{Icon.arrow}</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full process list (scannable) ────────────────────── */}
      <section style={{ background: '#F8FAFC', padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Eyebrow>Full Process</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.8vw,34px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.15, marginBottom: 12 }}>All six steps at a glance</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ padding: '28px', borderRight: (i + 1) % 3 !== 0 ? '1px solid var(--border)' : 'none', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                    <div style={{ width: 20, height: 20 }}>{s.icon}</div>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: s.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step {s.num}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{s.title}</p>
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B', lineHeight: 1.65, marginBottom: 10 }}>{s.short}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 10, background: s.bg, fontFamily: 'var(--font-mono)', fontSize: 9, color: s.color, border: `1px solid ${s.border}` }}>{s.timeframe}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 10, background: '#F1F5F9', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B' }}>{s.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tips ─────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Eyebrow>Claims Tips</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.8vw,34px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.1, marginBottom: 12 }}>
              How to maximise your claim
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { emoji: '📸', title: 'Take comprehensive photos', body: 'Photograph from 4+ angles. Close-up damage shots AND wide scene views. Include timestamps if your phone supports it. Photos taken in the first hour carry the most evidential weight.' },
              { emoji: '🚔', title: 'Always file a police report', body: 'For road accidents, get a police/FRSC report within 24 hours. This is legally required for comprehensive claims and significantly accelerates processing.' },
              { emoji: '⏰', title: 'Report within 24 hours', body: 'Delayed reporting can compromise your claim. Call our 24/7 hotline or use the app immediately after the incident. Early notification protects your rights.' },
              { emoji: '📋', title: 'Keep all receipts and quotes', body: 'For property and health claims, retain every receipt, medical invoice, and repair estimate. Clear phone photos of receipts are accepted if originals are unavailable.' },
              { emoji: '⚖️', title: "Don't admit liability", body: "Never admit fault at the scene. This is standard insurance protocol worldwide. Your insurer handles liability determination — premature admissions can compromise your claim." },
              { emoji: '📞', title: 'You have appeal rights', body: `Rejected claims can be appealed within 30 days. You may also escalate to the NAICOM Ombudsman at zero cost. ${branding.companyName} supports all policyholders through the appeals process.` },
            ].map(t => (
              <div key={t.title} style={{ background: '#F8FAFC', borderRadius: 16, padding: '24px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{t.emoji}</span>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{t.title}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B', lineHeight: 1.65 }}>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rights + Contacts ────────────────────────────────── */}
      <section style={{ background: '#060F2A', padding: '80px 24px' }}>
        <div className="max-w-[1200px] mx-auto" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
          <div>
            <Eyebrow light>Policyholder Rights</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
              We're held accountable by NAICOM
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 24 }}>
              {branding.companyName} is regulated by the National Insurance Commission. If you're dissatisfied with any claims decision, you have the legal right to escalate — always free of charge.
            </p>
            {[
              { step: 'Step 1', label: 'Internal Appeal', val: 'Submit your appeal within 30 days of the decision. Our Head of Claims responds in writing within 5 business days.' },
              { step: 'Step 2', label: 'NAICOM Ombudsman', val: 'File a free complaint at complaints@naicom.gov.ng. NAICOM mediates between you and the insurer.' },
              { step: 'Step 3', label: 'Federal High Court', val: `Final legal recourse under Nigerian insurance law. ${branding.companyName} fully cooperates with all court proceedings.` },
            ].map((r, i) => (
              <div key={r.label} style={{ display: 'flex', gap: 14, marginBottom: i < 2 ? 18 : 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(29,78,216,0.3)', border: '1px solid rgba(29,78,216,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#60A5FA', fontWeight: 600 }}>{i + 1}</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{r.label}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{r.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '📞', title: 'Claims Hotline', sub: `${branding.supportPhone} · 24/7 toll-free`, b: 'rgba(29,78,216,0.2)', bc: 'rgba(29,78,216,0.35)' },
              { icon: '💬', title: 'WhatsApp Claims', sub: `${branding.whatsapp} · replies < 10 min`, b: 'rgba(22,163,74,0.15)', bc: 'rgba(22,163,74,0.3)' },
              { icon: '📧', title: 'Email Claims Team', sub: branding.claimsEmail, b: 'rgba(124,58,237,0.15)', bc: 'rgba(124,58,237,0.3)' },
              { icon: '🏛️', title: 'NAICOM Ombudsman', sub: 'complaints@naicom.gov.ng · Free', b: 'rgba(217,119,6,0.15)', bc: 'rgba(217,119,6,0.3)' },
            ].map(c => (
              <div key={c.title} style={{ padding: '18px 20px', borderRadius: 16, background: c.b, border: `1px solid ${c.bc}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'white' }}>{c.title}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#EFF6FF', padding: '60px 24px', borderTop: '1px solid #BFDBFE' }}>
        <div className="max-w-[1200px] mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', marginBottom: 8 }}>Need to file a claim now?</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#475569' }}>Submit in under 3 minutes via our app or dashboard.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '14px 28px', borderRadius: 12, background: '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,78,216,0.35)' }}>
              File a Claim
            </button>
            <button onClick={() => onNavigate('contact')} style={{ padding: '14px 20px', borderRadius: 12, border: '1.5px solid #BFDBFE', background: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
              Talk to Claims Team
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
