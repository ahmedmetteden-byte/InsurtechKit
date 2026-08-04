/**
 * Policies module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  Policy,
  PolicyStatus,
  CreatePolicyInput,
  UpdatePolicyInput,
} from './types/Policy'

export { defaultPolicies } from './config/defaultPolicies'
export { PolicyService } from './services/PolicyService'
export { default as PolicyForm } from './components/PolicyForm'
export { default as PolicyManagement } from './pages/PolicyManagement'
