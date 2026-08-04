import { defaultPolicies } from '../../policies/config/defaultPolicies'
import type { Claim } from '../types/Claim'

function pol(id: string) {
  const p = defaultPolicies.find(x => x.id === id)
  if (!p) throw new Error(`Seed policy missing: ${id}`)
  return p
}

/**
 * Seed claims for the Claims module (in-memory only).
 * Every row references a valid policy (and its customer / product fields).
 */
export const defaultClaims: Claim[] = [
  (() => {
    const p = pol('pol-001')
    return {
      id: 'clm-001', claimNumber: 'CLM-2024-0001', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-10-12', reportedDate: '2024-10-13', claimAmount: 1850000, approvedAmount: 0,
      currency: 'NGN', description: 'Front-end collision on Third Mainland Bridge — bumper, grille, and headlamp damage.',
      status: 'under_review', assignedTo: 'Emeka N.', notes: 'Awaiting repair estimate from approved workshop.',
      createdAt: '2024-10-13T09:00:00.000Z', updatedAt: '2024-11-02T11:00:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-002')
    return {
      id: 'clm-002', claimNumber: 'CLM-2024-0002', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-09-20', reportedDate: '2024-09-21', claimAmount: 420000, approvedAmount: 420000,
      currency: 'NGN', description: 'Emergency outpatient treatment at National Hospital Abuja.',
      status: 'paid', assignedTo: 'Ngozi A.', notes: 'Settled via bank transfer.',
      createdAt: '2024-09-21T10:30:00.000Z', updatedAt: '2024-10-05T14:00:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-003')
    return {
      id: 'clm-003', claimNumber: 'CLM-2024-0003', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-11-01', reportedDate: '2024-11-02', claimAmount: 3200000, approvedAmount: 0,
      currency: 'NGN', description: 'Fleet vehicle theft reported at Apapa yard — police extract attached.',
      status: 'open', assignedTo: 'Kunle Adesanya', notes: 'Investigation opened with Apapa Division.',
      createdAt: '2024-11-02T08:15:00.000Z', updatedAt: '2024-11-02T08:15:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-004')
    return {
      id: 'clm-004', claimNumber: 'CLM-2024-0004', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-08-14', reportedDate: '2024-08-15', claimAmount: 280000, approvedAmount: 0,
      currency: 'NGN', description: 'Third-party property damage claim — disputed liability.',
      status: 'rejected', assignedTo: 'Chidera O.', notes: 'Policy is TP-only; own-damage portion declined.',
      createdAt: '2024-08-15T12:00:00.000Z', updatedAt: '2024-09-01T09:00:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-005')
    return {
      id: 'clm-005', claimNumber: 'CLM-2024-0005', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-07-08', reportedDate: '2024-07-09', claimAmount: 8900000, approvedAmount: 7500000,
      currency: 'NGN', description: 'Warehouse fire at Zaria Road plant — partial stock loss.',
      status: 'approved', assignedTo: 'Hauwa Ibrahim', notes: 'Approved subject to salvage deduction.',
      createdAt: '2024-07-09T11:00:00.000Z', updatedAt: '2024-10-20T16:00:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-007')
    return {
      id: 'clm-006', claimNumber: 'CLM-2024-0006', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-06-02', reportedDate: '2024-06-03', claimAmount: 185000, approvedAmount: 185000,
      currency: 'NGN', description: 'Lost baggage claim — London Heathrow inbound.',
      status: 'paid', assignedTo: 'Amaka Okeke', notes: '',
      createdAt: '2024-06-03T09:45:00.000Z', updatedAt: '2024-06-18T10:00:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-009')
    return {
      id: 'clm-007', claimNumber: 'CLM-2024-0007', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-04-22', reportedDate: '2024-04-23', claimAmount: 640000, approvedAmount: 0,
      currency: 'NGN', description: 'Vehicle theft — Enugu Independence Layout.',
      status: 'under_review', assignedTo: 'Chidi Nwosu', notes: 'Waiting for police report finalisation.',
      createdAt: '2024-04-23T14:20:00.000Z', updatedAt: '2024-08-01T07:00:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-010')
    return {
      id: 'clm-008', claimNumber: 'CLM-2024-0008', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-10-28', reportedDate: '2024-10-29', claimAmount: 12500000, approvedAmount: 0,
      currency: 'NGN', description: 'Marine cargo wet damage — Warri jetty discharge.',
      status: 'open', assignedTo: 'Tolu Adeyemi', notes: 'Surveyor appointed.',
      createdAt: '2024-10-29T08:00:00.000Z', updatedAt: '2024-11-05T15:40:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-011')
    return {
      id: 'clm-009', claimNumber: 'CLM-2024-0009', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-09-01', reportedDate: '2024-09-05', claimAmount: 10000000, approvedAmount: 10000000,
      currency: 'NGN', description: 'Death benefit claim — nominated beneficiary documentation complete.',
      status: 'paid', assignedTo: 'Hauwa Ibrahim', notes: 'Paid to designated beneficiary.',
      createdAt: '2024-09-05T10:00:00.000Z', updatedAt: '2024-10-08T12:15:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-012')
    return {
      id: 'clm-010', claimNumber: 'CLM-2024-0010', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-08-30', reportedDate: '2024-08-31', claimAmount: 95000, approvedAmount: 0,
      currency: 'NGN', description: 'Minor third-party scrape — Ikeja.',
      status: 'rejected', assignedTo: 'Amaka Okeke', notes: 'Policy suspended at time of incident.',
      createdAt: '2024-08-31T11:00:00.000Z', updatedAt: '2024-09-15T09:00:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-013')
    return {
      id: 'clm-011', claimNumber: 'CLM-2024-0011', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-11-10', reportedDate: '2024-11-11', claimAmount: 2100000, approvedAmount: 0,
      currency: 'NGN', description: 'Shop flood damage — Wuse Market stall cluster.',
      status: 'under_review', assignedTo: 'Amaka Okeke', notes: 'Photos and inventory list received.',
      createdAt: '2024-11-11T09:30:00.000Z', updatedAt: '2024-11-14T16:20:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-014')
    return {
      id: 'clm-012', claimNumber: 'CLM-2024-0012', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-10-05', reportedDate: '2024-10-06', claimAmount: 75000, approvedAmount: 65000,
      currency: 'NGN', description: 'Trip delay compensation — Lagos to Dubai.',
      status: 'approved', assignedTo: 'Kunle Adesanya', notes: 'Awaiting payment run.',
      createdAt: '2024-10-06T13:00:00.000Z', updatedAt: '2024-11-02T11:20:00.000Z',
    }
  })(),
  (() => {
    const p = pol('pol-015')
    return {
      id: 'clm-013', claimNumber: 'CLM-2024-0013', policyId: p.id, policyNumber: p.policyNumber,
      customerId: p.customerId, customerName: p.customerName, productName: p.productName,
      incidentDate: '2024-11-15', reportedDate: '2024-11-16', claimAmount: 2500000, approvedAmount: 0,
      currency: 'NGN', description: 'Critical illness rider notification — documentation pending.',
      status: 'open', assignedTo: 'Chidi Nwosu', notes: 'Medical reports requested.',
      createdAt: '2024-11-16T08:00:00.000Z', updatedAt: '2024-11-16T08:00:00.000Z',
    }
  })(),
]
