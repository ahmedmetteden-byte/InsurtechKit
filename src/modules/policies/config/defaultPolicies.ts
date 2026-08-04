import { defaultCustomers } from '../../customers/config/defaultCustomers'
import { customerDisplayName } from '../../customers/types/Customer'
import { defaultProducts } from '../../products/config/defaultProducts'
import type { Policy } from '../types/Policy'

function cust(id: string) {
  const c = defaultCustomers.find(x => x.id === id)
  if (!c) throw new Error(`Seed customer missing: ${id}`)
  return { id: c.id, name: customerDisplayName(c) }
}

function prod(id: string) {
  const p = defaultProducts.find(x => x.id === id)
  if (!p) throw new Error(`Seed product missing: ${id}`)
  return { id: p.id, name: p.name, type: String(p.category) }
}

/**
 * Seed policies for the Policies module (in-memory only).
 * Every row references valid customer and product IDs from the sibling modules.
 */
export const defaultPolicies: Policy[] = [
  (() => {
    const c = cust('cus-001'); const p = prod('prd-motor-comp')
    return {
      id: 'pol-001', policyNumber: 'POL-2024-0001', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-01-20', expiryDate: '2025-01-19', premium: 125000, sumInsured: 8500000,
      currency: 'NGN', status: 'active', agent: 'Kunle Adesanya', branch: 'Lagos Island',
      createdAt: '2024-01-20T09:00:00.000Z', updatedAt: '2024-11-01T10:00:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-002'); const p = prod('prd-health')
    return {
      id: 'pol-002', policyNumber: 'POL-2024-0002', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-02-01', expiryDate: '2025-01-31', premium: 78000, sumInsured: 5000000,
      currency: 'NGN', status: 'active', agent: 'Amaka Okeke', branch: 'Abuja Central',
      createdAt: '2024-02-01T10:00:00.000Z', updatedAt: '2024-10-15T08:00:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-003'); const p = prod('prd-motor-comp')
    return {
      id: 'pol-003', policyNumber: 'POL-2024-0003', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-02-10', expiryDate: '2025-02-09', premium: 2450000, sumInsured: 168000000,
      currency: 'NGN', status: 'active', agent: 'Kunle Adesanya', branch: 'Apapa',
      createdAt: '2024-02-10T11:00:00.000Z', updatedAt: '2024-11-12T14:00:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-004'); const p = prod('prd-motor-tp')
    return {
      id: 'pol-004', policyNumber: 'POL-2024-0004', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-03-01', expiryDate: '2025-02-28', premium: 18500, sumInsured: 0,
      currency: 'NGN', status: 'active', agent: 'Chidi Nwosu', branch: 'Port Harcourt',
      createdAt: '2024-03-01T09:30:00.000Z', updatedAt: '2024-09-30T16:45:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-005'); const p = prod('prd-fire')
    return {
      id: 'pol-005', policyNumber: 'POL-2024-0005', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-03-15', expiryDate: '2025-03-14', premium: 920000, sumInsured: 450000000,
      currency: 'NGN', status: 'active', agent: 'Hauwa Ibrahim', branch: 'Kano',
      createdAt: '2024-03-15T08:00:00.000Z', updatedAt: '2024-11-01T10:00:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-005'); const p = prod('prd-marine')
    return {
      id: 'pol-006', policyNumber: 'POL-2024-0006', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-04-01', expiryDate: '2025-03-31', premium: 1850000, sumInsured: 320000000,
      currency: 'NGN', status: 'pending', agent: 'Hauwa Ibrahim', branch: 'Kano',
      createdAt: '2024-04-01T12:00:00.000Z', updatedAt: '2024-11-18T13:10:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-006'); const p = prod('prd-travel')
    return {
      id: 'pol-007', policyNumber: 'POL-2024-0007', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-05-01', expiryDate: '2025-04-30', premium: 42000, sumInsured: 25000000,
      currency: 'NGN', status: 'active', agent: 'Amaka Okeke', branch: 'Ibadan',
      createdAt: '2024-05-01T09:00:00.000Z', updatedAt: '2024-10-22T09:30:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-007'); const p = prod('prd-health')
    return {
      id: 'pol-008', policyNumber: 'POL-2024-0008', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-05-12', expiryDate: '2025-05-11', premium: 6400000, sumInsured: 120000000,
      currency: 'NGN', status: 'pending', agent: 'Kunle Adesanya', branch: 'Lekki',
      createdAt: '2024-05-12T10:00:00.000Z', updatedAt: '2024-11-18T13:10:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-008'); const p = prod('prd-motor-comp')
    return {
      id: 'pol-009', policyNumber: 'POL-2023-0188', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2023-06-01', expiryDate: '2024-05-31', premium: 98000, sumInsured: 4200000,
      currency: 'NGN', status: 'expired', agent: 'Chidi Nwosu', branch: 'Enugu',
      createdAt: '2023-06-01T08:00:00.000Z', updatedAt: '2024-06-01T07:00:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-009'); const p = prod('prd-marine')
    return {
      id: 'pol-010', policyNumber: 'POL-2024-0010', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-06-15', expiryDate: '2025-06-14', premium: 3750000, sumInsured: 890000000,
      currency: 'NGN', status: 'active', agent: 'Tolu Adeyemi', branch: 'Warri',
      createdAt: '2024-06-15T11:00:00.000Z', updatedAt: '2024-11-05T15:40:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-010'); const p = prod('prd-life')
    return {
      id: 'pol-011', policyNumber: 'POL-2024-0011', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-07-01', expiryDate: '2025-06-30', premium: 45000, sumInsured: 10000000,
      currency: 'NGN', status: 'active', agent: 'Hauwa Ibrahim', branch: 'Kaduna',
      createdAt: '2024-07-01T09:00:00.000Z', updatedAt: '2024-10-08T12:15:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-011'); const p = prod('prd-motor-tp')
    return {
      id: 'pol-012', policyNumber: 'POL-2024-0012', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-07-20', expiryDate: '2025-07-19', premium: 15000, sumInsured: 0,
      currency: 'NGN', status: 'cancelled', agent: 'Amaka Okeke', branch: 'Ikeja',
      createdAt: '2024-07-20T14:00:00.000Z', updatedAt: '2024-11-20T09:00:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-012'); const p = prod('prd-fire')
    return {
      id: 'pol-013', policyNumber: 'POL-2024-0013', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-08-01', expiryDate: '2025-07-31', premium: 1120000, sumInsured: 275000000,
      currency: 'NGN', status: 'active', agent: 'Amaka Okeke', branch: 'Abuja Central',
      createdAt: '2024-08-01T08:30:00.000Z', updatedAt: '2024-11-14T16:20:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-001'); const p = prod('prd-travel')
    return {
      id: 'pol-014', policyNumber: 'POL-2024-0014', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-09-10', expiryDate: '2025-09-09', premium: 28000, sumInsured: 15000000,
      currency: 'NGN', status: 'active', agent: 'Kunle Adesanya', branch: 'Lagos Island',
      createdAt: '2024-09-10T10:00:00.000Z', updatedAt: '2024-11-02T11:20:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-004'); const p = prod('prd-life')
    return {
      id: 'pol-015', policyNumber: 'POL-2024-0015', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2024-10-01', expiryDate: '2025-09-30', premium: 62000, sumInsured: 15000000,
      currency: 'NGN', status: 'pending', agent: 'Chidi Nwosu', branch: 'Port Harcourt',
      createdAt: '2024-10-01T09:00:00.000Z', updatedAt: '2024-11-10T08:00:00.000Z',
    }
  })(),
  (() => {
    const c = cust('cus-006'); const p = prod('prd-health')
    return {
      id: 'pol-016', policyNumber: 'POL-2023-0099', customerId: c.id, productId: p.id,
      customerName: c.name, productName: p.name, policyType: p.type,
      effectiveDate: '2023-04-01', expiryDate: '2024-03-31', premium: 52000, sumInsured: 3000000,
      currency: 'NGN', status: 'expired', agent: 'Amaka Okeke', branch: 'Ibadan',
      createdAt: '2023-04-01T08:00:00.000Z', updatedAt: '2024-04-01T07:00:00.000Z',
    }
  })(),
]
