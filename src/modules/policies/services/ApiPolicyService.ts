/**
 * ApiPolicyService — mirrors PolicyService; cache-backed.
 */
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from '../types/Policy'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api, apiFiles, saveBlob } from '../../../data/http'

class ApiPolicyServiceImpl {
  private cache: Policy[] = []

  async load(): Promise<void> {
    this.cache = await api.get<Policy[]>('/policies')
    emitMemoryDataChange()
  }

  getAll(): Policy[] {
    return this.cache.map(p => ({ ...p }))
  }

  getById(id: string): Policy | undefined {
    const found = this.cache.find(p => p.id === id)
    return found ? { ...found } : undefined
  }

  async create(input: CreatePolicyInput): Promise<Policy> {
    const created = await api.post<Policy>('/policies', input)
    this.cache = [...this.cache, created]
    emitMemoryDataChange()
    return { ...created }
  }

  async update(input: UpdatePolicyInput): Promise<Policy | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<Policy>(`/policies/${id}`, patch)
    this.cache = this.cache.map(p => (p.id === id ? updated : p))
    emitMemoryDataChange()
    return { ...updated }
  }

  async downloadCertificate(id: string): Promise<void> {
    const policy = this.getById(id)
    const blob = await apiFiles.getBlob(`/policies/${id}/certificate`)
    saveBlob(blob, `certificate-${policy?.policyNumber ?? id}.pdf`)
  }

  async delete(id: string): Promise<boolean> {
    await api.delete(`/policies/${id}`)
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

export const ApiPolicyService = new ApiPolicyServiceImpl()
