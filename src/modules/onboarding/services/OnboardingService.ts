import { ProductService as MemoryProductService } from '../../products/services/ProductService'
import { CustomerService as MemoryCustomerService } from '../../customers/services/CustomerService'
import { PolicyService as MemoryPolicyService } from '../../policies/services/PolicyService'
import { ClaimService as MemoryClaimService } from '../../claims/services/ClaimService'
import type { Claim } from '../../claims'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { defaultBranding } from '../../../config/branding'
import { saveBlob } from '../../../data/http'
import { buildReceiptPdf } from '../../../utils/pdf'
import type {
  LookupOnboardingApplicationInput,
  OnboardingApplication,
  OnboardingApplicationSummary,
  OnboardingDocument,
  OnboardingNotification,
  OnboardingStatus,
  PayInvoiceInput,
  Payment,
  PublicClaim,
  StaffUpdatePaymentInput,
  SubmitClaimInput,
  SubmitOnboardingApplicationInput,
  UpdateOnboardingApplicationInput,
  UploadOnboardingDocumentInput,
} from '../types/OnboardingApplication'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_UPLOAD_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

function newReference(): string {
  return `APP-${crypto.randomUUID().split('-')[0].toUpperCase()}`
}

function newCustomerNumber(): string {
  return `CUS-${crypto.randomUUID().split('-')[0].toUpperCase()}`
}

function newPaymentReference(): string {
  return `PAY-${crypto.randomUUID().split('-')[0].toUpperCase()}`
}

function newReceiptNumber(): string {
  return `RCT-${crypto.randomUUID().split('-')[0].toUpperCase()}`
}

function newPolicyNumber(): string {
  return `POL-${crypto.randomUUID().split('-')[0].toUpperCase()}`
}

function newClaimNumber(): string {
  return `CLM-${crypto.randomUUID().split('-')[0].toUpperCase()}`
}

/** Memory-only wrapper — keeps the real File so "download" works without a backend. */
interface StoredDocument extends OnboardingDocument {
  file: File
}

/** Memory-only wrapper — tags each notification with the application it belongs to. */
interface StoredNotification extends OnboardingNotification {
  applicationId: string
}

/** Memory-only wrapper — tags each payment with the application it belongs to. */
interface StoredPayment extends Payment {
  applicationId: string
}

/**
 * Notification templates + the "provider" (mirrors the backend's log-based
 * adapter — swap for a real email/SMS call later without touching callers).
 */
const NOTIFICATION_TEMPLATES: Record<string, (ctx: Record<string, string>) => [string, string]> = {
  application_submitted: ctx => [
    `We've received your ${ctx.productName} application — ${ctx.reference}`,
    `Hi ${ctx.firstName}, thanks for applying for ${ctx.productName}. Your reference number is ${ctx.reference}. We'll be in touch soon.`,
  ],
  application_info_required: ctx => [
    `Action needed on application ${ctx.reference}`,
    `Hi ${ctx.firstName}, we need a bit more information to continue reviewing your ${ctx.productName} application (${ctx.reference}). Visit Track Application and upload the requested documents.`,
  ],
  application_approved: ctx => [
    `You're approved — ${ctx.reference}`,
    `Hi ${ctx.firstName}, great news — your ${ctx.productName} application (${ctx.reference}) has been approved. Our team will be in touch about next steps.`,
  ],
  application_declined: ctx => [
    `Update on your application — ${ctx.reference}`,
    `Hi ${ctx.firstName}, thank you for applying for ${ctx.productName}. We're unable to proceed with application ${ctx.reference} at this time.`,
  ],
  document_received: ctx => [
    `We received your document — ${ctx.reference}`,
    `Hi ${ctx.firstName}, we've received ${ctx.filename} for your application ${ctx.reference}. Our team will review it shortly.`,
  ],
  payment_received: ctx => [
    `Payment received — ${ctx.reference}`,
    `Hi ${ctx.firstName}, we've received your payment of ${ctx.amount} for application ${ctx.reference}. Receipt number: ${ctx.receiptNumber}.`,
  ],
  payment_refunded: ctx => [
    `Refund processed — ${ctx.reference}`,
    `Hi ${ctx.firstName}, your payment for application ${ctx.reference} has been refunded.`,
  ],
  claim_submitted: ctx => [
    `Claim received — ${ctx.claimNumber}`,
    `Hi ${ctx.firstName}, we've received your claim ${ctx.claimNumber}. Our claims team will review it shortly.`,
  ],
}

