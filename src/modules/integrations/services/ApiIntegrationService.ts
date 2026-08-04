/**
 * ApiIntegrationService — mirrors IntegrationService; cache-backed.
 */
import type {
  CreateIntegrationInput,
  Integration,
  UpdateIntegrationInput,
} from '../types/Integration'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api } from '../../../data/http'

class ApiIntegrationServiceImpl {
  private cache: Integration[] = []

  async load(): Promise<void> {
    this.cache = await api.get<Integration[]>('/integrations')
    emitMemoryDataChange()
  }

  getAll(): Integration[] {
    return this.cache.map(i => ({ ...i }))
  }

  getById(id: string): Integration | undefined {
    const found = this.cache.find(i => i.id === id)
    return found ? { ...found } : undefined
  }

  async create(input: CreateIntegrationInput): Promise<Integration> {
    const created = await api.post<Integration>('/integrations', input)
    this.cache = [...this.cache, created]
    emitMemoryDataChange()
    return { ...created }
  }

  async update(input: UpdateIntegrationInput): Promise<Integration | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<Integration>(`/integrations/${id}`, patch)
    this.cache = this.cache.map(i => (i.id === id ? updated : i))
    emitMemoryDataChange()
    return { ...updated }
  }

  async delete(id: string): Promise<boolean> {
    await api.delete(`/integrations/${id}`)
    const before = this.cache.length
    this.cache = this.cache.filter(i => i.id !== id)
    const changed = this.cache.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  async testConnection(id: string): Promise<{ ok: boolean; message: string; integration?: Integration }> {
    const result = await api.post<{ ok: boolean; message: string; integration?: Integration }>(
      `/integrations/${id}/test-connection`,
    )
    if (result.integration) {
      this.cache = this.cache.map(i => (i.id === id ? result.integration! : i))
      emitMemoryDataChange()
    }
    return result
  }

  async reset(): Promise<void> {
    await this.load()
  }
}

export const ApiIntegrationService = new ApiIntegrationServiceImpl()
