'use client'

import { use, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { servicesApi, categoriesApi } from '@/lib/api'
import type { Category, Service } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category_uuid: z.string().min(1, 'Selecione uma categoria'),
  base_price: z.string().optional(),
  accepts_offer: z.boolean(),
  is_community: z.boolean(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'pending']),
})

type FormData = z.infer<typeof schema>

export default function EditServicePage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', uuid],
    queryFn: () => servicesApi.get(uuid).then((r) => r.data as Service),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      accepts_offer: true,
      is_community: false,
      status: 'active',
    },
  })

  const acceptsOffer = watch('accepts_offer')
  const isCommunity = watch('is_community')

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (service) {
      reset({
        title: service.title,
        description: service.description,
        category_uuid: service.category?.uuid ?? '',
        base_price: service.base_price?.toString() ?? '',
        accepts_offer: service.accepts_offer,
        is_community: service.is_community,
        image_url: service.image_url ?? '',
        status: service.status,
      })
    }
  }, [service, reset])

  const { mutate: updateService } = useMutation({
    mutationFn: (data: FormData) =>
      servicesApi.update(uuid, {
        title: data.title,
        description: data.description,
        category_uuid: data.category_uuid,
        base_price: data.base_price ? parseFloat(data.base_price) : undefined,
        accepts_offer: data.accepts_offer,
        is_community: data.is_community,
        image_url: data.image_url || undefined,
        status: data.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', uuid] })
      queryClient.invalidateQueries({ queryKey: ['my-services'] })
      router.push('/dashboard/services')
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError = axiosErr.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors)[0]?.[0]
        : null
      setError(firstError ?? axiosErr.response?.data?.message ?? 'Erro ao atualizar serviço.')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (!service) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        Serviço não encontrado.
      </Alert>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar serviço</h1>
          <p className="text-sm text-muted-foreground">Atualize as informações do serviço</p>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <form onSubmit={handleSubmit((data) => updateService(data))}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input id="title" className="mt-1" {...register('title')} />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                rows={5}
                className="mt-1"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label>Categoria *</Label>
              <Select
                value={watch('category_uuid')}
                onValueChange={(v) => setValue('category_uuid', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.uuid} value={cat.uuid}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_uuid && (
                <p className="text-xs text-red-500 mt-1">{errors.category_uuid.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="base_price">Preço base (R$)</Label>
              <Input
                id="base_price"
                type="number"
                min="0"
                step="0.01"
                className="mt-1"
                {...register('base_price')}
              />
            </div>

            <div>
              <Label htmlFor="image_url">URL da imagem</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://..."
                className="mt-1"
                {...register('image_url')}
              />
              {errors.image_url && (
                <p className="text-xs text-red-500 mt-1">{errors.image_url.message}</p>
              )}
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as 'active' | 'inactive' | 'pending')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Aceita propostas</p>
                <p className="text-xs text-muted-foreground">
                  Clientes podem fazer propostas com valores diferentes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue('accepts_offer', !acceptsOffer)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  acceptsOffer ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    acceptsOffer ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Serviço comunitário</p>
                <p className="text-xs text-muted-foreground">
                  Serviço oferecido gratuitamente à comunidade
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue('is_community', !isCommunity)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  isCommunity ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    isCommunity ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/services">Cancelar</Link>
          </Button>
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
    </div>
  )
}
