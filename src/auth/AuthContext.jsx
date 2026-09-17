import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/auth.api.js'
import { getStoredToken, getStoredUser, storeSession, clearSession } from './session.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => getStoredToken())
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      const storedToken = getStoredToken()
      const storedUser = getStoredUser()
      if (!storedToken || !storedUser) {
        setInitializing(false)
        return
      }
      try {
        const freshUser = await authApi.me(storedUser)
        if (!cancelled) setUser(freshUser)
      } catch {
        if (!cancelled) {
          clearSession()
          setUser(null)
          setToken(null)
        }
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials)
    storeSession(result.token, result.user)
    setToken(result.token)
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token && user), initializing, login, logout }),
    [user, token, initializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
