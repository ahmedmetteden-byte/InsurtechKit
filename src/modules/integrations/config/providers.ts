/**
 * Provider catalogue — used by forms for type → provider suggestions.
 * Customer implementations can extend without redesigning the UI.
 */
import type { IntegrationType } from '../types/Integration'

export const PROVIDERS_BY_TYPE: Record<IntegrationType, string[]> = {
  'Insurance Partner': ['Partner A', 'Partner B', 'Partner C'],
  'Payment Gateway': ['Paystack', 'Flutterwave', 'Monnify'],
  'Email Provider': ['SMTP', 'SendGrid', 'SES'],
  'SMS Provider': ['Termii', 'Twilio'],
  'Identity Provider': ['NIN', 'BVN'],
  'Regulatory API': ['NAICOM'],
  Webhook: ['Custom Webhook'],
  Storage: ['S3', 'Azure Blob', 'Local'],
  Analytics: ['Segment', 'Mixpanel', 'Custom'],
}

export function providersForType(type: IntegrationType): string[] {
  return PROVIDERS_BY_TYPE[type] ?? []
}
