import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrandingProvider } from './config/BrandingContext'
import { FeatureProvider } from './config/FeatureContext'
import { hydrateApiData } from './data/services'
import { DATA_PROVIDER } from './data/config'
import './index.css'

async function bootstrap() {
  if (DATA_PROVIDER === 'api') {
    try {
      await hydrateApiData()
    } catch (err) {
      console.error('[InsurtechKit] Failed to hydrate API data. Is the FastAPI server running?', err)
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrandingProvider>
        <FeatureProvider>
          <App />
        </FeatureProvider>
      </BrandingProvider>
    </StrictMode>,
  )
}

bootstrap()
