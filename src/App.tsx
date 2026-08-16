import { useState, useEffect } from 'react'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import { useFeatures } from './config/FeatureContext'
import type { FeatureKey } from './config/features'
import { useAuth } from './auth/AuthContext'
import LoginPage from './auth/LoginPage'

// Desktop / 00-Cover — "Start Here" guide (shown first on launch)
import Cover from './desktop/00-Cover'

// Desktop / Website screens
import HomePage    from './desktop/01-Homepage'
import ProductPage, { type QuoteSummary } from './desktop/02-Product-Details'
import ClaimsPage  from './desktop/03-Claims-Process'
import ContactPage from './desktop/04-Contact-Agent-Finder'

// Onboarding — public quote/application form
import { PublicOnboardingForm, TrackApplicationPage } from './modules/onboarding'

// Admin screens
import AdminDashboard from './admin/AdminDashboard'

// Mobile screens (preview entry — desktop remains the default experience)
import MobileOnboarding    from './mobile/01-Onboarding'
import MobileDashboard     from './mobile/02-Dashboard'
import MobileGetQuote      from './mobile/03-Get-Quote'
import MobilePolicyDetails from './mobile/04-Policy-Details'
import MobileClaimsSubmit  from './mobile/05-Claims-Submit'

type Page = 'home' | 'product' | 'claims' | 'contact' | 'quote' | 'track'
type MobileScreen = 'onboarding' | 'dashboard' | 'quote' | 'policy' | 'claims'

const pageFeature: Partial<Record<Page, FeatureKey>> = {
  product: 'products',
  claims: 'claims',
  contact: 'agents',
  quote: 'onboarding',
  track: 'onboarding',
}

const mobileScreens: { id: MobileScreen; label: string; feature?: FeatureKey }[] = [
  { id: 'onboarding', label: '01 Onboarding' },
  { id: 'dashboard',  label: '02 Dashboard', feature: 'dashboard' },
  { id: 'quote',      label: '03 Get Quote', feature: 'products' },
  { id: 'policy',     label: '04 Policy', feature: 'policies' },
  { id: 'claims',     label: '05 Claims', feature: 'claims' },
]

export default function App() {
  // Start on the cover page; buyer clicks "Open Kit" to enter the website
  const [showCover, setShowCover] = useState(true)
  const [page, setPage] = useState<Page>('home')
  const [quoteCategory, setQuoteCategory] = useState<string | undefined>()
  const [quoteSummary, setQuoteSummary] = useState<QuoteSummary | undefined>()
  const [admin, setAdmin] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>('onboarding')
  const { isEnabled } = useFeatures()
  const { isAuthenticated, isApiAuth, isReady } = useAuth()

  const navigate = (p: Page) => {
    const feature = pageFeature[p]
    if (feature && !isEnabled(feature)) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!showCover) window.scrollTo(0, 0)
  }, [page, showCover])

  // If the active desktop page is disabled, fall back to home
  useEffect(() => {
    const feature = pageFeature[page]
    if (feature && !isEnabled(feature)) setPage('home')
  }, [page, isEnabled])

  const visibleMobileScreens = mobileScreens.filter(s => !s.feature || isEnabled(s.feature))
  const activeMobileScreen = visibleMobileScreens.some(s => s.id === mobileScreen)
    ? mobileScreen
    : (visibleMobileScreens[0]?.id ?? 'onboarding')

  const exitAdmin = () => {
    setAdmin(false)
  }

  const requestQuote = (category?: string, quote?: QuoteSummary) => {
    setQuoteCategory(category)
    setQuoteSummary(quote)
    navigate('quote')
  }

  const quoteMessage = quoteSummary
    ? `Indicative quote from the calculator: ${quoteSummary.coverType} cover, ₦${quoteSummary.value.toLocaleString()} value, ${quoteSummary.state}, ~₦${quoteSummary.annualPremium.toLocaleString()}/year (₦${quoteSummary.monthlyPremium.toLocaleString()}/month).`
    : undefined

  // ── Admin mode — full-screen, no nav/footer
  if (admin) {
    if (isApiAuth && !isReady) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F3EF', fontFamily: 'var(--font-body)', color: '#64748B' }}>
          Restoring session…
        </div>
      )
    }
    if (isApiAuth && !isAuthenticated) {
      return <LoginPage onCancel={() => setAdmin(false)} />
    }
    return <AdminDashboard onExit={exitAdmin} />
  }

  // ── Mobile preview — full-screen, switcher only (mobile UI unmodified)
  if (mobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 8 }}>Mobile Preview</span>
          {visibleMobileScreens.map(s => (
            <button key={s.id} onClick={() => setMobileScreen(s.id)}
              style={{ padding: '6px 10px', borderRadius: 6, border: activeMobileScreen === s.id ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)', background: activeMobileScreen === s.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: activeMobileScreen === s.id ? 'white' : 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
              {s.label}
            </button>
          ))}
          <button onClick={() => setMobile(false)}
            style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
            Exit Mobile
          </button>
        </div>
        {activeMobileScreen === 'onboarding' && <MobileOnboarding />}
        {activeMobileScreen === 'dashboard'  && isEnabled('dashboard') && <MobileDashboard />}
        {activeMobileScreen === 'quote'      && isEnabled('products') && <MobileGetQuote />}
        {activeMobileScreen === 'policy'     && isEnabled('policies') && <MobilePolicyDetails />}
        {activeMobileScreen === 'claims'     && isEnabled('claims') && <MobileClaimsSubmit />}
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
        {page === 'product' && isEnabled('products') && <ProductPage onNavigate={navigate} onRequestQuote={requestQuote} />}
        {page === 'claims'  && isEnabled('claims') && <ClaimsPage  onNavigate={navigate} />}
        {page === 'contact' && isEnabled('agents') && <ContactPage onNavigate={navigate} />}
        {page === 'quote'   && isEnabled('onboarding') && <PublicOnboardingForm initialCategory={quoteCategory} initialMessage={quoteMessage} onBackToHome={() => navigate('home')} />}
        {page === 'track'   && isEnabled('onboarding') && <TrackApplicationPage onBackToHome={() => navigate('home')} />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  )
}
