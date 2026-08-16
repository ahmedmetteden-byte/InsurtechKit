/**
 * Onboarding application domain model — shared by UI, services, and future FastAPI adapters.
 */

export type OnboardingStatus =
  | 'submitted'
  | 'in_review'
  | 'info_required'
  | 'approved'
  | 'declined'

export interface OnboardingApplication {
  id: string
  reference: string
  productId: string
  productName: string
  applicantFirstName: string
  applicantLastName: string
  applicantEmail: string
  applicantPhone: string
  message: string
  consent: boolean
  consentAt: string
  status: OnboardingStatus
  reviewNotes: string
  createdAt: string
  updatedAt: string
}

/** Public submission payload — id/reference/status/timestamps assigned by the service. */
export interface SubmitOnboardingApplicationInput {
  productId: string
  applicantFirstName: string
  applicantLastName: string
  applicantEmail: string
  applicantPhone?: string
  message?: string
  consent: boolean
}

/** Staff review payload; `id` required. */
export interface UpdateOnboardingApplicationInput {
  id: string
  status?: OnboardingStatus
  reviewNotes?: string
}

export const ONBOARDING_STATUSES: OnboardingStatus[] = [
  'submitted',
  'in_review',
  'info_required',
  'approved',
  'declined',
]

export function onboardingStatusLabel(status: OnboardingStatus): string {
  const map: Record<OnboardingStatus, string> = {
    submitted: 'Submitted',
    in_review: 'In Review',
    info_required: 'More Info Required',
    approved: 'Approved',
    declined: 'Declined',
  }
  return map[status] ?? status
}