const STATUS_NOTIFICATION_TEMPLATE: Partial<Record<OnboardingStatus, string>> = {
  info_required: 'application_info_required',
  approved: 'application_approved',
  declined: 'application_declined',
}

function buildNotification(templateKey: string, recipient: string, ctx: Record<string, string>): OnboardingNotification {
  const [subject, body] = NOTIFICATION_TEMPLATES[templateKey](ctx)
  console.log(`[notify:email] -> ${recipient} | ${subject}`)
  const now = new Date().toISOString()
  return {
    id: `ntf-${crypto.randomUUID()}`,
    channel: 'email',
    recipient,
    subject,
    body,
    templateKey,
    status: 'sent',
    createdAt: now,
    updatedAt: now,
  }
}

/** Approving an application onboards the applicant as a real customer record. */
function convertToCustomer(application: OnboardingApplication): string {
  const customer = MemoryCustomerService.create({
    customerNumber: newCustomerNumber(),
    customerType: 'Individual',
    firstName: application.applicantFirstName,
    lastName: application.applicantLastName,
    companyName: '',
    email: application.applicantEmail,
    phone: application.applicantPhone,
    dateOfBirth: '',
    gender: '',
    identificationType: '',
    identificationNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    occupation: '',
    status: 'active',
    notes: `Converted from onboarding application ${application.reference}.`,
  })
  return customer.id
}

/** A paid invoice issues a real policy record. */
function issuePolicy(application: OnboardingApplication, payment: Payment): string {
  const product = MemoryProductService.getById(application.productId)
  const today = new Date()
  const expiry = new Date(today)
  expiry.setFullYear(expiry.getFullYear() + 1)
  const policy = MemoryPolicyService.create({
    policyNumber: newPolicyNumber(),
    customerId: application.customerId,
    productId: application.productId,
    customerName: `${application.applicantFirstName} ${application.applicantLastName}`,
    productName: application.productName,
    policyType: product?.category ?? '',
    effectiveDate: today.toISOString().slice(0, 10),
    expiryDate: expiry.toISOString().slice(0, 10),
    premium: payment.amount,
    sumInsured: 0,
    currency: payment.currency,
    status: 'active',
    agent: '',
    branch: '',
  })
  return policy.id
}

/**
 * In-memory Onboarding service.
 * Swap the store implementation later for FastAPI HTTP calls without changing callers.
 */
class OnboardingServiceImpl {
  private applications: OnboardingApplication[] = []
  private documents: StoredDocument[] = []
  private notifications: StoredNotification[] = []
  private payments: StoredPayment[] = []

  private documentsFor(applicationId: string): OnboardingDocument[] {
    return this.documents
      .filter(d => d.applicationId === applicationId)
      .map(({ file: _file, ...doc }) => doc)
  }

  private notificationsFor(applicationId: string): OnboardingNotification[] {
    return this.notifications
      .filter(n => n.applicationId === applicationId)
      .map(({ applicationId: _applicationId, ...notification }) => notification)
  }

  private paymentsFor(applicationId: string): Payment[] {
    return this.payments
      .filter(p => p.applicationId === applicationId)
      .map(({ applicationId: _applicationId, ...payment }) => payment)
  }

  private policyNumberFor(policyId: string): string {
    if (!policyId) return ''
    return MemoryPolicyService.getById(policyId)?.policyNumber ?? ''
  }

  private claimsFor(policyId: string): Claim[] {
    if (!policyId) return []
    return MemoryClaimService.getAll().filter(c => c.policyId === policyId)
  }

  private publicClaimsFor(policyId: string): PublicClaim[] {
    return this.claimsFor(policyId).map(c => ({
      id: c.id,
      claimNumber: c.claimNumber,
      status: c.status,
      incidentDate: c.incidentDate,
      reportedDate: c.reportedDate,
      claimAmount: c.claimAmount,
      approvedAmount: c.approvedAmount,
      currency: c.currency,
      description: c.description,
      createdAt: c.createdAt,
    }))
  }

