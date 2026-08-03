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

type Page = 'home' | 'product' | 'claims' | 'contact'

export default function App() {
  // Start on the cover page; buyer clicks "Open Kit" to enter the website
  const [showCover, setShowCover] = useState(true)
  const [page, setPage] = useState<Page>('home')
  const [admin, setAdmin] = useState(false)

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

  // ── Cover / Start Here page — no nav/footer
  if (showCover) {
    return <Cover onEnter={() => setShowCover(false)} />
  }

  // ── Main website
  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--background)', minHeight: '100vh' }}>
      <NavBar current={page} onNavigate={navigate} onAdminClick={() => setAdmin(true)} />
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
