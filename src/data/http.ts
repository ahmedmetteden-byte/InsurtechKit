/**
 * Minimal fetch helper for Api* services.
 * Attaches Bearer tokens and triggers session expiry handlers on 401.
 */
import { API_BASE_URL } from './config'
import { getAccessToken } from '../auth/tokenStorage'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

/** Subscribe to 401 responses (used by AuthContext for auto-logout). */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach(fn => {
    try {
      fn()
    } catch {
      // ignore listener errors
    }
  })
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const token = getAccessToken()
  // Auth bootstrap endpoints must not send a stale Bearer header
  const isAuthBootstrap =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/forgot-password') ||
    path.startsWith('/auth/reset-password')
  if (token && !isAuthBootstrap) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401 && !isAuthBootstrap) {
      notifyUnauthorized()
    }
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error?: { message?: string } }).error?.message ?? res.statusText)
        : res.statusText || `HTTP ${res.status}`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

const DEFAULT_PAGE_SIZE = 200

/**
 * Pages through a limit/offset-paginated list endpoint and returns every
 * row. The backend caps each individual response (so one request can never
 * return an unbounded table), so callers that need the *full* list — the
 * admin pages that load once and then filter/search client-side — page
 * through it here instead of assuming one request returns everything.
 */
async function requestAllPages<T>(path: string, pageSize: number): Promise<T[]> {
  const results: T[] = []
  const separator = path.includes('?') ? '&' : '?'
  let offset = 0
  for (;;) {
    const page = await request<T[]>('GET', `${path}${separator}limit=${pageSize}&offset=${offset}`)
    results.push(...page)
    if (page.length < pageSize) break
    offset += pageSize
  }
  return results
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  getAll: <T>(path: string, pageSize = DEFAULT_PAGE_SIZE) => requestAllPages<T>(path, pageSize),
}

/** Multipart form upload (file inputs) — omit Content-Type so the browser sets the boundary. */
async function postForm<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: formData })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401) notifyUnauthorized()
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error?: { message?: string } }).error?.message ?? res.statusText)
        : res.statusText || `HTTP ${res.status}`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

/** Fetches a binary response (e.g. a document download) with the Bearer token attached. */
async function getBlob(path: string): Promise<Blob> {
  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${path}`, { headers })
  if (!res.ok) {
    if (res.status === 401) notifyUnauthorized()
    throw new ApiError(res.status, res.statusText)
  }
  return res.blob()
}

/** Triggers a browser save-as for a blob, without navigating the page. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const apiFiles = {
  postForm: <T>(path: string, formData: FormData) => postForm<T>(path, formData),
  getBlob: (path: string) => getBlob(path),
}