  private notify(templateKey: string, application: OnboardingApplication, extra?: Record<string, string>): void {
    const notification = buildNotification(templateKey, application.applicantEmail, {
      firstName: application.applicantFirstName,
      productName: application.productName,
      reference: application.reference,
      ...extra,
    })
    this.notifications = [...this.notifications, { ...notification, applicationId: application.id }]
  }

  private createInvoice(application: OnboardingApplication): void {
    const product = MemoryProductService.getById(application.productId)
    const now = new Date().toISOString()
    const payment: StoredPayment = {
      id: `pay-${crypto.randomUUID()}`,
      applicationId: application.id,
      reference: newPaymentReference(),
      customerId: application.customerId,
      amount: product?.minimumPremium ?? 0,
      currency: product?.currency ?? 'NGN',
      method: '',
      status: 'pending',
      description: `Premium for ${application.productName} — ${application.reference}`,
      paidAt: '',
      receiptNumber: '',
      createdAt: now,
      updatedAt: now,
    }
    this.payments = [...this.payments, payment]
  }

  private withRelated(application: OnboardingApplication): OnboardingApplication {
    return {
      ...application,
      policyNumber: this.policyNumberFor(application.policyId),
      documents: this.documentsFor(application.id),
      notifications: this.notificationsFor(application.id),
      payments: this.paymentsFor(application.id),
      claims: this.claimsFor(application.policyId),
    }
  }

  getAll(): OnboardingApplication[] {
    return this.applications.map(a => this.withRelated(a))
  }

  getById(id: string): OnboardingApplication | undefined {
    const found = this.applications.find(a => a.id === id)
    return found ? this.withRelated(found) : undefined
  }

  lookup(input: LookupOnboardingApplicationInput): OnboardingApplicationSummary {
    const reference = input.reference.trim().toUpperCase()
    const email = input.email.trim().toLowerCase()
    const application = this.applications.find(a => a.reference === reference && a.applicantEmail === email)
    if (!application) {
      throw new Error('No application found for that reference and email')
    }
    return {
      id: application.id,
      reference: application.reference,
      productName: application.productName,
      applicantFirstName: application.applicantFirstName,
      applicantLastName: application.applicantLastName,
      status: application.status,
      createdAt: application.createdAt,
      policyNumber: this.policyNumberFor(application.policyId),
      documents: this.documentsFor(application.id),
      payments: this.paymentsFor(application.id),
      claims: this.publicClaimsFor(application.policyId),
    }
  }

  uploadDocument(input: UploadOnboardingDocumentInput): OnboardingDocument {
    const application = this.applications.find(a => a.id === input.applicationId)
    if (!application) {
      throw new Error('Application not found')
    }
    if (application.status !== 'info_required') {
      throw new Error("Documents can only be uploaded while the application is marked 'More Info Required'.")
    }
    if (input.file.size === 0) {
      throw new Error('Uploaded file is empty')
    }
    if (input.file.size > MAX_UPLOAD_BYTES) {
      throw new Error('File exceeds the 10MB upload limit')
    }
    if (!ALLOWED_UPLOAD_TYPES.has(input.file.type)) {
      throw new Error('Unsupported file type. Upload a PDF, JPG, PNG, or WEBP file.')
    }
    const now = new Date().toISOString()
    const document: StoredDocument = {
      id: `doc-${crypto.randomUUID()}`,
      applicationId: input.applicationId,
      documentType: input.documentType,
      originalFilename: input.file.name,
      contentType: input.file.type,
      sizeBytes: input.file.size,
      createdAt: now,
      updatedAt: now,
      file: input.file,
    }
    this.documents = [...this.documents, document]
    this.notify('document_received', application, { filename: input.file.name })
    emitMemoryDataChange()
    const { file: _file, ...doc } = document
    return doc
  }

  downloadDocument(_applicationId: string, documentId: string, _filename?: string): void {
    const document = this.documents.find(d => d.id === documentId)
    if (!document) return
    saveBlob(document.file, document.originalFilename)
  }

