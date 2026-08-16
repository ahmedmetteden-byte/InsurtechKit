import { ProductService as MemoryProductService } from '../../products/services/ProductService'
import { CustomerService as MemoryCustomerService } from '../../customers/services/CustomerService'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { saveBlob } from '../../../data/http'
import type {
  LookupOnboardingApplicationInput,
  OnboardingApplication,
  OnboardingApplicationSummary,
  OnboardingDocument,
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

/** Memory-only wrapper — keeps the real File so "download" works without a backend. */
interface StoredDocument extends OnboardingDocument {
  file: File
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

/**
 * In-memory Onboarding service.
 * Swap the store implementation later for FastAPI HTTP calls without changing callers.
 */
class OnboardingServiceImpl {
  private applications: OnboardingApplication[] = []
  private documents: StoredDocument[] = []

  private documentsFor(applicationId: string): OnboardingDocument[] {
    return this.documents
      .filter(d => d.applicationId === applicationId)
      .map(({ file: _file, ...doc }) => doc)
  }

  private withDocuments(application: OnboardingApplication): OnboardingApplication {
    return { ...application, documents: this.documentsFor(application.id) }
  }

  getAll(): OnboardingApplication[] {
    return this.applications.map(a => this.withDocuments(a))
  }

  getById(id: string): OnboardingApplication | undefined {
    const found = this.applications.find(a => a.id === id)
    return found ? this.withDocuments(found) : undefined
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
      documents: this.documentsFor(application.id),
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
      documents: [],
      createdAt: now,
      updatedAt: now,
    }
    this.applications = [...this.applications, application]
    emitMemoryDataChange()
    return { ...application }
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
    this.applications = [
      ...this.applications.slice(0, index),
      updated,
      ...this.applications.slice(index + 1),
    ]
    emitMemoryDataChange()
    return this.withDocuments(updated)
  }

  /** Clear submissions (useful for demos / tests). */
  reset(): void {
    this.applications = []
    this.documents = []
    emitMemoryDataChange()
  }
}

export const OnboardingService = new OnboardingServiceImpl()
