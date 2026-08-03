/**
 * Mobile / 02-Dashboard
 * Home dashboard: active policies summary, quick actions, coverage overview.
 */
export default function MobileDashboard() {
    const policies = [
      { type: 'Motor Comprehensive', ref: 'POL-2024-00234', status: 'Active', expiry: 'Dec 2025', color: '#1D4ED8' },
      { type: 'Health — Individual', ref: 'POL-2024-00189', status: 'Active', expiry: 'Mar 2025', color: '#16A34A' },
    ]
    return (
      <div style={{ fontFamily: 'var(--font-body)', background: '#F4F3EF', minHeight: '100vh', maxWidth: 390, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: '#060F2A', padding: '52px 20px 28px', position: 'relative' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Good morning</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>Amaka Okafor</h2>
          <div style={{ marginTop: 20, padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total Coverage Value</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.04em' }}>₦52,500,000</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Across 2 active policies</p>
          </div>
        </div>
  
        {/* Quick actions */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { emoji: '🛡️', label: 'New Quote' },
            { emoji: '📋', label: 'File Claim' },
            { emoji: '📄', label: 'Policies' },
            { emoji: '💬', label: 'Support' },
          ].map(a => (
            <div key={a.label} style={{ background: 'white', borderRadius: 14, padding: '14px 8px', textAlign: 'center', border: '1px solid #E4E2DC' }}>
              <span style={{ fontSize: 22 }}>{a.emoji}</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: '#0F172A', marginTop: 6 }}>{a.label}</p>
            </div>
          ))}
        </div>
  
        {/* Active policies */}
        <div style={{ padding: '20px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Active Policies</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {policies.map(p => (
              <div key={p.ref} style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid #E4E2DC', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 10, height: 44, borderRadius: 5, background: p.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{p.type}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{p.ref}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ padding: '3px 8px', borderRadius: 8, background: '#F0FDF4', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#16A34A' }}>Active</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', marginTop: 3 }}>Exp {p.expiry}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        <div style={{ padding: '8px 20px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mobile / 02-Dashboard</span>
        </div>
      </div>
    )
  }
  