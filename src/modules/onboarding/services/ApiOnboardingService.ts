/**
 * ApiOnboardingService — mirrors OnboardingService; cache-backed for the staff queue.
 * `submit` hits the unauthenticated public endpoint and never touches the cache.
 */
import type {
  LookupOnboardingApplicationInput,
  OnboardingApplication,
  OnboardingApplicationSummary,
  OnboardingDocument,
  PayInvoiceInput,
  Payment,
  StaffUpdatePaymentInput,
  SubmitClaimInput,
  SubmitOnboardingApplicationInput,
  UpdateOnboardingApplicationInput,
  UploadOnboardingDocumentInput,
} from '../types/OnboardingApplication'
import type { Claim } from '../../claims'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api, apiFiles, saveBlob } from '../../../data/http'

class ApiOnboardingServiceImpl {
  private cache: OnboardingApplication[] = []

  async load(): Promise<void> {
    this.cache = await api.get<OnboardingApplication[]>('/onboarding/applications')
    emitMemoryDataChange()
  }

  getAll(): OnboardingApplication[] {
    return this.cache.map(a => ({ ...a }))
  }

  getById(id: string): OnboardingApplication | undefined {
    const found = this.cache.find(a => a.id === id)
    return found ? { ...found } : undefined
  }

  async submit(input: SubmitOnboardingApplicationInput): Promise<OnboardingApplication> {
    return api.post<OnboardingApplication>('/public/onboarding/applications', input)
  }

  async lookup(input: LookupOnboardingApplicationInput): Promise<OnboardingApplicationSummary> {
    return api.post<OnboardingApplicationSummary>('/public/onboarding/applications/lookup', input)
  }

  async uploadDocument(input: UploadOnboardingDocumentInput): Promise<OnboardingDocument> {
    const form = new FormData()
    form.append('document_type', input.documentType)
    form.append('file', input.file)
    return apiFiles.postForm<OnboardingDocument>(
      `/public/onboarding/applications/${input.applicationId}/documents`,
      form,
    )
  }

  async downloadDocument(applicationId: string, documentId: string, filename: string): Promise<void> {
    const blob = await apiFiles.getBlob(`/onboarding/applications/${applicationId}/documents/${documentId}/download`)
    saveBlob(blob, filename)
  }

  async pay(input: PayInvoiceInput): Promise<Payment> {
    return api.post<Payment>(
      `/public/onboarding/applications/${input.applicationId}/payments/${input.paymentId}/pay`,
      { method: input.method },
    )
  }

  async staffUpdatePayment(input: StaffUpdatePaymentInput): Promise<Payment> {
    const result = await api.put<Payment>(
      `/onboarding/applications/${input.applicationId}/payments/${input.paymentId}`,
      { status: input.status, method: input.method },
    )
    this.cache = this.cache.map(a =>
      a.id === input.applicationId
        ? { ...a, payments: a.payments.map(p => (p.id === result.id ? result : p)) }
        : a,
    )
    emitMemoryDataChange()
    return result
  }

  async downloadCertificate(applicationId: string): Promise<void> {
    const blob = await apiFiles.getBlob(`/public/onboarding/applications/${applicationId}/policy/certificate`)
    saveBlob(blob, `certificate-${applicationId}.pdf`)
  }

  async downloadReceipt(applicationId: string, paymentId: string): Promise<void> {
    const blob = await apiFiles.getBlob(`/public/onboarding/applications/${applicationId}/payments/${paymentId}/receipt`)
    saveBlob(blob, `receipt-${paymentId}.pdf`)
  }

  async submitClaim(input: SubmitClaimInput): Promise<Claim> {
    return api.post<Claim>(`/public/onboarding/applications/${input.applicationId}/claims`, {
      incidentDate: input.incidentDate,
      description: input.description,
      claimAmount: input.claimAmount,
    })
  }

  async update(input: UpdateOnboardingApplicationInput): Promise<OnboardingApplication | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<OnboardingApplication>(`/onboarding/applications/${id}`, patch)
    this.cache = this.cache.map(a => (a.id === id ? updated : a))
    emitMemoryDataChange()
    return { ...updated }
  }

  async reset(): Promise<void> {
    await this.load()
  }
}

export const ApiOnboardingService = new ApiOnboardingServiceImpl()
