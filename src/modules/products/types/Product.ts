/**
 * Product domain model — shared by UI, services, and future FastAPI adapters.
 */

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived'

export type ProductCategory =
  | 'motor'
  | 'health'
  | 'travel'
  | 'marine'
  | 'property'
  | 'life'
  | string

export interface Product {
  id: string
  name: string
  code: string
  description: string
  category: ProductCategory
  status: ProductStatus
  minimumPremium: number
  currency: string
  requiresInspection: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

/** Payload for creating a product (id and timestamps assigned by the service). */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

/** Partial update payload; `id` required. */
export type UpdateProductInput = Partial<CreateProductInput> & { id: string }
