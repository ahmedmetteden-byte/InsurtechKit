import { defaultCustomers } from '../config/defaultCustomers'
import type { CreateCustomerInput, Customer, UpdateCustomerInput } from '../types/Customer'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'

/**
 * In-memory Customer service.
 * Swap the store implementation later for FastAPI HTTP calls without changing callers.
 */
class CustomerServiceImpl {
  private customers: Customer[] = defaultCustomers.map(c => ({ ...c }))

  getAll(): Customer[] {
    return this.customers.map(c => ({ ...c }))
  }

  getById(id: string): Customer | undefined {
    const found = this.customers.find(c => c.id === id)
    return found ? { ...found } : undefined
  }

  create(input: CreateCustomerInput): Customer {
    const now = new Date().toISOString()
    const customer: Customer = {
      ...input,
      id: `cus-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.customers = [...this.customers, customer]
    emitMemoryDataChange()
    return { ...customer }
  }

  update(input: UpdateCustomerInput): Customer | undefined {
    const index = this.customers.findIndex(c => c.id === input.id)
    if (index === -1) return undefined

    const current = this.customers[index]
    const updated: Customer = {
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    this.customers = [
      ...this.customers.slice(0, index),
      updated,
      ...this.customers.slice(index + 1),
    ]
    emitMemoryDataChange()
    return { ...updated }
  }

  delete(id: string): boolean {
    const before = this.customers.length
    this.customers = this.customers.filter(c => c.id !== id)
    const changed = this.customers.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  /** Restore seed customers (useful for demos / tests). */
  reset(): void {
    this.customers = defaultCustomers.map(c => ({ ...c }))
    emitMemoryDataChange()
  }
}

export const CustomerService = new CustomerServiceImpl()
