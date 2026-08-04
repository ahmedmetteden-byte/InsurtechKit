/**
 * Active data services — selected by DATA_PROVIDER (memory | api).
 * Call sites should import from here (or module barrels that re-export these).
 */
import { isApiMode } from './config'

import { ProductService as MemoryProductService } from '../modules/products/services/ProductService'
import { ApiProductService } from '../modules/products/services/ApiProductService'

import { CustomerService as MemoryCustomerService } from '../modules/customers/services/CustomerService'
import { ApiCustomerService } from '../modules/customers/services/ApiCustomerService'

import { PolicyService as MemoryPolicyService } from '../modules/policies/services/PolicyService'
import { ApiPolicyService } from '../modules/policies/services/ApiPolicyService'

import { ClaimService as MemoryClaimService } from '../modules/claims/services/ClaimService'
import { ApiClaimService } from '../modules/claims/services/ApiClaimService'

import { UserService as MemoryUserService } from '../modules/users/services/UserService'
import { ApiUserService } from '../modules/users/services/ApiUserService'

import { IntegrationService as MemoryIntegrationService } from '../modules/integrations/services/IntegrationService'
import { ApiIntegrationService } from '../modules/integrations/services/ApiIntegrationService'

export const ProductService = isApiMode ? ApiProductService : MemoryProductService
export const CustomerService = isApiMode ? ApiCustomerService : MemoryCustomerService
export const PolicyService = isApiMode ? ApiPolicyService : MemoryPolicyService
export const ClaimService = isApiMode ? ApiClaimService : MemoryClaimService
export const UserService = isApiMode ? ApiUserService : MemoryUserService
export const IntegrationService = isApiMode ? ApiIntegrationService : MemoryIntegrationService

/** Hydrate API caches before rendering admin data screens. No-op in memory mode. */
export async function hydrateApiData(): Promise<void> {
  if (!isApiMode) return
  await Promise.all([
    ApiProductService.load(),
    ApiCustomerService.load(),
    ApiPolicyService.load(),
    ApiClaimService.load(),
    ApiUserService.load(),
    ApiIntegrationService.load(),
  ])
}
