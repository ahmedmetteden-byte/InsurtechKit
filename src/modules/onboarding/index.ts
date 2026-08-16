/**
 * Onboarding module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  LookupOnboardingApplicationInput,
  OnboardingApplication,
  OnboardingApplicationSummary,
  OnboardingDocument,
  OnboardingDocumentType,
  OnboardingStatus,
  SubmitOnboardingApplicationInput,
  UpdateOnboardingApplicationInput,
  UploadOnboardingDocumentInput,
} from './types/OnboardingApplication'

export {
  ONBOARDING_DOCUMENT_TYPES,
  ONBOARDING_STATUSES,
  onboardingDocumentTypeLabel,
  onboardingStatusLabel,
} from './types/OnboardingApplication'
export { OnboardingService } from '../../data/services'
export { ApiOnboardingService } from './services/ApiOnboardingService'
export { getPublicActiveProducts } from './services/publicCatalogue'
export { default as PublicOnboardingForm } from './pages/PublicOnboardingForm'
export { default as TrackApplicationPage } from './pages/TrackApplicationPage'
export { default as OnboardingQueue } from './pages/OnboardingQueue'
