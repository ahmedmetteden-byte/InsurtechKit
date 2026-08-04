/**
 * Claims module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  Claim,
  ClaimStatus,
  CreateClaimInput,
  UpdateClaimInput,
} from './types/Claim'

export { claimStatusLabel } from './types/Claim'
export { defaultClaims } from './config/defaultClaims'
export { ClaimService } from '../../data/services'
export { ApiClaimService } from './services/ApiClaimService'
export { default as ClaimForm } from './components/ClaimForm'
export { default as ClaimManagement } from './pages/ClaimManagement'
