'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Controller } from 'react-hook-form'
import { Camera, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarCropDialog } from '@/components/settings/AvatarCropDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
})

type FormData = z.infer<typeof schema>

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, setUser, clearAuth } = useAuthStore()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const openDeleteDialog = useCallback(() => {
    setDeleteConfirmText('')
    setDeleteDialogOpen(true)
  }, [])

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => meApi.getProfile().then((r) => r.data as User),
    initialData: user ?? undefined,
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone ?? '',
        whatsapp: profile.whatsapp ?? '',
      })
    }
  }, [profile, reset])

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSrc(URL.createObjectURL(file))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleCropConfirm = useCallback(async (blob: Blob): Promise<void> => {
    const objectUrl = URL.createObjectURL(blob)
    setAvatarPreview(objectUrl)
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      const res = await meApi.uploadAvatar(file)
      const updatedUser = { ...user, avatar_url: res.data.avatar_url } as User
      setUser(updatedUser)
      setCropSrc(null)
    } catch {
      setAvatarPreview(null)
      throw new Error('upload failed')
    }
  }, [user, setUser])

  const handleCropCancel = useCallback(() => {
    setCropSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const { mutate: updateProfile } = useMutation({
    mutationFn: (data: FormData) =>
      meApi.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        whatsapp: data.whatsapp || undefined,
      }),
    onSuccess: (res) => {
      const updated = res.data as User
      setUser(updated)
      reset({
        first_name: updated.first_name,
        last_name: updated.last_name,
        phone: updated.phone ?? '',
        whatsapp: updated.whatsapp ?? '',
      })
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
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <AvatarCropDialog
              imageSrc={cropSrc}
              onConfirm={handleCropConfirm}
              onCancel={handleCropCancel}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group rounded-full cursor-pointer"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarPreview ?? profile?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(profile?.first_name ?? 'U', profile?.last_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
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
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Controller
                name="whatsapp"
                control={control}
                render={({ field }) => (
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting || !isDirty || !isValid} className="cursor-pointer">
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
            <span className="text-muted-foreground">E-mail verificado</span>
            <span className={`font-medium ${profile?.email_verified_at ? 'text-green-600' : 'text-amber-500'}`}>
              {profile?.email_verified_at ? 'Verificado' : 'Não verificado'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tipo de conta</span>
            <span className="font-medium">
              {profile?.role === 'provider' ? 'Prestador' : 'Contratante'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Google vinculado</span>
            {profile?.google_linked ? (
              <span className="font-medium text-green-600">Vinculado</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'
                  window.location.href = `${base}/auth/google/redirect`
                }}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                Vincular com Google
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Autenticação em 2 fatores</span>
            <span className={`font-medium ${profile?.totp_enabled ? 'text-green-600' : 'text-gray-500'}`}>
              {profile?.totp_enabled ? 'Ativada' : 'Desativada'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Membro desde</span>
            <span className="font-medium text-gray-700">
              {profile?.created_at
                ? `Há ${formatDistanceToNow(new Date(profile.created_at), { locale: ptBR })}`
                : '—'}
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
            onClick={openDeleteDialog}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Excluir conta
          </button>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!deleting) setDeleteDialogOpen(open) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <TriangleAlert className="h-5 w-5" />
              Excluir conta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-700">
              Sua conta será <strong>desativada imediatamente</strong>. Todos os seus dados, serviços e contratos serão removidos e essa ação não poderá ser desfeita.
            </p>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">
                Para confirmar, digite <strong className="text-gray-900">Remover</strong> abaixo:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Remover"
                disabled={deleting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'Remover' || deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Excluindo...
                </span>
              ) : (
                'Continuar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
