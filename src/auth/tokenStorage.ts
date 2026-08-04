/**
 * Token storage for API-mode sessions.
 * Keys are namespaced so memory mode never collides.
 */
const ACCESS_KEY = 'insurtechkit.accessToken'
const REFRESH_KEY = 'insurtechkit.refreshToken'
const EXPIRES_KEY = 'insurtechkit.accessExpiresAt'

export type StoredSession = {
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
}

export function loadSession(): StoredSession | null {
  const accessToken = localStorage.getItem(ACCESS_KEY)
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  const expiresRaw = localStorage.getItem(EXPIRES_KEY)
  if (!accessToken || !refreshToken) return null
  const accessExpiresAt = expiresRaw ? Number(expiresRaw) : 0
  return { accessToken, refreshToken, accessExpiresAt }
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(ACCESS_KEY, session.accessToken)
  localStorage.setItem(REFRESH_KEY, session.refreshToken)
  localStorage.setItem(EXPIRES_KEY, String(session.accessExpiresAt))
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function isAccessExpired(skewMs = 15_000): boolean {
  const expiresRaw = localStorage.getItem(EXPIRES_KEY)
  if (!expiresRaw) return true
  return Date.now() >= Number(expiresRaw) - skewMs
}
