'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { meApi } from '@/lib/api'
import { clearTokens } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import { getInitials } from '@/lib/utils'
import type { User } from '@/types'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const schema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, setUser, clearAuth } = useAuthStore()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true)
    try {
      await meApi.deleteAccount()
      clearAuth()
      clearTokens()
      router.replace('/')
    } catch {
      setDeleting(false)
    }
  }, [clearAuth, router])

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => meApi.getProfile().then((r) => r.data as User),
    initialData: user ?? undefined,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone ?? '',
        whatsapp: profile.whatsapp ?? '',
        avatar_url: profile.avatar_url ?? '',
      })
    }
  }, [profile, reset])

  const { mutate: updateProfile } = useMutation({
    mutationFn: (data: FormData) =>
      meApi.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        whatsapp: data.whatsapp || undefined,
        avatar_url: data.avatar_url || undefined,
      }),
    onSuccess: (res) => {
      setUser(res.data as User)
      setSuccess(true)
      setError(null)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Erro ao atualizar perfil.')
    },
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(profile?.first_name ?? 'U', profile?.last_name ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.role === 'provider' ? 'Prestador' : profile?.role === 'contractor' ? 'Contratante' : profile?.role}
              </p>
            </div>
          </div>

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              Perfil atualizado com sucesso!
            </Alert>
          )}
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit((data) => updateProfile(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Nome</Label>
                <Input id="first_name" className="mt-1" {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input id="last_name" className="mt-1" {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(11) 99999-9999" className="mt-1" {...register('phone')} />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" type="tel" placeholder="(11) 99999-9999" className="mt-1" {...register('whatsapp')} />
            </div>

            <div>
              <Label htmlFor="avatar_url">URL do avatar</Label>
              <Input id="avatar_url" type="url" placeholder="https://..." className="mt-1" {...register('avatar_url')} />
              {errors.avatar_url && (
                <p className="text-xs text-red-500 mt-1">{errors.avatar_url.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Salvando...
                  </span>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações da conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">E-mail</span>
            <span className="font-medium">{profile?.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tipo de conta</span>
            <span className="font-medium capitalize">
              {profile?.role === 'provider' ? 'Prestador' : profile?.role === 'contractor' ? 'Contratante' : profile?.role}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">2FA</span>
            <span className={`font-medium ${profile?.totp_enabled ? 'text-green-600' : 'text-gray-500'}`}>
              {profile?.totp_enabled ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Zona de perigo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Excluir conta</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sua conta será desativada imediatamente.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {deleting ? 'Excluindo...' : 'Excluir conta'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
