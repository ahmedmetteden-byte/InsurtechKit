import { useState } from 'react'
import { Icon } from '../icons'
import { useBranding } from '../config/BrandingContext'
import type { BrandingConfig } from '../config/branding'

type Page = 'home' | 'product' | 'claims' | 'contact' | 'quote'
interface Props { onNavigate: (_p: Page) => void }

function Eyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: light ? 'rgba(255,255,255,0.1)' : '#EFF6FF', border: `1px solid ${light ? 'rgba(255,255,255,0.2)' : '#BFDBFE'}`, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: light ? 'rgba(255,255,255,0.7)' : '#1D4ED8', textTransform: 'uppercase', marginBottom: 14 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: light ? 'rgba(255,255,255,0.6)' : '#1D4ED8', display: 'inline-block' }} />
      {children}
    </span>
  )
}

// ── Nigeria SVG map ───────────────────────────────────────────────────────────
const cities = [
  { id: 'lagos', name: 'Lagos', cx: 22, cy: 74, state: 'Lagos State', agents: 42 },
  { id: 'abuja', name: 'Abuja', cx: 50, cy: 44, state: 'FCT', agents: 18 },
  { id: 'ph', name: 'Port Harcourt', cx: 40, cy: 78, state: 'Rivers State', agents: 15 },
  { id: 'kano', name: 'Kano', cx: 52, cy: 22, state: 'Kano State', agents: 12 },
  { id: 'ibadan', name: 'Ibadan', cx: 27, cy: 64, state: 'Oyo State', agents: 9 },
  { id: 'enugu', name: 'Enugu', cx: 48, cy: 64, state: 'Enugu State', agents: 7 },
]

