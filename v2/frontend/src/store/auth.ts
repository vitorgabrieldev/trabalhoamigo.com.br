'use client'

import { create } from 'zustand'
import type { User } from '@/types'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  setAuth: (user: User, token: string, refreshToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  setAuth: (user, token, refreshToken) => {
    setTokens(token, refreshToken)
    set({ user, accessToken: token, refreshToken, isLoading: false })
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    clearTokens()
    set({ user: null, accessToken: null, refreshToken: null, isLoading: false })
  },

  hydrate: () => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()
    if (accessToken) {
      set({ accessToken, refreshToken, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },
}))
