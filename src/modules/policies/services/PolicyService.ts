import { defaultPolicies } from '../config/defaultPolicies'
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from '../types/Policy'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { defaultBranding } from '../../../config/branding'
import { saveBlob } from '../../../data/http'
import { buildPolicyCertificatePdf } from '../../../utils/pdf'

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
    emitMemoryDataChange()
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
    emitMemoryDataChange()
    return { ...updated }
  }

  downloadCertificate(id: string): void {
    const policy = this.getById(id)
    if (!policy) return
    const blob = buildPolicyCertificatePdf({
      companyName: defaultBranding.companyName,
      licenceNo: defaultBranding.licenceNo,
      policyNumber: policy.policyNumber,
      customerName: policy.customerName,
      productName: policy.productName,
      policyType: policy.policyType,
      sumInsured: policy.sumInsured,
      premium: policy.premium,
      currency: policy.currency,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
      status: policy.status,
    })
    saveBlob(blob, `certificate-${policy.policyNumber}.pdf`)
  }

  delete(id: string): boolean {
    const before = this.policies.length
    this.policies = this.policies.filter(p => p.id !== id)
    const changed = this.policies.length < before
    if (changed) emitMemoryDataChange()
    return changed
  }

  /** Restore seed policies (useful for demos / tests). */
  reset(): void {
    this.policies = defaultPolicies.map(p => ({ ...p }))
    emitMemoryDataChange()
  }
}

export const PolicyService = new PolicyServiceImpl()
