'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { authApi, meApi } from '@/lib/api'
import { setTokens } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    last_name: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    password_confirmation: z.string(),
    role: z.enum(['provider', 'contractor']),
  })
  .refine((d) => d.password === d.password_confirmation, {
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
      const axiosErr = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } }
      }
      const firstError = axiosErr.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors)[0]?.[0]
        : null
      setError(
        firstError ??
          axiosErr.response?.data?.message ??
          'Erro ao criar conta. Tente novamente.',
      )
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-120">
          {/* Title */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-900 mb-4 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Crie sua conta gratuitamente</h1>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Inicie seu acesso agora mesmo sem pagar nada e descubra um ambiente desenvolvido para
              atender às suas necessidades, com recursos exclusivos e suporte dedicado.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              {error}
            </Alert>
          )}

          {/* Google button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar com o Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Primeiro nome <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Digite seu primeiro nome"
                className="mt-1 h-11 border-gray-200 focus:border-primary focus:ring-primary"
                {...register('first_name')}
              />
              {errors.first_name && (
                <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Sobrenome <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Digite seu sobrenome"
                className="mt-1 h-11 border-gray-200 focus:border-primary focus:ring-primary"
                {...register('last_name')}
              />
              {errors.last_name && (
                <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">E-mail <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="Digite seu e-mail"
                className="mt-1 h-11 border-gray-200 focus:border-primary focus:ring-primary"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Tipo de conta</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
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
                    <div className="text-center">
                      <div className="text-base mb-0.5">{role === 'contractor' ? '🔍' : '🛠️'}</div>
                      <div className="text-xs font-semibold">
                        {role === 'contractor' ? 'Contratante' : 'Prestador'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-normal">
                        {role === 'contractor' ? 'Busco serviços' : 'Ofereço serviços'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Senha <span className="text-red-500">*</span></Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Crie sua nova senha"
                  className="h-11 pr-10 border-gray-200 focus:border-primary focus:ring-primary"
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
              <Label className="text-sm font-medium text-gray-700">Repetir senha <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Confirme sua senha"
                className="mt-1 h-11 border-gray-200 focus:border-primary focus:ring-primary"
                {...register('password_confirmation')}
              />
              {errors.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>

            <p className="text-xs text-gray-400 leading-relaxed text-center">
              Este site é protegado por{' '}
              <span className="underline cursor-pointer">reCAPTCHA</span> e pela{' '}
              <span className="underline cursor-pointer">política de privacidade</span> do Google e por{' '}
              <span className="underline cursor-pointer">termos de serviços</span> aplicados.
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
