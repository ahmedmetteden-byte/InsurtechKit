/**
 * Customers module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  Customer,
  CustomerType,
  CustomerStatus,
  IdentificationType,
  Gender,
  CreateCustomerInput,
  UpdateCustomerInput,
} from './types/Customer'

export { customerDisplayName } from './types/Customer'
export { defaultCustomers } from './config/defaultCustomers'
export { CustomerService } from './services/CustomerService'
export { default as CustomerForm } from './components/CustomerForm'
export { default as CustomerManagement } from './pages/CustomerManagement'
