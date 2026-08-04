/**
 * Policy domain model — shared by UI, services, and future FastAPI adapters.
 */

export type PolicyStatus = 'active' | 'pending' | 'expired' | 'cancelled'

export interface Policy {
  id: string
  policyNumber: string
  customerId: string
  productId: string
  customerName: string
  productName: string
  policyType: string
  effectiveDate: string
  expiryDate: string
  premium: number
  sumInsured: number
  currency: string
  status: PolicyStatus
  agent: string
  branch: string
  createdAt: string
  updatedAt: string
}

/** Payload for creating a policy (id and timestamps assigned by the service). */
export type CreatePolicyInput = Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>

/** Partial update payload; `id` required. */
export type UpdatePolicyInput = Partial<CreatePolicyInput> & { id: string }
