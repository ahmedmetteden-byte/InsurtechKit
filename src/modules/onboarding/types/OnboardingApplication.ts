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
  /** Set once the application is approved and converted into a Customer record. */
  customerId: string
  documents: OnboardingDocument[]
  createdAt: string
  updatedAt: string
}

export type OnboardingDocumentType = 'identification' | 'proof_of_address' | 'other'

export const ONBOARDING_DOCUMENT_TYPES: OnboardingDocumentType[] = ['identification', 'proof_of_address', 'other']

export function onboardingDocumentTypeLabel(type: OnboardingDocumentType): string {
  const map: Record<OnboardingDocumentType, string> = {
    identification: 'Identification (ID/Passport)',
    proof_of_address: 'Proof of Address',
    other: 'Other',
  }
  return map[type] ?? type
}

export interface OnboardingDocument {
  id: string
  applicationId: string
  documentType: OnboardingDocumentType
  originalFilename: string
  contentType: string
  sizeBytes: number
  createdAt: string
  updatedAt: string
}

/** Public, email-gated status view — used by applicants to track their own application. */
export interface OnboardingApplicationSummary {
  id: string
  reference: string
  productName: string
  applicantFirstName: string
  applicantLastName: string
  status: OnboardingStatus
  createdAt: string
  documents: OnboardingDocument[]
}

export interface LookupOnboardingApplicationInput {
  reference: string
  email: string
}

export interface UploadOnboardingDocumentInput {
  applicationId: string
  documentType: OnboardingDocumentType
  file: File
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
