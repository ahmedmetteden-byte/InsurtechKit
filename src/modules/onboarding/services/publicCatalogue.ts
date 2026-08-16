/**
 * Public product catalogue for the unauthenticated onboarding form.
 * Memory mode reads the local product store directly (no auth wall there).
 * API mode calls the public, unauthenticated /public/products endpoint —
 * the staff ProductService is permission-gated and cannot be used here.
 */
import { isApiMode } from '../../../data/config'
import { api } from '../../../data/http'
import { ProductService as MemoryProductService } from '../../products/services/ProductService'

export interface PublicProduct {
  id: string
  name: string
  category: string
}

export async function getPublicActiveProducts(): Promise<PublicProduct[]> {
  if (isApiMode) {
    return api.get<PublicProduct[]>('/public/products')
  }
  return MemoryProductService.getAll()
    .filter(p => p.active)
    .map(p => ({ id: p.id, name: p.name, category: p.category }))
}
