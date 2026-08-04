/**
 * Integration domain model — framework for future partner / gateway adapters.
 * Credentials are in-memory placeholders only; no real external calls.
 */

export const INTEGRATION_TYPES = [
  'Insurance Partner',
  'Payment Gateway',
  'Email Provider',
  'SMS Provider',
  'Identity Provider',
  'Regulatory API',
  'Webhook',
  'Storage',
  'Analytics',
] as const

export type IntegrationType = (typeof INTEGRATION_TYPES)[number]

export const INTEGRATION_STATUSES = [
  'configured',
  'connected',
  'pending',
  'disabled',
] as const

export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number]

export interface Integration {
  id: string
  name: string
  type: IntegrationType
  provider: string
  status: IntegrationStatus
  baseUrl: string
  apiKey: string
  apiSecret: string
  username: string
  password: string
  webhookUrl: string
  timeout: number
  enabled: boolean
  lastHealthCheck: string
  notes: string
  createdAt: string
  updatedAt: string
}

/** Payload for creating an integration (id and timestamps assigned by the service). */
export type CreateIntegrationInput = Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>

/** Partial update payload; `id` required. */
export type UpdateIntegrationInput = Partial<CreateIntegrationInput> & { id: string }

export function integrationStatusLabel(status: IntegrationStatus): string {
  const map: Record<IntegrationStatus, string> = {
    configured: 'Configured',
    connected: 'Connected',
    pending: 'Pending',
    disabled: 'Disabled',
  }
  return map[status] ?? status
}
