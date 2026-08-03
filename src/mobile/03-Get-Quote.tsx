/**
 * Mobile / 03-Get-Quote
 * Multi-step quote form: vehicle type → registration → location → result.
 */
import { useState } from 'react'

const vehicleTypes = [
  { id: 'car', label: 'Private Car', emoji: '🚗', sub: 'Sedans, SUVs, hatchbacks' },
  { id: 'truck', label: 'Commercial Vehicle', emoji: '🚛', sub: 'Trucks, vans, pickups' },
  { id: 'bike', label: 'Motorcycle', emoji: '🏍️', sub: '125cc and above' },
]

const states = ['Lagos', 'FCT (Abuja)', 'Rivers', 'Kano', 'Oyo', 'Edo', 'Delta', 'Enugu']

export default function MobileGetQuote() {
  const [step, setStep] = useState(1)
  const [vehicle, setVehicle] = useState('')
  const [reg, setReg] = useState('')
  const [state, setState] = useState('')

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#F4F3EF', minHeight: '100vh', maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '52px 20px 20px', borderBottom: '1px solid #E4E2DC' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Motor Insurance Quote</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
          Step {step} of 3
        </h2>
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#1D4ED8' : '#E2E8F0', transition: 'background 0.2s' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {step === 1 && (
          <>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Select vehicle type</p>
            {vehicleTypes.map(v => (
              <button key={v.id} onClick={() => setVehicle(v.id)}
                style={{ padding: '16px', borderRadius: 14, border: `2px solid ${vehicle === v.id ? '#1D4ED8' : '#E4E2DC'}`, background: vehicle === v.id ? '#EFF6FF' : 'white', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center', textAlign: 'left' }}>
                <span style={{ fontSize: 28 }}>{v.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{v.label}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B', marginTop: 2 }}>{v.sub}</p>
                </div>
              </button>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Enter registration number</p>
            <input value={reg} onChange={e => setReg(e.target.value.toUpperCase())} placeholder="e.g. LAG-123-AA"
              style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '0.08em', color: '#0F172A', background: 'white', outline: 'none', textAlign: 'center' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
              Enter your vehicle plate number exactly as it appears on your registration document.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Your state of registration</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {states.map(s => (
                <button key={s} onClick={() => setState(s)}
                  style={{ padding: '13px 16px', borderRadius: 12, border: `2px solid ${state === s ? '#1D4ED8' : '#E4E2DC'}`, background: state === s ? '#EFF6FF' : 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: state === s ? 700 : 400, color: state === s ? '#1D4ED8' : '#0F172A', textAlign: 'left' }}>
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              Back
            </button>
          )}
          <button onClick={() => step < 3 ? setStep(s => s + 1) : undefined}
            style={{ flex: 2, padding: '14px', borderRadius: 12, background: '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            {step < 3 ? 'Continue' : 'Get My Quote →'}
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 20px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mobile / 03-Get-Quote</span>
      </div>
    </div>
  )
}
