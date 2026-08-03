import { useState, useEffect } from 'react'
import NavBar from './components/NavBar'
import Footer from './components/Footer'

// Desktop / 00-Cover — "Start Here" guide (shown first on launch)
import Cover from './desktop/00-Cover'

// Desktop / Website screens
import HomePage    from './desktop/01-Homepage'
import ProductPage from './desktop/02-Product-Details'
import ClaimsPage  from './desktop/03-Claims-Process'
import ContactPage from './desktop/04-Contact-Agent-Finder'

// Admin screens
import AdminDashboard from './admin/AdminDashboard'

// Mobile screens (preview entry — desktop remains the default experience)
import MobileOnboarding    from './mobile/01-Onboarding'
import MobileDashboard     from './mobile/02-Dashboard'
import MobileGetQuote      from './mobile/03-Get-Quote'
import MobilePolicyDetails from './mobile/04-Policy-Details'
import MobileClaimsSubmit  from './mobile/05-Claims-Submit'

type Page = 'home' | 'product' | 'claims' | 'contact'
type MobileScreen = 'onboarding' | 'dashboard' | 'quote' | 'policy' | 'claims'

const mobileScreens: { id: MobileScreen; label: string }[] = [
  { id: 'onboarding', label: '01 Onboarding' },
  { id: 'dashboard',  label: '02 Dashboard' },
  { id: 'quote',      label: '03 Get Quote' },
  { id: 'policy',     label: '04 Policy' },
  { id: 'claims',     label: '05 Claims' },
]

export default function App() {
  // Start on the cover page; buyer clicks "Open Kit" to enter the website
  const [showCover, setShowCover] = useState(true)
  const [page, setPage] = useState<Page>('home')
  const [admin, setAdmin] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>('onboarding')

  const navigate = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!showCover) window.scrollTo(0, 0)
  }, [page, showCover])

  // ── Admin mode — full-screen, no nav/footer
  if (admin) {
    return <AdminDashboard onExit={() => setAdmin(false)} />
  }

  // ── Mobile preview — full-screen, switcher only (mobile UI unmodified)
  if (mobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 8 }}>Mobile Preview</span>
          {mobileScreens.map(s => (
            <button key={s.id} onClick={() => setMobileScreen(s.id)}
              style={{ padding: '6px 10px', borderRadius: 6, border: mobileScreen === s.id ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)', background: mobileScreen === s.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: mobileScreen === s.id ? 'white' : 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
              {s.label}
            </button>
          ))}
          <button onClick={() => setMobile(false)}
            style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
            Exit Mobile
          </button>
        </div>
        {mobileScreen === 'onboarding' && <MobileOnboarding />}
        {mobileScreen === 'dashboard'  && <MobileDashboard />}
        {mobileScreen === 'quote'      && <MobileGetQuote />}
        {mobileScreen === 'policy'     && <MobilePolicyDetails />}
        {mobileScreen === 'claims'     && <MobileClaimsSubmit />}
      </div>
    )
  }

  // ── Cover / Start Here page — no nav/footer
  if (showCover) {
    return <Cover onEnter={() => setShowCover(false)} />
  }

  // ── Main website
  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--background)', minHeight: '100vh' }}>
      <NavBar current={page} onNavigate={navigate} onAdminClick={() => setAdmin(true)} onMobileClick={() => setMobile(true)} />
      <main>
        {page === 'home'    && <HomePage    onNavigate={navigate} />}
        {page === 'product' && <ProductPage onNavigate={navigate} />}
        {page === 'claims'  && <ClaimsPage  onNavigate={navigate} />}
        {page === 'contact' && <ContactPage onNavigate={navigate} />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  )
}
