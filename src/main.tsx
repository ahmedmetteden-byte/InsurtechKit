import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext'
import { BrandingProvider } from './config/BrandingContext'
import { FeatureProvider } from './config/FeatureContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandingProvider>
      <FeatureProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FeatureProvider>
    </BrandingProvider>
  </StrictMode>,
)
