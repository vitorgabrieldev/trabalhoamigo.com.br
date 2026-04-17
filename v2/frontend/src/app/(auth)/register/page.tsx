'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Briefcase, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { authApi, meApi } from '@/lib/api'
import { setTokens } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

const registerSchema = z.object({
  first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  last_name: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  password_confirmation: z.string(),
  role: z.enum(['provider', 'contractor']),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'As senhas não coincidem',
  path: ['password_confirmation'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'contractor' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    try {
      const res = await authApi.register(data)
      const { access_token, refresh_token } = res.data
      setTokens(access_token, refresh_token)
      const profileRes = await meApi.getProfile()
      setAuth(profileRes.data as User, access_token, refresh_token)
      router.push('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError = axiosErr.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors)[0]?.[0]
        : null
      setError(firstError ?? axiosErr.response?.data?.message ?? 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
            <Briefcase className="h-6 w-6" />
            Trabalho Amigo
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Criar conta</h1>
          <p className="mt-2 text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role selector */}
            <div>
              <Label className="mb-2 block">Tipo de conta</Label>
              <div className="grid grid-cols-2 gap-3">
                {(['contractor', 'provider'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setValue('role', role)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      selectedRole === role
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {role === 'contractor' ? (
                      <div className="text-center">
                        <div className="text-lg mb-1">🔍</div>
                        <div>Contratante</div>
                        <div className="text-xs text-gray-500 font-normal">Busco serviços</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg mb-1">🛠️</div>
                        <div>Prestador</div>
                        <div className="text-xs text-gray-500 font-normal">Ofereço serviços</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">Nome</Label>
                <Input
                  id="first_name"
                  placeholder="João"
                  className="mt-1"
                  {...register('first_name')}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input
                  id="last_name"
                  placeholder="Silva"
                  className="mt-1"
                  {...register('last_name')}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="mt-1"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password_confirmation">Confirmar senha</Label>
              <Input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Repita a senha"
                className="mt-1"
                {...register('password_confirmation')}
              />
              {errors.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Criando conta...
                </span>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
