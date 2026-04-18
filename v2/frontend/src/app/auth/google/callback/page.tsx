'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { setTokens, setNeedsOnboarding } from '@/lib/auth'
import { meApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const error = searchParams.get('error')

    if (error || !accessToken || !refreshToken) {
      router.replace('/login?error=' + encodeURIComponent(error ?? 'Falha no login com Google.'))
      return
    }

    setTokens(accessToken, refreshToken)

    meApi.getProfile()
      .then((res) => {
        const user = res.data as User
        setNeedsOnboarding(!!user.needs_onboarding)
        setAuth(user, accessToken, refreshToken)
        router.replace(user.needs_onboarding ? '/auth/onboarding' : '/dashboard')
      })
      .catch(() => {
        router.replace('/login?error=Erro ao carregar perfil.')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Autenticando com Google...</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackContent />
    </Suspense>
  )
}
