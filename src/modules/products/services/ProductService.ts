import { defaultProducts } from '../config/defaultProducts'
import type { CreateProductInput, Product, UpdateProductInput } from '../types/Product'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'

/**
 * In-memory Product service.
 * Swap the store implementation later for FastAPI HTTP calls without changing callers.
 */
class ProductServiceImpl {
  private products: Product[] = defaultProducts.map(p => ({ ...p }))

  getAll(): Product[] {
    return this.products.map(p => ({ ...p }))
  }

  getById(id: string): Product | undefined {
    const found = this.products.find(p => p.id === id)
    return found ? { ...found } : undefined
  }

  create(input: CreateProductInput): Product {
    const now = new Date().toISOString()
    const product: Product = {
      ...input,
      id: `prd-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.products = [...this.products, product]
    emitMemoryDataChange()
    return { ...product }
  }

  update(input: UpdateProductInput): Product | undefined {
    const index = this.products.findIndex(p => p.id === input.id)
    if (index === -1) return undefined

    const current = this.products[index]
    const updated: Product = {
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    this.products = [
      ...this.products.slice(0, index),
      updated,
      ...this.products.slice(index + 1),
    ]
    emitMemoryDataChange()
    return { ...updated }
  }

  delete(id: string): boolean {
    const before = this.products.length
    this.products = this.products.filter(p => p.id !== id)
    const changed = this.products.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  /** Restore seed catalogue (useful for demos / tests). */
  reset(): void {
    this.products = defaultProducts.map(p => ({ ...p }))
    emitMemoryDataChange()
  }
}

export const ProductService = new ProductServiceImpl()
