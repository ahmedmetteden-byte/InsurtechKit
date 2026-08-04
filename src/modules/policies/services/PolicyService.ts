import { defaultPolicies } from '../config/defaultPolicies'
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from '../types/Policy'

/**
 * In-memory Policy service.
 * Swap the store implementation later for FastAPI HTTP calls without changing callers.
 */
class PolicyServiceImpl {
  private policies: Policy[] = defaultPolicies.map(p => ({ ...p }))

  getAll(): Policy[] {
    return this.policies.map(p => ({ ...p }))
  }

  getById(id: string): Policy | undefined {
    const found = this.policies.find(p => p.id === id)
    return found ? { ...found } : undefined
  }

  create(input: CreatePolicyInput): Policy {
    const now = new Date().toISOString()
    const policy: Policy = {
      ...input,
      id: `pol-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.policies = [...this.policies, policy]
    return { ...policy }
  }

  update(input: UpdatePolicyInput): Policy | undefined {
    const index = this.policies.findIndex(p => p.id === input.id)
    if (index === -1) return undefined

    const current = this.policies[index]
    const updated: Policy = {
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    this.policies = [
      ...this.policies.slice(0, index),
      updated,
      ...this.policies.slice(index + 1),
    ]
    return { ...updated }
  }

  delete(id: string): boolean {
    const before = this.policies.length
    this.policies = this.policies.filter(p => p.id !== id)
    return this.policies.length < before
  }

  /** Restore seed policies (useful for demos / tests). */
  reset(): void {
    this.policies = defaultPolicies.map(p => ({ ...p }))
  }
}

export const PolicyService = new PolicyServiceImpl()
