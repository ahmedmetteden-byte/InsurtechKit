import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrandingProvider } from './config/BrandingContext'
import { FeatureProvider } from './config/FeatureContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandingProvider>
      <FeatureProvider>
        <App />
      </FeatureProvider>
    </BrandingProvider>
  </StrictMode>,
)
