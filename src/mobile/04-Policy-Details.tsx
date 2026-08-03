/**
 * Mobile / 04-Policy-Details
 * Tabular view: policy number, dates, beneficiaries, download links.
 */
import { useState } from 'react'

const policy = {
  ref: 'POL-2024-00234', product: 'Motor Comprehensive', insurer: 'InsureNG via Leadway Assurance',
  status: 'Active', premium: '₦125,000', sumInsured: '₦5,000,000',
  startDate: '1 Jan 2024', endDate: '31 Dec 2024', issueDate: '28 Dec 2023',
  vehicle: 'Toyota Camry 2021 · LAG-123-AA', colour: 'Silver',
  beneficiaries: [
    { name: 'Amaka Okafor (Primary)', rel: 'Self', share: '100%' },
  ],
}

export default function MobilePolicyDetails() {
  const [tab, setTab] = useState<'details' | 'docs'>('details')

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#F4F3EF', minHeight: '100vh', maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#060F2A', padding: '52px 20px 20px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Policy Details</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>{policy.product}</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{policy.ref}</p>
        <span style={{ display: 'inline-block', marginTop: 10, padding: '4px 12px', borderRadius: 20, background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4ADE80' }}>
          ● Active
        </span>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', display: 'flex', borderBottom: '1px solid #E4E2DC' }}>
        {(['details', 'docs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '14px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? '#1D4ED8' : '#64748B', borderBottom: `2px solid ${tab === t ? '#1D4ED8' : 'transparent'}`, textTransform: 'capitalize' }}>
            {t === 'docs' ? 'Documents' : 'Details'}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {tab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Policy Number', policy.ref],
              ['Product', policy.product],
              ['Underwriter', policy.insurer],
              ['Premium Paid', policy.premium],
              ['Sum Insured', policy.sumInsured],
              ['Start Date', policy.startDate],
              ['End Date', policy.endDate],
              ['Issue Date', policy.issueDate],
              ['Vehicle', policy.vehicle],
              ['Colour', policy.colour],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'white', borderRadius: 10, padding: '12px 14px', border: '1px solid #E4E2DC', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#0F172A', textAlign: 'right' }}>{val}</span>
              </div>
            ))}

            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>Beneficiaries</p>
            {policy.beneficiaries.map(b => (
              <div key={b.name} style={{ background: 'white', borderRadius: 10, padding: '12px 14px', border: '1px solid #E4E2DC' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{b.name}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{b.rel} · {b.share}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'docs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📄', label: 'Certificate of Insurance', size: '142 KB', type: 'PDF' },
              { icon: '📋', label: 'Policy Schedule', size: '98 KB', type: 'PDF' },
              { icon: '📃', label: 'Premium Receipt', size: '56 KB', type: 'PDF' },
            ].map(d => (
              <div key={d.label} style={{ background: 'white', borderRadius: 12, padding: '14px', border: '1px solid #E4E2DC', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 26 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{d.label}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{d.type} · {d.size}</p>
                </div>
                <button style={{ padding: '8px 14px', borderRadius: 8, background: '#EFF6FF', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#1D4ED8', border: 'none', cursor: 'pointer' }}>
                  ↓ Save
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '8px 20px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mobile / 04-Policy-Details</span>
      </div>
    </div>
  )
}
