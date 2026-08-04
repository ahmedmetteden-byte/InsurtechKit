/**
 * ApiProductService — mirrors ProductService interface; cache-backed for sync reads.
 * In-memory ProductService is left untouched.
 */
import type { CreateProductInput, Product, UpdateProductInput } from '../types/Product'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api } from '../../../data/http'

class ApiProductServiceImpl {
  private cache: Product[] = []

  async load(): Promise<void> {
    this.cache = await api.get<Product[]>('/products')
    emitMemoryDataChange()
  }

  getAll(): Product[] {
    return this.cache.map(p => ({ ...p }))
  }

  getById(id: string): Product | undefined {
    const found = this.cache.find(p => p.id === id)
    return found ? { ...found } : undefined
  }

  async create(input: CreateProductInput): Promise<Product> {
    const created = await api.post<Product>('/products', input)
    this.cache = [...this.cache, created]
    emitMemoryDataChange()
    return { ...created }
  }

  async update(input: UpdateProductInput): Promise<Product | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<Product>(`/products/${id}`, patch)
    this.cache = this.cache.map(p => (p.id === id ? updated : p))
    emitMemoryDataChange()
    return { ...updated }
  }

  async delete(id: string): Promise<boolean> {
    await api.delete(`/products/${id}`)
    const before = this.cache.length
    this.cache = this.cache.filter(p => p.id !== id)
    const changed = this.cache.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  async reset(): Promise<void> {
    await this.load()
  }
}

export const ApiProductService = new ApiProductServiceImpl()
