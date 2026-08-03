import { Icon } from '../icons'
import { Button, Row, Stack } from './ui'

type Page = 'home' | 'product' | 'claims' | 'contact'

export default function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer style={{ background: '#0F172A', color: 'white' }}>

      {/* ── CTA band ──
          Row with flex-wrap: the two buttons form a horizontal auto layout.
          When button text changes (e.g. "Calculate My Auto Premium"), the
          button expands and the row wraps gracefully on narrow viewports.
      ── */}
      <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)', padding: '56px 24px' }}>
        <div className="max-w-[1200px] mx-auto">
          <Row justify="space-between" gap={32} wrap>
            <Stack gap={10} style={{ maxWidth: 480 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
                Start today
              </p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Protect your family and assets with Nigeria's most trusted insurance portal.
              </h3>
            </Stack>

            {/* Auto Layout row: each Button hugs its own text */}
            <Row gap={12} wrap>
              <Button
                variant="dark"
                size="lg"
                onClick={() => onNavigate('product')}
                style={{ background: 'white', color: '#1D4ED8' }}>
                Get Instant Quote
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('contact')}
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                Talk to an Agent
              </Button>
            </Row>
          </Row>
        </div>
      </div>

      {/* ── Links grid ──
          auto-fit + minmax means each column hugs its own content width.
          Adding a fifth column (e.g. "Resources") automatically fits in.
      ── */}
      <div style={{ padding: '56px 24px 40px' }}>
        <div className="max-w-[1200px] mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40 }}>

          {/* Brand */}
          <Stack gap={16}>
            <Row gap={10} wrap={false}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20 }}>{Icon.shield}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>InsureNG</span>
            </Row>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Nigeria's leading white-label insurance portal. NAICOM licensed and regulated.
            </p>
            {/* Social icon row — hugs its three buttons */}
            <Row gap={10} wrap={false}>
              {[Icon.twitter, Icon.linkedin, Icon.whatsapp].map((ic, i) => (
                <button key={i}
                  style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16 }}>{ic}</div>
                </button>
              ))}
            </Row>
          </Stack>

          {/* Coverage — stack of links, each link is a flex row that hugs its text */}
          <Stack gap={4}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '-0.01em', marginBottom: 8 }}>Coverage</p>
            {['Motor Insurance', 'Health Insurance', 'Home Insurance', 'Life Assurance', 'Travel Insurance', 'Business Insurance'].map(l => (
              <button key={l} onClick={() => onNavigate('product')}
                style={{ display: 'inline-flex', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', transition: 'color 0.15s', textAlign: 'left', whiteSpace: 'nowrap' }}>
                {l}
              </button>
            ))}
          </Stack>

          {/* Company */}
          <Stack gap={4}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '-0.01em', marginBottom: 8 }}>Company</p>
            {['About Us', 'Press & Media', 'Careers', 'Partners', 'NAICOM Compliance', 'Privacy Policy'].map(l => (
              <button key={l}
                style={{ display: 'inline-flex', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', textAlign: 'left', whiteSpace: 'nowrap' }}>
                {l}
              </button>
            ))}
          </Stack>

          {/* Contact — each item is an inline auto layout row: icon + text */}
          <Stack gap={8}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '-0.01em', marginBottom: 4 }}>Contact</p>
            {[
              { icon: Icon.phone, text: '0800-INSURE-NG' },
              { icon: Icon.mail, text: 'hello@insureng.com.ng' },
              { icon: Icon.pin, text: 'Plot 14, Broad Street, Lagos Island' },
              { icon: Icon.whatsapp, text: 'WhatsApp: +234 901 000 0000' },
            ].map(c => (
              /* Each contact row is horizontal auto layout */
              <Row key={c.text} gap={10} wrap={false} align="flex-start">
                <div style={{ width: 14, height: 14, color: '#1D4ED8', flexShrink: 0, marginTop: 2 }}>{c.icon}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, minWidth: 0, wordBreak: 'break-word' }}>{c.text}</p>
              </Row>
            ))}
          </Stack>
        </div>
      </div>

      {/* ── Bottom bar — flex-wrap so legal text and links reflow on narrow viewports ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div className="max-w-[1200px] mx-auto">
          <Row justify="space-between" gap={12} wrap>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
              © 2025 InsureNG Ltd. RC 1234567. NAICOM Licence No. IA-2024-0089. All rights reserved.
            </p>
            {/* Auto Layout row: buttons hug their label text */}
            <Row gap={20} wrap={false}>
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(l => (
                <button key={l}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {l}
                </button>
              ))}
            </Row>
          </Row>
        </div>
      </div>
    </footer>
  )
}