function NigeriaMap({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const { branding } = useBranding()

  return (
    <div style={{ background: '#EFF6FF', borderRadius: 20, overflow: 'hidden', border: '1.5px solid #BFDBFE', position: 'relative' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', display: 'block' }}>
        {[20, 40, 60, 80].map(v => (
          <g key={v}>
            <line x1={v} y1={2} x2={v} y2={98} stroke="#C7D2FE" strokeWidth={0.3} strokeDasharray="1.5,2" />
            <line x1={2} y1={v} x2={98} y2={v} stroke="#C7D2FE" strokeWidth={0.3} strokeDasharray="1.5,2" />
          </g>
        ))}
        <path d="M 22 14 L 30 10 L 40 9 L 50 10 L 58 12 L 66 11 L 72 14 L 76 20 L 80 26 L 82 32 L 84 40 L 82 46 L 84 52 L 80 58 L 76 62 L 72 66 L 68 72 L 62 76 L 56 80 L 52 84 L 46 86 L 40 84 L 36 80 L 32 78 L 28 80 L 22 78 L 18 72 L 16 66 L 14 58 L 14 50 L 16 42 L 14 36 L 16 28 L 18 22 Z" fill="#DBEAFE" stroke="#93C5FD" strokeWidth={0.8} />
        {cities.map(city => {
          const isActive = selected === city.id || hovered === city.id
          return (
            <g key={city.id} style={{ cursor: 'pointer' }}
              onClick={() => onSelect(city.id)}
              onMouseEnter={() => setHovered(city.id)}
              onMouseLeave={() => setHovered(null)}>
              {isActive && <circle cx={city.cx} cy={city.cy} r={6} fill="rgba(29,78,216,0.15)" stroke="#1D4ED8" strokeWidth={0.6} />}
              <circle cx={city.cx} cy={city.cy} r={isActive ? 3.5 : 2.8} fill={isActive ? '#1D4ED8' : '#3B82F6'} stroke="white" strokeWidth={1.2} style={{ transition: 'all 0.15s' }} />
              <text x={city.cx + 4.5} y={city.cy + 1.5} style={{ fontFamily: 'var(--font-display)', fontSize: isActive ? 3.8 : 3.3, fontWeight: isActive ? 700 : 500, fill: isActive ? '#1D4ED8' : '#334155', transition: 'all 0.15s' }}>{city.name}</text>
            </g>
          )
        })}
        <text x={88} y={10} style={{ fontFamily: 'var(--font-mono)', fontSize: 4, fill: '#94A3B8' }}>N</text>
        <line x1={90} y1={10.5} x2={90} y2={14} stroke="#CBD5E1" strokeWidth={0.5} />
        <polygon points="90,8 88.5,11 90,10.5 91.5,11" fill="#94A3B8" />
      </svg>
      <div style={{ padding: '10px 16px', borderTop: '1px solid #BFDBFE', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', border: '1.5px solid white', boxShadow: '0 0 0 1.5px #3B82F6' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748B' }}>{branding.companyName} Office · Click pin to view details</span>
      </div>
    </div>
  )
}

// ── Offices ───────────────────────────────────────────────────────────────────
function getOffices(branding: BrandingConfig) {
  return [
  { id: 'lagos', city: 'Lagos', label: 'Head Office', address: '14 Marina Street, Lagos Island, Lagos 101001', phone: '+234 1 900 0000', email: `lagos@${branding.emailDomain}`, hours: 'Mon–Fri 8am–6pm · Sat 9am–2pm', agents: 42, region: 'South West', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=280&fit=crop&auto=format', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'abuja', city: 'Abuja', label: 'FCT Office', address: 'Plot 1234 Adeola Hopewell, Central Business District, Abuja', phone: '+234 9 900 0000', email: `abuja@${branding.emailDomain}`, hours: 'Mon–Fri 8am–5pm · Sat 10am–1pm', agents: 18, region: 'North Central', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=280&fit=crop&auto=format', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { id: 'ph', city: 'Port Harcourt', label: 'South South Office', address: '7 Rumuola Road, Port Harcourt, Rivers State 500001', phone: '+234 84 900 000', email: `portharcourt@${branding.emailDomain}`, hours: 'Mon–Fri 8am–5pm', agents: 15, region: 'South South', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=280&fit=crop&auto=format', color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD' },
  { id: 'kano', city: 'Kano', label: 'North Office', address: '22 Ibrahim Taiwo Road, Kano Municipal, Kano State', phone: '+234 64 900 000', email: `kano@${branding.emailDomain}`, hours: 'Mon–Fri 8am–5pm · Sat 9am–12pm', agents: 12, region: 'North West', img: 'https://images.unsplash.com/photo-1575538439014-8b1df7a4a564?w=600&h=280&fit=crop&auto=format', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  ]
}

// ── Agent Finder ──────────────────────────────────────────────────────────────
const stateAgents: Record<string, { name: string; phone: string; city: string; specialty: string }[]> = {
  'Lagos': [
    { name: 'Adaeze Okonkwo', phone: '0901 234 5001', city: 'Lagos Island', specialty: 'Motor & Home' },
    { name: 'Femi Adeyemi', phone: '0901 234 5002', city: 'Victoria Island', specialty: 'Commercial & Marine' },
    { name: 'Grace Eze', phone: '0901 234 5003', city: 'Ikeja', specialty: 'Health & Life' },
  ],
  'FCT (Abuja)': [
    { name: 'Musa Ibrahim', phone: '0901 234 5010', city: 'Central Area', specialty: 'Motor & Personal' },
    { name: 'Ngozi Agu', phone: '0901 234 5011', city: 'Wuse 2', specialty: 'Corporate & Group' },
  ],
  'Rivers': [
    { name: 'Chidera Obi', phone: '0901 234 5020', city: 'Port Harcourt', specialty: 'Oil & Energy' },
    { name: 'Emeka Nwosu', phone: '0901 234 5021', city: 'GRA Phase 2', specialty: 'Motor & Home' },
  ],
  'Kano': [
    { name: 'Yusuf Suleiman', phone: '0901 234 5030', city: 'Kano Central', specialty: 'Trade & Commerce' },
    { name: 'Amina Bello', phone: '0901 234 5031', city: 'Nassarawa', specialty: 'Agriculture & Motor' },
  ],
  'Oyo': [
    { name: 'Tunde Oladele', phone: '0901 234 5040', city: 'Ibadan', specialty: 'Health & Motor' },
  ],
  'Anambra': [
    { name: 'Obiora Nwachukwu', phone: '0901 234 5050', city: 'Awka', specialty: 'SME & Commercial' },
  ],
}

const allStates = ['Select a state…', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara']

function AgentFinder() {
  const [selectedState, setSelectedState] = useState('')
  const { branding } = useBranding()
  const agents = selectedState ? (stateAgents[selectedState] ?? []) : []

  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Find an Agent Near You</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B' }}>Get personalised insurance guidance in your state.</p>
      </div>
      <div style={{ padding: '24px 28px' }}>
        <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A', background: 'white', cursor: 'pointer' }}>
          {allStates.map(s => <option key={s} value={s === 'Select a state…' ? '' : s}>{s}</option>)}
        </select>

        {selectedState && agents.length > 0 && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {agents.map(a => (
              <div key={a.phone} style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'white' }}>{a.name[0]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{a.name}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748B' }}>{a.city} · {a.specialty}</p>
                </div>
                <a href={`tel:${a.phone}`} style={{ padding: '8px 14px', borderRadius: 8, background: '#EFF6FF', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#1D4ED8', textDecoration: 'none', flexShrink: 0 }}>{a.phone}</a>
              </div>
            ))}
          </div>
        )}

        {selectedState && agents.length === 0 && (
          <div style={{ marginTop: 20, padding: '20px', borderRadius: 12, background: '#FFF7ED', border: '1px solid #FED7AA', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Agents coming soon to {selectedState}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#B45309' }}>Call our national hotline: {branding.supportPhone}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.subject) e.subject = 'Please select a subject'
    if (form.message.length < 20) e.message = 'Please provide more detail (min 20 chars)'
    return e
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ background: '#F0FDF4', borderRadius: 20, border: '1.5px solid #BBF7D0', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
          <div style={{ width: 30, height: 30 }}>{Icon.check}</div>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#14532D', marginBottom: 10 }}>Message Sent!</h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: '#16A34A', marginBottom: 24 }}>
          {"We'll respond to "}<strong>{form.email}</strong>{" within 2 business hours."}
        </p>
        <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
          style={{ padding: '12px 24px', borderRadius: 10, background: '#16A34A', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Send Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Send a Message</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B' }}>We respond within 2 business hours.</p>
      </div>
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {(['name', 'email'] as const).map(id => (
            <div key={id}>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {id === 'name' ? 'Full Name' : 'Email Address'} <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input type={id === 'email' ? 'email' : 'text'} value={form[id]} placeholder={id === 'name' ? 'Your full name' : 'you@example.com'}
                onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${errors[id] ? '#FCA5A5' : '#E2E8F0'}`, fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A', background: errors[id] ? '#FEF2F2' : 'white', outline: 'none', boxSizing: 'border-box' as const }} />
              {errors[id] && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#DC2626', marginTop: 4 }}>{errors[id]}</p>}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Phone Number</label>
            <input type="tel" value={form.phone} placeholder="+234 xxx xxx xxxx"
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A', background: 'white', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Subject <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${errors.subject ? '#FCA5A5' : '#E2E8F0'}`, fontFamily: 'var(--font-body)', fontSize: 14, color: form.subject ? '#0F172A' : '#94A3B8', background: 'white', cursor: 'pointer' }}>
              <option value="">Select a subject…</option>
              {['Get a Quote', 'Policy Enquiry', 'File a Claim', 'Agent Request', 'Complaints', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#DC2626', marginTop: 4 }}>{errors.subject}</p>}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Message <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <textarea value={form.message} rows={4} placeholder="Describe your query in detail…"
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${errors.message ? '#FCA5A5' : '#E2E8F0'}`, fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A', background: errors.message ? '#FEF2F2' : 'white', resize: 'vertical', outline: 'none', boxSizing: 'border-box' as const }} />
          {errors.message && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#DC2626', marginTop: 4 }}>{errors.message}</p>}
        </div>
        <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)', color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,78,216,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          Send Message
          <div style={{ width: 16, height: 16 }}>{Icon.arrow}</div>
        </button>
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ContactPage({ onNavigate: _onNavigate }: Props) {
  const { branding } = useBranding()
  const offices = getOffices(branding)
  const [selectedOffice, setSelectedOffice] = useState<string>('lagos')
  const office = offices.find(o => o.id === selectedOffice) ?? offices[0]

  return (
    <>
      {/* Hero */}
      <section style={{ background: '#060F2A', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1.2px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-10%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="max-w-[1200px] mx-auto" style={{ position: 'relative', textAlign: 'center' }}>
          <Eyebrow light>Contact & Support</Eyebrow>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,4vw,52px)', letterSpacing: '-0.045em', color: 'white', lineHeight: 1.05, marginBottom: 18 }}>
            Real people.<br />
            <span style={{ background: 'linear-gradient(90deg, #60A5FA, #93C5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Real answers.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 48px' }}>
            Our Lagos-based team picks up 24/7. Four offices across Nigeria. 96 licensed agents nationwide.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 860, margin: '0 auto' }}>
            {[
              { icon: '📞', label: 'Toll-Free Hotline', val: branding.supportPhone, sub: '24/7 · Free from any network', bg: 'rgba(29,78,216,0.15)', bc: 'rgba(29,78,216,0.3)' },
              { icon: '💬', label: 'WhatsApp', val: branding.whatsapp, sub: 'Avg. reply < 8 minutes', bg: 'rgba(22,163,74,0.12)', bc: 'rgba(22,163,74,0.28)' },
              { icon: '📧', label: 'Email', val: branding.supportEmail, sub: 'Response within 2 hrs', bg: 'rgba(124,58,237,0.12)', bc: 'rgba(124,58,237,0.28)' },
              { icon: '🕐', label: 'Support Hours', val: 'Always On', sub: 'Mon–Sun, 24 hours', bg: 'rgba(217,119,6,0.12)', bc: 'rgba(217,119,6,0.28)' },
            ].map(c => (
              <div key={c.label} style={{ padding: '18px 16px', borderRadius: 16, background: c.bg, border: `1px solid ${c.bc}`, textAlign: 'center' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{c.icon}</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>{c.val}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map + Offices */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div className="max-w-[1200px] mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Eyebrow>Our Offices</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, letterSpacing: '-0.035em', color: '#0F172A', lineHeight: 1.1, marginBottom: 12 }}>
              Find us across Nigeria
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>Four offices. 96 agents. Nationwide coverage.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 40, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {offices.map(o => (
                <button key={o.id} onClick={() => setSelectedOffice(o.id)}
                  style={{ textAlign: 'left', padding: '16px 18px', borderRadius: 14, border: `2px solid ${selectedOffice === o.id ? o.color : 'var(--border)'}`, background: selectedOffice === o.id ? o.bg : 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: selectedOffice === o.id ? o.color : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: selectedOffice === o.id ? 'white' : '#64748B', transition: 'all 0.2s' }}>
                    <div style={{ width: 20, height: 20 }}>{Icon.pin}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{o.city}</p>
                      <span style={{ padding: '2px 8px', borderRadius: 8, background: selectedOffice === o.id ? o.color : '#F1F5F9', fontFamily: 'var(--font-mono)', fontSize: 9, color: selectedOffice === o.id ? 'white' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{o.label}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8' }}>{o.agents} agents · {o.region}</p>
                  </div>
                </button>
              ))}
              <NigeriaMap selected={selectedOffice} onSelect={id => setSelectedOffice(id)} />
            </div>

            {/* Selected office detail */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: `2px solid ${office.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', position: 'sticky', top: 80 }}>
              <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                <img src={office.img} alt={office.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{office.label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{office.city} Office</p>
                </div>
              </div>

              <div style={{ padding: '24px', background: office.bg, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {([
                  { icon: Icon.pin, label: 'Address', val: office.address },
                  { icon: Icon.phone, label: 'Phone', val: office.phone },
                  { icon: Icon.mail, label: 'Email', val: office.email },
                  { icon: Icon.clock, label: 'Office Hours', val: office.hours },
                  { icon: Icon.users, label: 'Licensed Agents', val: `${office.agents} agents in ${office.region}` },
                ] as { icon: React.ReactNode; label: string; val: string }[]).map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: office.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      <div style={{ width: 16, height: 16 }}>{item.icon}</div>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#0F172A', fontWeight: 500 }}>{item.val}</p>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <a href={`tel:${office.phone}`} style={{ flex: 1, padding: '11px', borderRadius: 10, background: office.color, color: 'white', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'block' }}>Call Office</a>
                  <a href={`mailto:${office.email}`} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'white', color: office.color, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'block', border: `1.5px solid ${office.border}` }}>Email Office</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Finder + Contact Form */}
      <section style={{ background: '#F8FAFC', padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Eyebrow>Get in Touch</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,2.8vw,36px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.1, marginBottom: 12 }}>
              Talk to a person, not a bot
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <AgentFinder />
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section style={{ background: 'white', padding: '40px 24px', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1200px] mx-auto" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 40 }}>
          {[
            { icon: Icon.star, val: '4.9/5', label: 'Customer Satisfaction', color: '#F59E0B' },
            { icon: Icon.clock, val: '< 8 min', label: 'Avg. Response Time', color: '#1D4ED8' },
            { icon: Icon.users, val: '96', label: 'Licensed Agents', color: '#16A34A' },
            { icon: Icon.phone, val: '24/7', label: 'Hotline Availability', color: '#7C3AED' },
            { icon: Icon.shield, val: 'NAICOM', label: 'Fully Regulated', color: '#0EA5E9' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <div style={{ width: 18, height: 18 }}>{s.icon}</div>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
