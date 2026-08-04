import type { Product } from '../types/Product'

/**
 * Seed catalogue for the Products module (in-memory only).
 * Values mirror common Nigerian P&C / life lines used across the kit.
 */
export const defaultProducts: Product[] = [
  {
    id: 'prd-motor-comp',
    name: 'Motor Comprehensive',
    code: 'MOT-COMP',
    description:
      'Full own-damage and third-party motor cover including theft, fire, flood, and windscreen, with optional roadside assistance.',
    category: 'motor',
    status: 'active',
    minimumPremium: 85000,
    currency: 'NGN',
    requiresInspection: true,
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-11-01T10:00:00.000Z',
  },
  {
    id: 'prd-motor-tp',
    name: 'Motor Third Party',
    code: 'MOT-TP',
    description:
      'NAICOM-compliant third-party only motor liability covering bodily injury and property damage to others.',
    category: 'motor',
    status: 'active',
    minimumPremium: 15000,
    currency: 'NGN',
    requiresInspection: false,
    active: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-10-12T09:30:00.000Z',
  },
  {
    id: 'prd-health',
    name: 'Health Insurance',
    code: 'HLT-IND',
    description:
      'Individual and family medical cover with access to approved hospitals nationwide, outpatient, and emergency benefits.',
    category: 'health',
    status: 'active',
    minimumPremium: 45000,
    currency: 'NGN',
    requiresInspection: false,
    active: true,
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-11-10T14:00:00.000Z',
  },
  {
    id: 'prd-travel',
    name: 'Travel Insurance',
    code: 'TRV-INT',
    description:
      'Single-trip and annual multi-trip travel cover for medical emergencies, baggage, and trip cancellation abroad.',
    category: 'travel',
    status: 'active',
    minimumPremium: 12000,
    currency: 'NGN',
    requiresInspection: false,
    active: true,
    createdAt: '2024-03-01T08:00:00.000Z',
    updatedAt: '2024-09-20T11:00:00.000Z',
  },
  {
    id: 'prd-marine',
    name: 'Marine Cargo',
    code: 'MRN-CRG',
    description:
      'Cargo insurance for goods in transit by sea, air, or inland waterways, including loading and temporary storage risks.',
    category: 'marine',
    status: 'active',
    minimumPremium: 250000,
    currency: 'NGN',
    requiresInspection: true,
    active: true,
    createdAt: '2024-03-15T08:00:00.000Z',
    updatedAt: '2024-10-05T16:00:00.000Z',
  },
  {
    id: 'prd-fire',
    name: 'Fire & Special Perils',
    code: 'PRP-FSP',
    description:
      'Property cover against fire, lightning, explosion, flood, storm, and related special perils for residential and commercial buildings.',
    category: 'property',
    status: 'active',
    minimumPremium: 75000,
    currency: 'NGN',
    requiresInspection: true,
    active: true,
    createdAt: '2024-04-01T08:00:00.000Z',
    updatedAt: '2024-11-15T08:30:00.000Z',
  },
  {
    id: 'prd-life',
    name: 'Life Assurance',
    code: 'LIF-TRM',
    description:
      'Term life assurance with death benefit payout to nominated beneficiaries; optional critical illness riders available.',
    category: 'life',
    status: 'active',
    minimumPremium: 30000,
    currency: 'NGN',
    requiresInspection: false,
    active: true,
    createdAt: '2024-04-15T08:00:00.000Z',
    updatedAt: '2024-11-18T12:00:00.000Z',
  },
]
