/**
 * Onboarding module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  OnboardingApplication,
  OnboardingStatus,
  SubmitOnboardingApplicationInput,
  UpdateOnboardingApplicationInput,
} from './types/OnboardingApplication'

export { ONBOARDING_STATUSES, onboardingStatusLabel } from './types/OnboardingApplication'
export { OnboardingService } from '../../data/services'
export { ApiOnboardingService } from './services/ApiOnboardingService'
export { getPublicActiveProducts } from './services/publicCatalogue'
export { default as PublicOnboardingForm } from './pages/PublicOnboardingForm'
export { default as OnboardingQueue } from './pages/OnboardingQueue'
