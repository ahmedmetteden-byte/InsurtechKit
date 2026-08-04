/**
 * API authentication service — login / logout / refresh / me / passwords.
 */
import { api, ApiError } from '../data/http'
import {
  clearSession,
  getRefreshToken,
  saveSession,
  type StoredSession,
} from './tokenStorage'

export type AuthUser = {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  roleId: string
  roleName: string
  branch: string
  status: string
  lastLogin: string
  createdAt: string
  updatedAt: string
}

export type LoginResult = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
  permissions: string[]
}

export type CurrentUserResult = {
  user: AuthUser
  permissions: string[]
  roleId: string
  roleName: string
}

function persistTokens(accessToken: string, refreshToken: string, expiresIn: number): StoredSession {
  const session: StoredSession = {
    accessToken,
    refreshToken,
    accessExpiresAt: Date.now() + expiresIn * 1000,
  }
  saveSession(session)
  return session
}

export const ApiAuthService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const data = await api.post<LoginResult>('/auth/login', { email, password })
    persistTokens(data.accessToken, data.refreshToken, data.expiresIn)
    return data
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {
      // Always clear local session even if the API call fails
    } finally {
      clearSession()
    }
  },

  async refresh(): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new ApiError(401, 'No refresh token')
    const data = await api.post<{
      accessToken: string
      refreshToken: string
      tokenType: string
      expiresIn: number
    }>('/auth/refresh', { refreshToken })
    persistTokens(data.accessToken, data.refreshToken, data.expiresIn)
    return data
  },

  async me(): Promise<CurrentUserResult> {
    return api.get<CurrentUserResult>('/auth/me')
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword })
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return res.message
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword })
  },
}
