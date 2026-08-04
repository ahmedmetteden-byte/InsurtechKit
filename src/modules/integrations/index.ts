/**
 * Integrations module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  Integration,
  IntegrationType,
  IntegrationStatus,
  CreateIntegrationInput,
  UpdateIntegrationInput,
} from './types/Integration'

export {
  INTEGRATION_TYPES,
  INTEGRATION_STATUSES,
  integrationStatusLabel,
} from './types/Integration'

export { defaultIntegrations } from './config/defaultIntegrations'
export { PROVIDERS_BY_TYPE, providersForType } from './config/providers'
export { IntegrationService } from '../../data/services'
export { ApiIntegrationService } from './services/ApiIntegrationService'
export { default as IntegrationForm } from './components/IntegrationForm'
export { default as IntegrationManagement } from './pages/IntegrationManagement'
