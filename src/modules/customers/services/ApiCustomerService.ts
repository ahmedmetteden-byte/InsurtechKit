/**
 * ApiCustomerService — mirrors CustomerService; cache-backed.
 */
import type { CreateCustomerInput, Customer, UpdateCustomerInput } from '../types/Customer'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api } from '../../../data/http'

class ApiCustomerServiceImpl {
  private cache: Customer[] = []

  async load(): Promise<void> {
    this.cache = await api.get<Customer[]>('/customers')
    emitMemoryDataChange()
  }

  getAll(): Customer[] {
    return this.cache.map(c => ({ ...c }))
  }

  getById(id: string): Customer | undefined {
    const found = this.cache.find(c => c.id === id)
    return found ? { ...found } : undefined
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const created = await api.post<Customer>('/customers', input)
    this.cache = [...this.cache, created]
    emitMemoryDataChange()
    return { ...created }
  }

  async update(input: UpdateCustomerInput): Promise<Customer | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<Customer>(`/customers/${id}`, patch)
    this.cache = this.cache.map(c => (c.id === id ? updated : c))
    emitMemoryDataChange()
    return { ...updated }
  }

  async delete(id: string): Promise<boolean> {
    await api.delete(`/customers/${id}`)
    const before = this.cache.length
    this.cache = this.cache.filter(c => c.id !== id)
    const changed = this.cache.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  async reset(): Promise<void> {
    await this.load()
  }
}

export const ApiCustomerService = new ApiCustomerServiceImpl()
