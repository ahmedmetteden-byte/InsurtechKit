import { defaultClaims } from '../config/defaultClaims'
import type { CreateClaimInput, Claim, UpdateClaimInput } from '../types/Claim'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'

/**
 * In-memory Claim service.
 * Swap the store implementation later for FastAPI HTTP calls without changing callers.
 */
class ClaimServiceImpl {
  private claims: Claim[] = defaultClaims.map(c => ({ ...c }))

  getAll(): Claim[] {
    return this.claims.map(c => ({ ...c }))
  }

  getById(id: string): Claim | undefined {
    const found = this.claims.find(c => c.id === id)
    return found ? { ...found } : undefined
  }

  create(input: CreateClaimInput): Claim {
    const now = new Date().toISOString()
    const claim: Claim = {
      ...input,
      id: `clm-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.claims = [...this.claims, claim]
    emitMemoryDataChange()
    return { ...claim }
  }

  update(input: UpdateClaimInput): Claim | undefined {
    const index = this.claims.findIndex(c => c.id === input.id)
    if (index === -1) return undefined

    const current = this.claims[index]
    const updated: Claim = {
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    this.claims = [
      ...this.claims.slice(0, index),
      updated,
      ...this.claims.slice(index + 1),
    ]
    emitMemoryDataChange()
    return { ...updated }
  }

  delete(id: string): boolean {
    const before = this.claims.length
    this.claims = this.claims.filter(c => c.id !== id)
    const changed = this.claims.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  /** Restore seed claims (useful for demos / tests). */
  reset(): void {
    this.claims = defaultClaims.map(c => ({ ...c }))
    emitMemoryDataChange()
  }
}

export const ClaimService = new ClaimServiceImpl()
