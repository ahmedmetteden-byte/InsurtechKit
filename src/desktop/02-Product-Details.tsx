import { useState } from 'react'
import { Icon } from '../icons'
import { branding } from '../config/branding'

type Page = 'home' | 'product' | 'claims' | 'contact'
interface Props { onNavigate: (p: Page) => void }

// ── Primitives ────────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 14 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D4ED8', display: 'inline-block' }} />
      {children}
    </span>
  )
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.8vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.15, marginBottom: 12 }}>{children}</h2>
}

// ── Product definitions ───────────────────────────────────────────────────────
const products = [
  {
    id: 'motor', label: 'Motor', fullLabel: 'Motor Insurance', icon: Icon.car, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE',
    img: 'https://images.unsplash.com/photo-1583429891508-015ef9cd958e?w=1200&h=500&fit=crop&auto=format',
    headline: 'Drive with confidence across Nigeria',
    sub: 'NAICOM-compliant third-party and comprehensive motor insurance — meeting all MVTPI Act requirements with instant digital certificates.',
    minPremium: '₦2,100/mo',
    included: [
      { cat: 'Liability', items: ['Third-party bodily injury liability', 'Third-party property damage (up to ₦3,000,000)', 'Uninsured motorist protection'] },
      { cat: 'Vehicle Damage', items: ['Comprehensive own-damage cover', 'Windscreen and glass replacement', 'Natural disaster (flood, wind, hail)', 'Fire and self-ignition damage'] },
      { cat: 'Theft & Security', items: ['Vehicle theft and attempted theft', 'Carjacking cover', 'Catalytic converter theft (endorsed)'] },
      { cat: 'Assistance', items: ['24/7 roadside assistance nationwide', 'Emergency towing up to 100km', 'Emergency medical expenses (₦500,000)', 'Personal accident — driver & passengers'] },
    ],
    excluded: ['Mechanical or electrical breakdown', 'Wear, tear, and depreciation', 'DUI/intoxication incidents', 'Use outside Nigeria without endorsement', 'Carrying illegal goods', 'Consequential losses'],
  },
  {
    id: 'health', label: 'Health', fullLabel: 'Health Insurance', icon: Icon.heart, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
    img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=500&fit=crop&auto=format',
    headline: 'Complete medical cover for every Nigerian family',
    sub: 'Access 800+ hospitals nationwide. Individual and family plans designed for Nigeria\'s healthcare realities — from Lagos clinics to rural health centres.',
    minPremium: '₦6,500/mo',
    included: [
      { cat: 'Primary Care', items: ['Outpatient consultations (unlimited visits)', 'General practitioner visits', 'Specialist referrals', 'Laboratory tests & diagnostics'] },
      { cat: 'Inpatient', items: ['Hospital admission & room charges', 'Surgical procedures', 'ICU/HDU care', 'Post-operative care and physiotherapy'] },
      { cat: 'Maternity', items: ['Antenatal care & delivery', 'Caesarean section cover', 'Newborn care (first 30 days)', 'Postnatal check-ups'] },
      { cat: 'Ancillary', items: ['Dental & optical benefits', 'Prescribed medication (formulary)', 'Emergency ambulance', 'Medical evacuation (domestic)'] },
    ],
    excluded: ['Pre-existing conditions (12-month waiting period)', 'Cosmetic procedures', 'Experimental treatments', 'Self-inflicted injuries', 'War and civil commotion'],
  },
  {
    id: 'home', label: 'Home', fullLabel: 'Home Insurance', icon: Icon.home, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    img: 'https://images.unsplash.com/photo-1577896849786-738ed6c78bd3?w=1200&h=500&fit=crop&auto=format',
    headline: 'Protect your most valuable asset',
    sub: 'Buildings and contents insurance tailored for Nigerian properties — covering armed robbery, flooding, fire, and structural damage.',
    minPremium: '₦2,625/mo',
    included: [
      { cat: 'Building', items: ['Structure and walls (rebuild cost)', 'Roof and ceiling damage', 'Fixed plumbing and electrical', 'Garage and outbuildings'] },
      { cat: 'Contents', items: ['Furniture and household items', 'Electronics and appliances', 'Clothing and personal effects', 'Jewellery (up to ₦500,000)'] },
      { cat: 'Perils', items: ['Fire and explosion', 'Flooding and water damage', 'Armed robbery and burglary', 'Accidental damage (endorsed)'] },
      { cat: 'Liability', items: ['Occupiers liability', 'Domestic staff injury', 'Guest injury cover', 'Third-party property damage'] },
    ],
    excluded: ['Normal wear and tear', 'Electrical/mechanical breakdown (appliances)', 'Damage by insects or pests', 'War and civil disorder', 'Cash, cheques, and documents'],
  },
]

