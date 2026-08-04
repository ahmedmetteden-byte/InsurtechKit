/**
 * Customer domain model — shared by UI, services, and future FastAPI adapters.
 */

export type CustomerType = 'Individual' | 'Corporate'

export type CustomerStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export type IdentificationType =
  | 'NIN'
  | 'BVN'
  | 'Passport'
  | 'Drivers Licence'
  | 'CAC'
  | 'TIN'
  | string

export type Gender = 'Male' | 'Female' | 'Other' | ''

export interface Customer {
  id: string
  customerNumber: string
  customerType: CustomerType
  firstName: string
  lastName: string
  companyName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: Gender
  identificationType: IdentificationType
  identificationNumber: string
  address: string
  city: string
  state: string
  country: string
  occupation: string
  status: CustomerStatus
  notes: string
  createdAt: string
  updatedAt: string
}

/** Payload for creating a customer (id and timestamps assigned by the service). */
export type CreateCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>

/** Partial update payload; `id` required. */
export type UpdateCustomerInput = Partial<CreateCustomerInput> & { id: string }

/** Display name: company for corporate, full name for individuals. */
export function customerDisplayName(c: Pick<Customer, 'customerType' | 'firstName' | 'lastName' | 'companyName'>): string {
  if (c.customerType === 'Corporate') {
    return c.companyName.trim() || 'Unnamed company'
  }
  return [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || 'Unnamed customer'
}
