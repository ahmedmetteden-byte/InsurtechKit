import { ProductService as MemoryProductService } from '../../products/services/ProductService'
import { CustomerService as MemoryCustomerService } from '../../customers/services/CustomerService'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import type {
  OnboardingApplication,
  SubmitOnboardingApplicationInput,
  UpdateOnboardingApplicationInput,
} from '../types/OnboardingApplication'

function newReference(): string {
  return `APP-${crypto.randomUUID().split('-')[0].toUpperCase()}`
}

function newCustomerNumber(): string {
  return `CUS-${crypto.randomUUID().split('-')[0].toUpperCase()}`
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

  getAll(): OnboardingApplication[] {
    return this.applications.map(a => ({ ...a }))
  }

  getById(id: string): OnboardingApplication | undefined {
    const found = this.applications.find(a => a.id === id)
    return found ? { ...found } : undefined
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
    return { ...updated }
  }

  /** Clear submissions (useful for demos / tests). */
  reset(): void {
    this.applications = []
    emitMemoryDataChange()
  }
}

export const OnboardingService = new OnboardingServiceImpl()
