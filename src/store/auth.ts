import { create } from "zustand"
import type { User } from "@/types"
import { login as loginService, getMe } from "@/api/auth"

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { token, user } = await loginService({ email, password })
    localStorage.setItem("token", token)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem("token")
    set({ token: null, user: null, isAuthenticated: false })
  },

  loadUser: async () => {
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem("token")
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))