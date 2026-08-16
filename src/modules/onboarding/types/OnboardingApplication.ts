/**
 * Onboarding application domain model — shared by UI, services, and future FastAPI adapters.
 */
import type { Claim, ClaimStatus } from '../../claims'

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
  /** Set once the invoice is paid and a policy is issued. */
  policyId: string
  policyNumber: string
  documents: OnboardingDocument[]
  /** Staff-only log of notifications sent to the applicant — not shown on the public tracking page. */
  notifications: OnboardingNotification[]
  /** Invoice(s) generated on approval — visible to both staff and the applicant. */
  payments: Payment[]
  /** Claims filed against the issued policy. */
  claims: Claim[]
  createdAt: string
  updatedAt: string
}

/** Public, trimmed claim view — omits staff-only fields (notes, assignedTo). */
export interface PublicClaim {
  id: string
  claimNumber: string
  status: ClaimStatus
  incidentDate: string
  reportedDate: string
  claimAmount: number
  approvedAmount: number
  currency: string
  description: string
  createdAt: string
}

export interface SubmitClaimInput {
  applicationId: string
  incidentDate: string
  description: string
  claimAmount: number
}

export type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer' | 'other'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export const PAYMENT_METHODS: PaymentMethod[] = ['paystack', 'flutterwave', 'bank_transfer']

export function paymentMethodLabel(method: PaymentMethod | string): string {
  const map: Record<string, string> = {
    paystack: 'Paystack',
    flutterwave: 'Flutterwave',
    bank_transfer: 'Bank Transfer',
    other: 'Other',
  }
  return map[method] ?? method
}

export interface Payment {
  id: string
  reference: string
  customerId: string
  amount: number
  currency: string
  method: string
  status: PaymentStatus
  description: string
  paidAt: string
  receiptNumber: string
  createdAt: string
  updatedAt: string
}

export interface OnboardingNotification {
  id: string
  channel: 'email'
  recipient: string
  subject: string
  body: string
  templateKey: string
  status: string
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
  policyNumber: string
  documents: OnboardingDocument[]
  payments: Payment[]
  claims: PublicClaim[]
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

export interface PayInvoiceInput {
  applicationId: string
  paymentId: string
  method: PaymentMethod
}

export interface StaffUpdatePaymentInput {
  applicationId: string
  paymentId: string
  status: 'paid' | 'refunded'
  method?: PaymentMethod
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
