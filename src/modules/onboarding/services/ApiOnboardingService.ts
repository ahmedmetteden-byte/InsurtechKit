/**
 * ApiOnboardingService — mirrors OnboardingService; cache-backed for the staff queue.
 * `submit` hits the unauthenticated public endpoint and never touches the cache.
 */
import type {
  OnboardingApplication,
  SubmitOnboardingApplicationInput,
  UpdateOnboardingApplicationInput,
} from '../types/OnboardingApplication'
import { emitMemoryDataChange } from '../../../admin/memoryDataEvents'
import { api } from '../../../data/http'

class ApiOnboardingServiceImpl {
  private cache: OnboardingApplication[] = []

  async load(): Promise<void> {
    this.cache = await api.get<OnboardingApplication[]>('/onboarding/applications')
    emitMemoryDataChange()
  }

  getAll(): OnboardingApplication[] {
    return this.cache.map(a => ({ ...a }))
  }

  getById(id: string): OnboardingApplication | undefined {
    const found = this.cache.find(a => a.id === id)
    return found ? { ...found } : undefined
  }

  async submit(input: SubmitOnboardingApplicationInput): Promise<OnboardingApplication> {
    return api.post<OnboardingApplication>('/public/onboarding/applications', input)
  }

  async update(input: UpdateOnboardingApplicationInput): Promise<OnboardingApplication | undefined> {
    const { id, ...patch } = input
    const updated = await api.put<OnboardingApplication>(`/onboarding/applications/${id}`, patch)
    this.cache = this.cache.map(a => (a.id === id ? updated : a))
    emitMemoryDataChange()
    return { ...updated }
  }

  async reset(): Promise<void> {
    await this.load()
  }
}

export const ApiOnboardingService = new ApiOnboardingServiceImpl()