  submit(input: SubmitOnboardingApplicationInput): OnboardingApplication {
    if (!input.consent) {
      throw new Error('Consent is required to submit an application')
    }
    const product = MemoryProductService.getById(input.productId)
    const now = new Date().toISOString()
    const application: OnboardingApplication = {
      id: `app-${crypto.randomUUID()}`,
      reference: newReference(),
      productId: input.productId,
      productName: product?.name ?? '',
      applicantFirstName: input.applicantFirstName,
      applicantLastName: input.applicantLastName,
      applicantEmail: input.applicantEmail,
      applicantPhone: input.applicantPhone ?? '',
      message: input.message ?? '',
      consent: true,
      consentAt: now,
      status: 'submitted',
      reviewNotes: '',
      customerId: '',
      policyId: '',
      policyNumber: '',
      documents: [],
      notifications: [],
      payments: [],
      claims: [],
      createdAt: now,
      updatedAt: now,
    }
    this.applications = [...this.applications, application]
    this.notify('application_submitted', application)
    emitMemoryDataChange()
    return this.withRelated(application)
  }

  update(input: UpdateOnboardingApplicationInput): OnboardingApplication | undefined {
    const index = this.applications.findIndex(a => a.id === input.id)
    if (index === -1) return undefined

    const current = this.applications[index]
    const updated: OnboardingApplication = {
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    if (updated.status === 'approved' && !updated.customerId) {
      updated.customerId = convertToCustomer(updated)
    }
    if (updated.status === 'approved' && this.paymentsFor(updated.id).length === 0) {
      this.createInvoice(updated)
    }
    if (updated.status !== current.status) {
      const templateKey = STATUS_NOTIFICATION_TEMPLATE[updated.status]
      if (templateKey) {
        this.notify(templateKey, updated)
      }
    }
    this.applications = [
      ...this.applications.slice(0, index),
      updated,
      ...this.applications.slice(index + 1),
    ]
    emitMemoryDataChange()
    return this.withRelated(updated)
  }

  /** Public, simulated checkout — no live gateway is called. */
  pay(input: PayInvoiceInput): Payment {
    const application = this.applications.find(a => a.id === input.applicationId)
    if (!application) {
      throw new Error('Application not found')
    }
    if (application.status !== 'approved') {
      throw new Error('Payment is only available once the application has been approved.')
    }
    const index = this.payments.findIndex(p => p.id === input.paymentId && p.applicationId === input.applicationId)
    if (index === -1) {
      throw new Error('Payment not found')
    }
    const payment = this.payments[index]
    if (payment.status === 'paid') {
      throw new Error('Payment has already been marked as paid')
    }
    if (payment.status === 'refunded') {
      throw new Error('This payment was refunded and cannot be marked as paid')
    }
    const now = new Date().toISOString()
    const updated: StoredPayment = {
      ...payment,
      status: 'paid',
      method: input.method,
      paidAt: now,
      receiptNumber: newReceiptNumber(),
      updatedAt: now,
    }
    this.payments = [...this.payments.slice(0, index), updated, ...this.payments.slice(index + 1)]
    const { applicationId: _applicationId, ...result } = updated
    this.handlePaymentSuccess(application, result)
    emitMemoryDataChange()
    return result
  }

  /** Memory mode has no backend to verify a real Paystack transaction against,
   *  so a "confirm" here just completes the simulated payment. */
  confirmPayment(applicationId: string, paymentId: string, _reference: string): Payment {
    return this.pay({ applicationId, paymentId, method: 'paystack' })
  }

  private handlePaymentSuccess(application: OnboardingApplication, payment: Payment): void {
    if (!application.policyId) {
      const policyId = issuePolicy(application, payment)
      const index = this.applications.findIndex(a => a.id === application.id)
      if (index !== -1) {
        this.applications = [
          ...this.applications.slice(0, index),
          { ...this.applications[index], policyId },
          ...this.applications.slice(index + 1),
        ]
      }
    }
    this.notify('payment_received', application, {
      amount: `${payment.currency} ${payment.amount.toLocaleString()}`,
      receiptNumber: payment.receiptNumber,
    })
  }

  /** Staff override — e.g. reconciling a bank transfer, or issuing a refund. */
  staffUpdatePayment(input: StaffUpdatePaymentInput): Payment {
    const application = this.applications.find(a => a.id === input.applicationId)
    if (!application) {
      throw new Error('Application not found')
    }
    const index = this.payments.findIndex(p => p.id === input.paymentId && p.applicationId === input.applicationId)
    if (index === -1) {
      throw new Error('Payment not found')
    }
    const payment = this.payments[index]
    const now = new Date().toISOString()

    if (input.status === 'paid') {
      if (payment.status === 'paid') throw new Error('Payment has already been marked as paid')
      if (payment.status === 'refunded') throw new Error('This payment was refunded and cannot be marked as paid')
      const updated: StoredPayment = {
        ...payment,
        status: 'paid',
        method: input.method ?? 'bank_transfer',
        paidAt: now,
        receiptNumber: newReceiptNumber(),
        updatedAt: now,
      }
      this.payments = [...this.payments.slice(0, index), updated, ...this.payments.slice(index + 1)]
      const { applicationId: _applicationId, ...result } = updated
      this.handlePaymentSuccess(application, result)
      emitMemoryDataChange()
      return result
    }

    if (input.status === 'refunded') {
      if (payment.status !== 'paid') throw new Error('Only paid payments can be refunded')
      const updated: StoredPayment = { ...payment, status: 'refunded', updatedAt: now }
      this.payments = [...this.payments.slice(0, index), updated, ...this.payments.slice(index + 1)]
      this.notify('payment_refunded', application, {})
      emitMemoryDataChange()
      const { applicationId: _applicationId, ...result } = updated
      return result
    }

    throw new Error('Invalid payment status')
  }

  /** Public — files a claim against the policy issued for this application. */
  submitClaim(input: SubmitClaimInput): Claim {
    const application = this.applications.find(a => a.id === input.applicationId)
    if (!application) {
      throw new Error('Application not found')
    }
    if (!application.policyId) {
      throw new Error('A claim can only be filed once your policy has been issued (after payment).')
    }
    const policy = MemoryPolicyService.getById(application.policyId)
    if (!policy) {
      throw new Error('Policy not found')
    }
    const claim = MemoryClaimService.create({
      claimNumber: newClaimNumber(),
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      customerId: application.customerId,
      customerName: `${application.applicantFirstName} ${application.applicantLastName}`,
      productName: application.productName,
      incidentDate: input.incidentDate,
      reportedDate: new Date().toISOString().slice(0, 10),
      claimAmount: input.claimAmount,
      approvedAmount: 0,
      currency: policy.currency,
      description: input.description,
      status: 'open',
      assignedTo: '',
      notes: '',
    })
    this.notify('claim_submitted', application, { claimNumber: claim.claimNumber })
    emitMemoryDataChange()
    return claim
  }

  downloadCertificate(applicationId: string): void {
    const application = this.applications.find(a => a.id === applicationId)
    if (!application || !application.policyId) {
      throw new Error('No policy has been issued yet.')
    }
    MemoryPolicyService.downloadCertificate(application.policyId)
  }

  downloadReceipt(applicationId: string, paymentId: string): void {
    const application = this.applications.find(a => a.id === applicationId)
    if (!application) {
      throw new Error('Application not found')
    }
    const payment = this.payments.find(p => p.id === paymentId && p.applicationId === applicationId)
    if (!payment) {
      throw new Error('Payment not found')
    }
    if (payment.status !== 'paid') {
      throw new Error('Receipt is only available once payment has been made.')
    }
    const blob = buildReceiptPdf({
      companyName: defaultBranding.companyName,
      receiptNumber: payment.receiptNumber,
      reference: payment.reference,
      customerName: `${application.applicantFirstName} ${application.applicantLastName}`,
      description: payment.description,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      paidAt: payment.paidAt,
    })
    saveBlob(blob, `receipt-${payment.receiptNumber}.pdf`)
  }

  /** Clear submissions (useful for demos / tests). */
  reset(): void {
    this.applications = []
    this.documents = []
    this.notifications = []
    this.payments = []
    emitMemoryDataChange()
  }
}

export const OnboardingService = new OnboardingServiceImpl()
