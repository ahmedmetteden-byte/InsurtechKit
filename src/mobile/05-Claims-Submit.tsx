/**
 * Mobile / 05-Claims-Submit
 * Claims submission: photo upload, description, offline-aware UX.
 */
import { useState } from 'react'

export default function MobileClaimsSubmit() {
  const [offline, setOffline] = useState(false)
  const [photos, setPhotos] = useState(2)
  const [desc, setDesc] = useState('')
  const [queued, setQueued] = useState(false)

  const handleSubmit = () => {
    if (offline) { setQueued(true) }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#F4F3EF', minHeight: '100vh', maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: offline ? '#7C3AED' : '#1D4ED8', padding: '52px 20px 20px', transition: 'background 0.3s' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>File a Claim</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>Motor — Accident</h2>

        {/* Offline toggle (demo) */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ fontSize: 16 }}>{offline ? '📵' : '📶'}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'white' }}>{offline ? 'Offline Mode' : 'Online'}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{offline ? 'Claim will be queued locally' : 'All changes sync in real-time'}</p>
          </div>
          <button onClick={() => setOffline(o => !o)} style={{ padding: '5px 12px', borderRadius: 20, background: offline ? '#F59E0B' : 'rgba(255,255,255,0.2)', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            {offline ? 'Switch On' : 'Simulate Off'}
          </button>
        </div>
      </div>

      {queued ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 48 }}>📤</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 16, marginBottom: 8 }}>Claim Queued</h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#64748B', lineHeight: 1.65, marginBottom: 20 }}>
            Your claim is saved locally. It will be submitted automatically when your connection is restored.
          </p>
          <div style={{ padding: '14px', borderRadius: 12, background: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#92400E' }}>CLM-OFFLINE-TMP-2024-001 · Awaiting sync</p>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Photos */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Incident Photos</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Array.from({ length: photos }).map((_, i) => (
                <div key={i} style={{ width: 80, height: 80, borderRadius: 12, background: '#E2E8F0', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <span style={{ fontSize: 28 }}>📷</span>
                  <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#64748B' }}>Photo {i + 1}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => setPhotos(p => Math.min(p + 1, 6))}
                style={{ width: 80, height: 80, borderRadius: 12, border: '2px dashed #CBD5E1', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
                <span style={{ fontSize: 20 }}>+</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#94A3B8' }}>Add photo</span>
              </button>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', marginTop: 8 }}>{photos}/6 photos · {offline ? 'Stored locally' : 'Compressed for low data'}</p>
          </div>

          {/* Description */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Describe what happened</p>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
              placeholder="Briefly describe the incident — location, time, what happened, third parties involved…"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', background: 'white', outline: 'none', resize: 'none', boxSizing: 'border-box' as const }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', marginTop: 4 }}>{desc.length}/500 characters</p>
          </div>

          {/* Policy selector */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Affected Policy</p>
            <select style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontFamily: 'var(--font-body)', fontSize: 13, color: '#0F172A', background: 'white', cursor: 'pointer' }}>
              <option>POL-2024-00234 · Motor Comprehensive</option>
              <option>POL-2024-00189 · Health Individual</option>
            </select>
          </div>

          <button onClick={handleSubmit} style={{ width: '100%', padding: '15px', borderRadius: 12, background: offline ? '#7C3AED' : '#1D4ED8', color: 'white', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            {offline ? '📤 Queue for Later' : '🚀 Submit Claim'}
          </button>
        </div>
      )}

      <div style={{ padding: '8px 20px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mobile / 05-Claims-Submit</span>
      </div>
    </div>
  )
}
