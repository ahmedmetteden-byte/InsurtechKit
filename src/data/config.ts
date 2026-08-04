/**
 * Data provider switch.
 * memory — existing in-memory services (default)
 * api — FastAPI-backed Api*Service classes
 *
 * Vite exposes only VITE_* vars; DATA_PROVIDER is mirrored as VITE_DATA_PROVIDER.
 */
export type DataProvider = 'memory' | 'api'

const raw = (import.meta.env.VITE_DATA_PROVIDER ?? import.meta.env.DATA_PROVIDER ?? 'memory')
  .toString()
  .trim()
  .toLowerCase()

export const DATA_PROVIDER: DataProvider = raw === 'api' ? 'api' : 'memory'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
).toString().replace(/\/$/, '')

export const isApiMode = DATA_PROVIDER === 'api'
export const isMemoryMode = DATA_PROVIDER === 'memory'
