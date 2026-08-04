import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { isApiMode } from '../data/config'
import { hydrateApiData } from '../data/services'
import { onUnauthorized } from '../data/http'
import { ApiAuthService, type AuthUser } from './ApiAuthService'
import {
  clearSession,
  isAccessExpired,
  loadSession,
} from './tokenStorage'

/** Demo identity used in memory mode (matches Admin header historically). */
const MEMORY_USER: AuthUser = {
  id: 'usr-001',
  employeeId: 'EMP-1001',
  firstName: 'Kunle',
  lastName: 'Adesanya',
  email: 'kunle.adesanya@insureng.com.ng',
  phone: '+234 803 100 1001',
  department: 'Claims',
  roleId: 'role-claims',
  roleName: 'Claims Officer',
  branch: 'Lagos Island',
  status: 'active',
  lastLogin: new Date().toISOString(),
  createdAt: '2024-01-10T09:00:00.000Z',
  updatedAt: new Date().toISOString(),
}

type AuthContextValue = {
  user: AuthUser | null
  permissions: string[]
  isAuthenticated: boolean
  isReady: boolean
  isApiAuth: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (code: string) => boolean
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => (isApiMode ? null : MEMORY_USER))
  const [permissions, setPermissions] = useState<string[]>(() =>
    isApiMode ? [] : ['*'],
  )
  const [isReady, setIsReady] = useState(!isApiMode)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
      refreshTimer.current = null
    }
  }, [])

  const scheduleRefresh = useCallback((expiresAt: number) => {
    clearRefreshTimer()
    if (!isApiMode) return
    const delay = Math.max(5_000, expiresAt - Date.now() - 30_000)
    refreshTimer.current = setTimeout(() => {
      void (async () => {
        try {
          const tokens = await ApiAuthService.refresh()
          scheduleRefresh(Date.now() + tokens.expiresIn * 1000)
        } catch {
          clearSession()
          setUser(null)
          setPermissions([])
        }
      })()
    }, delay)
  }, [clearRefreshTimer])

  const applySession = useCallback(
    async (nextUser: AuthUser, nextPermissions: string[]) => {
      setUser(nextUser)
      setPermissions(nextPermissions)
      try {
        await hydrateApiData()
      } catch (err) {
        console.error('[InsurtechKit] Failed to hydrate API data after login', err)
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    clearRefreshTimer()
    if (isApiMode) {
      await ApiAuthService.logout()
    } else {
      clearSession()
    }
    setUser(isApiMode ? null : MEMORY_USER)
    setPermissions(isApiMode ? [] : ['*'])
  }, [clearRefreshTimer])

  const refreshSession = useCallback(async () => {
    if (!isApiMode) return true
    try {
      const tokens = await ApiAuthService.refresh()
      const me = await ApiAuthService.me()
      await applySession(me.user, me.permissions)
      scheduleRefresh(Date.now() + tokens.expiresIn * 1000)
      return true
    } catch {
      await logout()
      return false
    }
  }, [applySession, logout, scheduleRefresh])

  const login = useCallback(
    async (email: string, password: string) => {
      if (!isApiMode) {
        setUser(MEMORY_USER)
        setPermissions(['*'])
        return
      }
      const result = await ApiAuthService.login(email, password)
      await applySession(result.user, result.permissions)
      scheduleRefresh(Date.now() + result.expiresIn * 1000)
    },
    [applySession, scheduleRefresh],
  )

  // Restore existing API session on mount
  useEffect(() => {
    if (!isApiMode) {
      setIsReady(true)
      return
    }

    let cancelled = false
    ;(async () => {
      const session = loadSession()
      if (!session) {
        if (!cancelled) setIsReady(true)
        return
      }
      try {
        if (isAccessExpired()) {
          await ApiAuthService.refresh()
        }
        const me = await ApiAuthService.me()
        if (cancelled) return
        await applySession(me.user, me.permissions)
        const latest = loadSession()
        if (latest) scheduleRefresh(latest.accessExpiresAt)
      } catch {
        clearSession()
        if (!cancelled) {
          setUser(null)
          setPermissions([])
        }
      } finally {
        if (!cancelled) setIsReady(true)
      }
    })()

    return () => {
      cancelled = true
      clearRefreshTimer()
    }
  }, [applySession, clearRefreshTimer, scheduleRefresh])

  // Auto-logout when http layer receives 401
  useEffect(() => {
    return onUnauthorized(() => {
      clearRefreshTimer()
      clearSession()
      setUser(null)
      setPermissions([])
    })
  }, [clearRefreshTimer])

  const hasPermission = useCallback(
    (code: string) => {
      if (!isApiMode) return true
      if (permissions.includes('*')) return true
      return permissions.includes(code)
    },
    [permissions],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      isAuthenticated: Boolean(user),
      isReady,
      isApiAuth: isApiMode,
      login,
      logout,
      hasPermission,
      refreshSession,
    }),
    [user, permissions, isReady, login, logout, hasPermission, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
