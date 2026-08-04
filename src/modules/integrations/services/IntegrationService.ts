import { defaultIntegrations } from '../config/defaultIntegrations'
import type {
  CreateIntegrationInput,
  Integration,
  UpdateIntegrationInput,
} from '../types/Integration'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'

/**
 * In-memory Integration service.
 * Framework only — no real external HTTP calls.
 * Swap later for FastAPI adapters without changing callers.
 */
class IntegrationServiceImpl {
  private integrations: Integration[] = defaultIntegrations.map(i => ({ ...i }))

  getAll(): Integration[] {
    return this.integrations.map(i => ({ ...i }))
  }

  getById(id: string): Integration | undefined {
    const found = this.integrations.find(i => i.id === id)
    return found ? { ...found } : undefined
  }

  create(input: CreateIntegrationInput): Integration {
    const now = new Date().toISOString()
    const row: Integration = {
      ...input,
      id: `int-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.integrations = [...this.integrations, row]
    emitMemoryDataChange()
    return { ...row }
  }

  update(input: UpdateIntegrationInput): Integration | undefined {
    const index = this.integrations.findIndex(i => i.id === input.id)
    if (index === -1) return undefined

    const current = this.integrations[index]
    const updated: Integration = {
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    this.integrations = [
      ...this.integrations.slice(0, index),
      updated,
      ...this.integrations.slice(index + 1),
    ]
    emitMemoryDataChange()
    return { ...updated }
  }

  delete(id: string): boolean {
    const before = this.integrations.length
    this.integrations = this.integrations.filter(i => i.id !== id)
    const changed = this.integrations.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  /**
   * Simulated connection test — no network I/O.
   * Marks the integration connected and stamps lastHealthCheck on success.
   */
  testConnection(id: string): { ok: boolean; message: string; integration?: Integration } {
    const current = this.getById(id)
    if (!current) {
      return { ok: false, message: 'Integration not found.' }
    }
    if (!current.enabled || current.status === 'disabled') {
      return { ok: false, message: 'Enable the integration before testing the connection.' }
    }

    const now = new Date().toISOString()
    const updated = this.update({
      id,
      status: 'connected',
      lastHealthCheck: now,
      notes: current.notes,
    })

    return {
      ok: true,
      message: 'Connection successful (simulated). Coming in Backend Phase for live checks.',
      integration: updated,
    }
  }

  /** Restore seed integrations (useful for demos / tests). */
  reset(): void {
    this.integrations = defaultIntegrations.map(i => ({ ...i }))
    emitMemoryDataChange()
  }
}

export const IntegrationService = new IntegrationServiceImpl()
