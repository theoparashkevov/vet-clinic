import { useCallback, useEffect, useState } from "react"
import { useAuthStore, type User } from "../stores/authStore"
import { fetchWithAuth } from "../lib/api"

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  roles: string[]
  isSuperAdmin: boolean
  checkAuth: () => Promise<void>
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, token, isLoading, setLoading, logout: storeLogout } = useAuthStore()
  const [checked, setChecked] = useState(false)

  const checkAuth = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setChecked(true)
      return
    }

    setLoading(true)
    try {
      const me = await fetchWithAuth("/v1/auth/me")
      if (me) {
        useAuthStore.setState({
          user: me as User,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } catch {
      storeLogout()
    } finally {
      setLoading(false)
      setChecked(true)
    }
  }, [token, setLoading, storeLogout])

  useEffect(() => {
    if (!checked) {
      checkAuth()
    }
  }, [checked, checkAuth])

  const logout = useCallback(() => {
    storeLogout()
    window.location.href = "/login"
  }, [storeLogout])

  return {
    user,
    isAuthenticated,
    isLoading,
    roles: user?.roles ?? [],
    isSuperAdmin: user?.isSuperAdmin ?? false,
    checkAuth,
    logout,
  }
}
