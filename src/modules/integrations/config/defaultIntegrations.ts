import type { Integration } from '../types/Integration'

function daysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/**
 * Seed integrations for the framework (in-memory only).
 * Covers required default providers across partner / payment / messaging / identity / regulatory.
 */
export const defaultIntegrations: Integration[] = [
  {
    id: 'int-001', name: 'Partner A Connector', type: 'Insurance Partner', provider: 'Partner A',
    status: 'connected', baseUrl: 'https://api.partner-a.example/v1',
    apiKey: 'pk_demo_partner_a', apiSecret: 'sk_demo_partner_a', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/partners/a', timeout: 30000, enabled: true,
    lastHealthCheck: daysAgo(0, 8, 15), notes: 'Primary motor capacity partner.',
    createdAt: '2024-02-01T09:00:00.000Z', updatedAt: daysAgo(0, 8, 15),
  },
  {
    id: 'int-002', name: 'Partner B Connector', type: 'Insurance Partner', provider: 'Partner B',
    status: 'configured', baseUrl: 'https://api.partner-b.example/v2',
    apiKey: 'pk_demo_partner_b', apiSecret: 'sk_demo_partner_b', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/partners/b', timeout: 30000, enabled: true,
    lastHealthCheck: daysAgo(2, 11, 0), notes: 'Health & life capacity.',
    createdAt: '2024-02-10T10:00:00.000Z', updatedAt: daysAgo(2, 11, 0),
  },
  {
    id: 'int-003', name: 'Partner C Connector', type: 'Insurance Partner', provider: 'Partner C',
    status: 'pending', baseUrl: 'https://api.partner-c.example/v1',
    apiKey: '', apiSecret: '', username: 'partnerc', password: '••••••••',
    webhookUrl: '', timeout: 45000, enabled: true,
    lastHealthCheck: '', notes: 'Awaiting sandbox credentials.',
    createdAt: '2024-03-01T08:00:00.000Z', updatedAt: daysAgo(5, 9, 0),
  },
  {
    id: 'int-004', name: 'Paystack Payments', type: 'Payment Gateway', provider: 'Paystack',
    status: 'connected', baseUrl: 'https://api.paystack.co',
    apiKey: 'pk_test_demo', apiSecret: 'sk_test_demo', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/paystack', timeout: 20000, enabled: true,
    lastHealthCheck: daysAgo(0, 7, 40), notes: 'Default card & transfer gateway.',
    createdAt: '2024-01-15T09:00:00.000Z', updatedAt: daysAgo(0, 7, 40),
  },
  {
    id: 'int-005', name: 'Flutterwave Payments', type: 'Payment Gateway', provider: 'Flutterwave',
    status: 'configured', baseUrl: 'https://api.flutterwave.com/v3',
    apiKey: 'FLWPUBK_TEST', apiSecret: 'FLWSECK_TEST', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/flutterwave', timeout: 20000, enabled: true,
    lastHealthCheck: daysAgo(1, 14, 20), notes: 'Secondary payment rail.',
    createdAt: '2024-01-20T10:00:00.000Z', updatedAt: daysAgo(1, 14, 20),
  },
  {
    id: 'int-006', name: 'Monnify Payments', type: 'Payment Gateway', provider: 'Monnify',
    status: 'disabled', baseUrl: 'https://api.monnify.com/api/v1',
    apiKey: 'MK_TEST_demo', apiSecret: 'demo_secret', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/monnify', timeout: 25000, enabled: false,
    lastHealthCheck: daysAgo(30, 10, 0), notes: 'Reserved for virtual accounts.',
    createdAt: '2024-02-05T11:00:00.000Z', updatedAt: daysAgo(30, 10, 0),
  },
  {
    id: 'int-007', name: 'SMTP Mail', type: 'Email Provider', provider: 'SMTP',
    status: 'connected', baseUrl: 'smtp://mail.insureng.example:587',
    apiKey: '', apiSecret: '', username: 'noreply@insureng.com.ng', password: '••••••••',
    webhookUrl: '', timeout: 15000, enabled: true,
    lastHealthCheck: daysAgo(0, 6, 0), notes: 'Transactional mail relay.',
    createdAt: '2024-01-05T08:00:00.000Z', updatedAt: daysAgo(0, 6, 0),
  },
  {
    id: 'int-008', name: 'SendGrid Mail', type: 'Email Provider', provider: 'SendGrid',
    status: 'configured', baseUrl: 'https://api.sendgrid.com/v3',
    apiKey: 'SG.demo_key', apiSecret: '', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/sendgrid', timeout: 15000, enabled: true,
    lastHealthCheck: daysAgo(3, 12, 0), notes: 'Marketing & bulk email.',
    createdAt: '2024-01-08T09:00:00.000Z', updatedAt: daysAgo(3, 12, 0),
  },
  {
    id: 'int-009', name: 'Amazon SES', type: 'Email Provider', provider: 'SES',
    status: 'pending', baseUrl: 'https://email.eu-west-1.amazonaws.com',
    apiKey: '', apiSecret: '', username: '', password: '',
    webhookUrl: '', timeout: 20000, enabled: true,
    lastHealthCheck: '', notes: 'Region setup pending.',
    createdAt: '2024-03-12T10:00:00.000Z', updatedAt: daysAgo(7, 9, 30),
  },
  {
    id: 'int-010', name: 'Termii SMS', type: 'SMS Provider', provider: 'Termii',
    status: 'connected', baseUrl: 'https://api.ng.termii.com/api',
    apiKey: 'termii_demo', apiSecret: '', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/termii', timeout: 15000, enabled: true,
    lastHealthCheck: daysAgo(0, 9, 5), notes: 'Primary Nigeria SMS.',
    createdAt: '2024-01-12T08:30:00.000Z', updatedAt: daysAgo(0, 9, 5),
  },
  {
    id: 'int-011', name: 'Twilio SMS', type: 'SMS Provider', provider: 'Twilio',
    status: 'disabled', baseUrl: 'https://api.twilio.com/2010-04-01',
    apiKey: 'ACdemo', apiSecret: 'demo_token', username: '', password: '',
    webhookUrl: '', timeout: 15000, enabled: false,
    lastHealthCheck: daysAgo(45, 11, 0), notes: 'International fallback — disabled.',
    createdAt: '2024-01-18T10:00:00.000Z', updatedAt: daysAgo(45, 11, 0),
  },
  {
    id: 'int-012', name: 'NIN Verification', type: 'Identity Provider', provider: 'NIN',
    status: 'configured', baseUrl: 'https://api.identity.example/nin',
    apiKey: 'nin_demo_key', apiSecret: 'nin_demo_secret', username: '', password: '',
    webhookUrl: '', timeout: 30000, enabled: true,
    lastHealthCheck: daysAgo(1, 10, 0), notes: 'KYC — National Identity Number.',
    createdAt: '2024-02-20T09:00:00.000Z', updatedAt: daysAgo(1, 10, 0),
  },
  {
    id: 'int-013', name: 'BVN Verification', type: 'Identity Provider', provider: 'BVN',
    status: 'connected', baseUrl: 'https://api.identity.example/bvn',
    apiKey: 'bvn_demo_key', apiSecret: 'bvn_demo_secret', username: '', password: '',
    webhookUrl: '', timeout: 30000, enabled: true,
    lastHealthCheck: daysAgo(0, 10, 30), notes: 'KYC — Bank Verification Number.',
    createdAt: '2024-02-20T09:30:00.000Z', updatedAt: daysAgo(0, 10, 30),
  },
  {
    id: 'int-014', name: 'NAICOM Regulatory', type: 'Regulatory API', provider: 'NAICOM',
    status: 'pending', baseUrl: 'https://api.naicom.example/v1',
    apiKey: '', apiSecret: '', username: '', password: '',
    webhookUrl: 'https://hooks.insureng.example/naicom', timeout: 60000, enabled: true,
    lastHealthCheck: '', notes: 'Regulatory reporting endpoint — credentials TBD.',
    createdAt: '2024-03-01T08:00:00.000Z', updatedAt: daysAgo(4, 15, 0),
  },
]
