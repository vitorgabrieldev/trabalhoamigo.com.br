'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { meApi, authApi } from '@/lib/api'
import type { User } from '@/types'

export function useAuth() {
  const { user, accessToken, isLoading, setAuth, setUser, clearAuth, hydrate } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isLoading && accessToken && !user) {
      meApi.getProfile()
        .then((res) => setUser(res.data))
        .catch(() => clearAuth())
    }
  }, [isLoading, accessToken, user, setUser, clearAuth])

  const login = async (email: string, password: string, totp_code?: string) => {
    const res = await authApi.login(email, password, totp_code)
    const { access_token, refresh_token } = res.data

    const profileRes = await meApi.getProfile.call(
      null,
      // We need to pass the token manually before the store is updated
    ).catch(() => null)

    // Temporarily set tokens to get profile
    const { setTokens: st } = await import('@/lib/auth')
    st(access_token, refresh_token)

    const profile = await meApi.getProfile()
    setAuth(profile.data as User, access_token, refresh_token)
    return profile.data as User
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      clearAuth()
      router.push('/login')
    }
  }

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    setAuth,
    setUser,
    clearAuth,
  }
}
