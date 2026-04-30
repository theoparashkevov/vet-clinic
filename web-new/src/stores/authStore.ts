import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name: string
  email: string
  roles: string[]
  isSuperAdmin: boolean
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  isLoading: boolean
  setLoading: (loading: boolean) => void
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      isLoading: true,
      setLoading: (loading) => set({ isLoading: loading }),
      login: (user, token) =>
        set({ user, isAuthenticated: true, token, isLoading: false }),
      logout: () =>
        set({ user: null, isAuthenticated: false, token: null, isLoading: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "vet-clinic-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
)
