/**
 * Claim domain model — shared by UI, services, and future FastAPI adapters.
 */

export type ClaimStatus =
  | 'open'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'paid'

export interface Claim {
  id: string
  claimNumber: string
  policyId: string
  policyNumber: string
  customerId: string
  customerName: string
  productName: string
  incidentDate: string
  reportedDate: string
  claimAmount: number
  approvedAmount: number
  currency: string
  description: string
  status: ClaimStatus
  assignedTo: string
  notes: string
  createdAt: string
  updatedAt: string
}

/** Payload for creating a claim (id and timestamps assigned by the service). */
export type CreateClaimInput = Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>

/** Partial update payload; `id` required. */
export type UpdateClaimInput = Partial<CreateClaimInput> & { id: string }

export function claimStatusLabel(status: ClaimStatus): string {
  const map: Record<ClaimStatus, string> = {
    open: 'Open',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
  }
  return map[status] ?? status
}
