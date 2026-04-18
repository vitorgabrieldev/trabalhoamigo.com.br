'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Search, Loader2 } from 'lucide-react'
import { authApi, meApi } from '@/lib/api'
import { setNeedsOnboarding } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

type Role = 'contractor' | 'provider'

const ROLES: { value: Role; icon: React.ReactNode; title: string; description: string }[] = [
  {
    value: 'contractor',
    icon: <Search className="h-8 w-8" />,
    title: 'Contratante',
    description: 'Quero encontrar e contratar profissionais para realizar serviços.',
  },
  {
    value: 'provider',
    icon: <Briefcase className="h-8 w-8" />,
    title: 'Prestador',
    description: 'Quero oferecer meus serviços e encontrar novos clientes.',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [selected, setSelected] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      await authApi.completeOnboarding(selected)
      setNeedsOnboarding(false)
      const profileRes = await meApi.getProfile()
      setUser(profileRes.data as User)
      router.replace('/dashboard')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo{user?.first_name ? `, ${user.first_name}` : ''}!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Para finalizar seu cadastro, nos diga como pretende usar a plataforma.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelected(role.value)}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                selected === role.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className={selected === role.value ? 'text-primary' : 'text-gray-400'}>
                {role.icon}
              </span>
              <div>
                <p className="font-semibold text-sm">{role.title}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
  )
}
