/**
 * ApiClaimService — mirrors ClaimService; cache-backed.
 */
import type { CreateClaimInput, Claim, UpdateClaimInput } from '../types/Claim'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api } from '../../../data/http'

class ApiClaimServiceImpl {
  private cache: Claim[] = []

  async load(): Promise<void> {
    this.cache = await api.get<Claim[]>('/claims')
    emitMemoryDataChange()
  }

  getAll(): Claim[] {
    return this.cache.map(c => ({ ...c }))
  }

  getById(id: string): Claim | undefined {
    const found = this.cache.find(c => c.id === id)
    return found ? { ...found } : undefined
  }

  async create(input: CreateClaimInput): Promise<Claim> {
    const created = await api.post<Claim>('/claims', input)
    this.cache = [...this.cache, created]
    emitMemoryDataChange()
    return { ...created }
  }

  async update(input: UpdateClaimInput): Promise<Claim | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<Claim>(`/claims/${id}`, patch)
    this.cache = this.cache.map(c => (c.id === id ? updated : c))
    emitMemoryDataChange()
    return { ...updated }
  }

  async delete(id: string): Promise<boolean> {
    await api.delete(`/claims/${id}`)
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

export const ApiClaimService = new ApiClaimServiceImpl()