// ── Pricing Calculator ────────────────────────────────────────────────────────
function PricingCalculator({ productId }: { productId: string }) {
  const [coverType, setCoverType] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [sliderVal, setSliderVal] = useState(5000000)
  const [age, setAge] = useState(4)
  const [state, setState] = useState('Lagos')
  const [stateOpen, setStateOpen] = useState(false)

  const states = ['Lagos','Abuja FCT','Rivers','Kano','Oyo','Delta','Enugu','Ogun','Anambra','Kaduna','Kwara','Ondo','Edo','Imo','Plateau']
  const stateRate: Record<string, number> = { Lagos: 1.0, 'Abuja FCT': 0.95, Rivers: 1.05, Kano: 0.88, Oyo: 0.92 }
  const m = stateRate[state] ?? 0.9

  const tiers = { basic: 0.03, standard: 0.05, premium: 0.075 }
  const baseRate = tiers[coverType]
  const ageFactor = Math.max(0.65, 1 - age * 0.02)

  let annual = 0
  if (productId === 'motor') {
    annual = Math.round(sliderVal * baseRate * ageFactor * m)
  } else if (productId === 'health') {
    annual = Math.round(sliderVal * 0.08 * (coverType === 'premium' ? 1.4 : coverType === 'standard' ? 1.0 : 0.7) * m)
  } else {
    annual = Math.round(sliderVal * 0.025 * (coverType === 'premium' ? 1.3 : coverType === 'standard' ? 1.0 : 0.75) * m)
  }

  const monthly = Math.round(annual / 12)
  const fmt = (n: number) => '₦' + n.toLocaleString('en-NG')

  const sliderLabel = productId === 'motor' ? 'Vehicle Market Value' : productId === 'health' ? 'Estimated Annual Income' : 'Property Rebuild Value'

  return (
    <div style={{ background: 'white', borderRadius: 22, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.07)', position: 'sticky', top: 88 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 18, height: 18, color: '#60A5FA' }}>{Icon.zap}</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>Instant Quote Calculator</p>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>No personal data required · Indicative pricing</p>
      </div>

      <div style={{ padding: '24px 26px' }}>
        {/* Cover tier */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 10 }}>Cover Level</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'basic', label: 'Basic', sub: 'Essential' },
              { id: 'standard', label: 'Standard', sub: 'Recommended' },
              { id: 'premium', label: 'Premium', sub: 'Full cover' },
            ].map(t => (
              <button key={t.id} onClick={() => setCoverType(t.id as 'basic' | 'standard' | 'premium')}
                style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${coverType === t.id ? '#1D4ED8' : 'var(--border)'}`, background: coverType === t.id ? '#EFF6FF' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: coverType === t.id ? '#1D4ED8' : '#475569' }}>{t.label}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', marginTop: 1 }}>{t.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Value slider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{sliderLabel}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>{fmt(sliderVal)}</p>
          </div>
          <input type="range" min={500000} max={50000000} step={500000} value={sliderVal} onChange={e => setSliderVal(+e.target.value)}
            style={{ width: '100%', accentColor: '#1D4ED8', cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8' }}>₦500K</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8' }}>₦50M</span>
          </div>
        </div>

        {/* Age slider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
              {productId === 'health' ? 'Oldest Member Age' : productId === 'motor' ? 'Vehicle Age (years)' : 'Property Age (years)'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>{age} {age === 1 ? 'yr' : 'yrs'}</p>
          </div>
          <input type="range" min={0} max={30} step={1} value={age} onChange={e => setAge(+e.target.value)}
            style={{ width: '100%', accentColor: '#1D4ED8', cursor: 'pointer' }} />
        </div>

        {/* State */}
        <div style={{ marginBottom: 22, position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>State of Registration</p>
          <button onClick={() => setStateOpen(o => !o)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${stateOpen ? '#1D4ED8' : 'var(--border)'}`, background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A' }}>
            {state}
            <div style={{ width: 16, height: 16, color: '#94A3B8', transition: 'transform 0.2s', transform: stateOpen ? 'rotate(180deg)' : 'none' }}>{Icon.chevDown}</div>
          </button>
          {stateOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 30, maxHeight: 180, overflowY: 'auto', scrollbarWidth: 'none' }}>
              {states.map(s => (
                <button key={s} onClick={() => { setState(s); setStateOpen(false) }}
                  style={{ width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 13, color: state === s ? '#1D4ED8' : '#1E293B', background: state === s ? '#EFF6FF' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                  {s}{state === s && <div style={{ width: 14, height: 14, color: '#1D4ED8' }}>{Icon.check}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Result */}
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Indicative Annual Premium</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: 'white', lineHeight: 1, marginBottom: 6 }}>{fmt(annual)}</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>or {fmt(monthly)}/month</p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '14px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { k: 'Cover', v: coverType.charAt(0).toUpperCase() + coverType.slice(1) },
              { k: 'State', v: state },
            ].map(r => (
              <div key={r.k}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{r.k}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{r.v}</p>
              </div>
            ))}
          </div>
        </div>

        <button style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(29,78,216,0.4)' }}>
          Proceed to Purchase <span style={{ width: 15, height: 15 }}>{Icon.arrow}</span>
        </button>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
          Indicative quote · final premium confirmed at checkout · NAICOM-regulated
        </p>
      </div>
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqData = [
  { q: 'Is motor insurance legally required in Nigeria?', a: `Yes. The Motor Vehicles (Third Party Insurance) Act mandates third-party liability cover for every vehicle on Nigerian roads. Driving without a valid certificate is a criminal offence punishable by fine or imprisonment. ${branding.companyName} issues NAICOM-approved certificates instantly upon payment.` },
  { q: 'How quickly do I receive my insurance certificate?', a: "Your NAICOM-approved certificate is emailed and SMS'd within 5 minutes of successful payment. A PDF is also available immediately in your dashboard for download, printing, or sharing with FRSC officers." },
  { q: 'Can I pay my premium in monthly instalments?', a: "Yes. Monthly, quarterly, and annual payment options are available. Monthly payments incur a 2% administrative charge. All payments are processed through CBN-approved gateways (Paystack, Flutterwave, NIBSS)." },
  { q: 'What documents are required for motor insurance?', a: "Vehicle registration number, proof of ownership (vehicle licence), driver's licence, and BVN or NIN for identity verification. No physical document submission needed — everything is done digitally." },
  { q: 'How does the claims process work?', a: "Log into your dashboard, click 'File a Claim', select your policy, upload photos, and submit. Claims are acknowledged within 1 hour and most are resolved within 24 hours. You receive real-time SMS updates at every stage." },
  { q: 'What is the difference between Third-Party and Comprehensive cover?', a: "Third-Party Only covers damage or injury you cause to others. It does NOT cover your own vehicle. Comprehensive cover includes third-party liability plus damage to your own vehicle from accidents, fire, theft, flood, and vandalism." },
  { q: `Is ${branding.companyName} regulated by NAICOM?`, a: `Yes. ${branding.companyName} is licensed by the National Insurance Commission (NAICOM), Licence No. ${branding.licenceNo}. All underwriting is performed by NAICOM-approved insurers. In case of dispute, you may escalate to the Nigerian Insurance Ombudsman at no cost.` },
  { q: 'Can I cover my vehicle if it is over 10 years old?', a: "Yes. We cover vehicles up to 20 years old. Premium rates are adjusted for vehicle age using a standard depreciation schedule. For vehicles over 15 years, Comprehensive cover is available on a market-value basis only." },
]

function FAQ({ color }: { color: string }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section style={{ background: '#F8FAFC', padding: '80px 24px' }}>
      <div className="max-w-[1200px] mx-auto" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 96 }}>
          <Eyebrow>FAQ</Eyebrow>
          <H2>Common questions answered</H2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#64748B', lineHeight: 1.7, marginBottom: 28 }}>
            Can't find what you need? Our 24/7 team is available on WhatsApp and phone.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: Icon.phone, label: 'Toll-free Hotline', val: branding.supportPhone, bg: '#EFF6FF', bc: '#BFDBFE', ic: '#1D4ED8' },
              { icon: Icon.whatsapp, label: 'WhatsApp', val: branding.whatsapp, bg: '#F0FDF4', bc: '#BBF7D0', ic: '#16A34A' },
              { icon: Icon.mail, label: 'Email', val: branding.supportEmail, bg: '#F5F3FF', bc: '#DDD6FE', ic: '#7C3AED' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: c.bg, border: `1px solid ${c.bc}` }}>
                <div style={{ width: 18, height: 18, color: c.ic }}>{c.icon}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{c.label}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94A3B8' }}>{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {faqData.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.4 }}>{faq.q}</p>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: open === i ? color : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: open === i ? 'white' : '#94A3B8', flexShrink: 0, transition: 'all 0.2s',
                }}>
                  <div style={{ width: 14, height: 14, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>{Icon.chevDown}</div>
                </div>
              </button>
              {open === i && (
                <div style={{ paddingBottom: 22 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#475569', lineHeight: 1.8 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductPage({ onNavigate }: Props) {
  const [activeProduct, setActiveProduct] = useState('motor')
  const prod = products.find(p => p.id === activeProduct)!

  return (
    <>
      {/* Hero with photo */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 420 }}>
        <img src={prod.img} alt={prod.fullLabel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.4s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,15,42,0.9) 0%, rgba(6,15,42,0.6) 50%, rgba(6,15,42,0.3) 100%)' }} />
        <div className="max-w-[1200px] mx-auto px-6 py-20" style={{ position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 14 }}>Coverage Plans</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,4vw,54px)', letterSpacing: '-0.04em', color: 'white', lineHeight: 1.05, marginBottom: 14, maxWidth: 560 }}>
            {prod.headline}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 500, marginBottom: 36 }}>{prod.sub}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ padding: '6px 14px', borderRadius: 20, background: prod.color + '25', border: `1px solid ${prod.color}50`, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'white' }}>
              From {prod.minPremium}
            </span>
            <span style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#86EFAC' }}>
              NAICOM Licensed
            </span>
          </div>
        </div>
      </section>

      {/* Product tab strip */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 68, zIndex: 30 }}>
        <div className="max-w-[1200px] mx-auto px-6" style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {products.map(p => (
            <button key={p.id} onClick={() => setActiveProduct(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '16px 22px',
                border: 'none', borderBottom: `3px solid ${activeProduct === p.id ? p.color : 'transparent'}`,
                background: 'none', cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: activeProduct === p.id ? 700 : 500,
                color: activeProduct === p.id ? p.color : '#64748B', whiteSpace: 'nowrap',
              }}>
              <div style={{ width: 16, height: 16 }}>{p.icon}</div>
              {p.fullLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Coverage details + Calculator */}
      <section style={{ background: 'white', padding: '60px 24px 80px' }}>
        <div className="max-w-[1200px] mx-auto" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 56, alignItems: 'start' }}>

          {/* Left: coverage breakdown */}
          <div>
            <H2>What's covered</H2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#64748B', lineHeight: 1.75, marginBottom: 32 }}>
              Our {prod.fullLabel.toLowerCase()} is underwritten by NAICOM-licensed insurers and meets all Nigerian regulatory requirements.
            </p>

            {/* Included by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
              {prod.included.map(cat => (
                <div key={cat.cat} style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', background: prod.bg, borderBottom: `1px solid ${prod.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: prod.color }} />
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: prod.color }}>{cat.cat}</p>
                  </div>
                  <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {cat.items.map(item => (
                      <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: prod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: prod.color, flexShrink: 0, marginTop: 1 }}>
                          <div style={{ width: 9, height: 9 }}>{Icon.check}</div>
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Exclusions */}
            <div style={{ background: '#FEF2F2', borderRadius: 16, border: '1px solid #FECACA', padding: '20px 22px', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 16, height: 16, color: '#DC2626' }}>{Icon.x}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#B91C1C' }}>Not covered under this policy</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {prod.excluded.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 14, height: 14, color: '#DC2626', flexShrink: 0, marginTop: 1 }}>{Icon.x}</div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance badge */}
            <div style={{ padding: '18px 20px', borderRadius: 14, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20 }}>{Icon.shield}</div>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#1E3A8A', marginBottom: 3 }}>NAICOM Compliance Guarantee</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#1E40AF', lineHeight: 1.55 }}>
                  All policies issued under NAICOM Licence No. {branding.licenceNo}. Disputes may be escalated to the Nigerian Insurance Ombudsman at <span style={{ color: '#1D4ED8' }}>complaints@naicom.gov.ng</span> free of charge.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Calculator */}
          <div>
            <PricingCalculator productId={activeProduct} />
          </div>
        </div>
      </section>

      <FAQ color={prod.color} />

      {/* Bottom CTA */}
      <section style={{ background: prod.bg, borderTop: `2px solid ${prod.border}`, padding: '60px 24px' }}>
        <div className="max-w-[1200px] mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', marginBottom: 8 }}>Ready to get covered?</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#475569', lineHeight: 1.6 }}>Start your {prod.fullLabel.toLowerCase()} quote now — takes under 2 minutes.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '14px 28px', borderRadius: 12, background: prod.color, color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: `0 4px 16px ${prod.color}40` }}>
              Get Instant Quote
            </button>
            <button onClick={() => onNavigate('contact')} style={{ padding: '14px 20px', borderRadius: 12, border: `1.5px solid ${prod.border}`, background: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: prod.color, cursor: 'pointer' }}>
              Talk to an Agent
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
