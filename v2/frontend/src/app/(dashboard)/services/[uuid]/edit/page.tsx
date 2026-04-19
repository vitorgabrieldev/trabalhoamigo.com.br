'use client'

import { use, useState, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { servicesApi, categoriesApi } from '@/lib/api'
import type { Category, Service } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category_uuid: z.string().min(1, 'Selecione uma categoria'),
  base_price: z.string().optional(),
  accepts_offer: z.boolean(),
  is_community: z.boolean(),
  status: z.enum(['active', 'inactive', 'pending']),
})

type FormData = z.infer<typeof schema>

type UploadedImage = {
  id: string
  file: File
}

type ExistingImage = {
  id: string
  url: string
}

function parseBRLMaskedInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, '')
  if (!digitsOnly) return ''
  return (Number(digitsOnly) / 100).toFixed(2)
}

function formatBRLInput(value?: string): string {
  if (!value) return ''
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

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
  const [isDraggingImages, setIsDraggingImages] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])

  const { data: service, isLoading, isError } = useQuery({
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
  const basePrice = watch('base_price')

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (service && categories.length > 0) {
      reset({
        title: service.title,
        description: service.description,
        category_uuid: service.category?.uuid ?? '',
        base_price: service.base_price?.toString() ?? '',
        accepts_offer: service.accepts_offer,
        is_community: service.is_community,
        status: service.status,
      })

      if (service.images && service.images.length > 0) {
        setExistingImages(
          service.images.map((url, i) => ({ id: `existing-${i}-${url}`, url })),
        )
      } else if (service.image_url) {
        setExistingImages([{ id: 'existing-0', url: service.image_url }])
      }
    }
  }, [service, categories, reset])

  const addUploadedImages = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return
    setUploadedImages((prev) => {
      const existingKeys = new Set(
        prev.map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`),
      )
      const toAdd = imageFiles
        .filter((f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`))
        .map((f, i) => ({
          id: `${f.name}-${f.size}-${f.lastModified}-${Date.now()}-${i}`,
          file: f,
        }))
      return [...prev, ...toAdd]
    })
  }

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    addUploadedImages(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDropImages = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDraggingImages(false)
    addUploadedImages(Array.from(event.dataTransfer.files ?? []))
  }

  const removeUploadedImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleAcceptsOfferToggle = () => {
    const next = !acceptsOffer
    setValue('accepts_offer', next, { shouldDirty: true, shouldValidate: true })
    if (next) setValue('is_community', false, { shouldDirty: true, shouldValidate: true })
  }

  const handleCommunityToggle = () => {
    const next = !isCommunity
    setValue('is_community', next, { shouldDirty: true, shouldValidate: true })
    if (next) setValue('accepts_offer', false, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      // If user added new images, send them (they replace existing on server)
      // If user removed all existing and added nothing, send empty images array
      const imagesToSend = uploadedImages.map((img) => img.file)

      await servicesApi.update(uuid, {
        title: data.title,
        description: data.description,
        category_uuid: data.category_uuid,
        base_price: data.base_price ? parseFloat(data.base_price) : undefined,
        accepts_offer: data.accepts_offer,
        is_community: data.is_community,
        status: data.status,
        images: imagesToSend.length > 0 ? imagesToSend : undefined,
      })

      queryClient.invalidateQueries({ queryKey: ['service', uuid] })
      queryClient.invalidateQueries({ queryKey: ['my-services'] })
      router.push('/dashboard/services')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError = axiosErr.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors)[0]?.[0]
        : null
      setError(firstError ?? axiosErr.response?.data?.message ?? 'Erro ao atualizar serviço.')
    }
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !service) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        Serviço não encontrado ou ocorreu um erro ao carregar.
      </Alert>
    )
  }

  return (
    <div className="w-full space-y-6">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="informacoes" className="w-full">
          <TabsList className="h-auto w-full justify-start gap-1 flex-wrap">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* ── Informações ── */}
          <TabsContent value="informacoes">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações do serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Nome do serviço"
                    className="mt-1"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o serviço, o que será entregue e os principais detalhes."
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
                    onValueChange={(v) =>
                      setValue('category_uuid', v, { shouldDirty: true, shouldValidate: true })
                    }
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
                  <input type="hidden" {...register('base_price')} />
                  <Input
                    id="base_price"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    className="mt-1"
                    value={formatBRLInput(basePrice)}
                    onChange={(e) =>
                      setValue('base_price', parseBRLMaskedInput(e.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe vazio se o preço é negociável.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Personalização ── */}
          <TabsContent value="personalizacao">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personalização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label
                  htmlFor="service-images"
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors cursor-pointer ${
                    isDraggingImages ? 'border-primary bg-primary/5' : 'border-gray-300'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDraggingImages(true)
                  }}
                  onDragLeave={() => setIsDraggingImages(false)}
                  onDrop={handleDropImages}
                >
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      Arraste e solte imagens aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ou clique para selecionar vários arquivos do computador
                    </p>
                  </div>
                </Label>

                <input
                  id="service-images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleSelectImages}
                />

                {/* Existing images from API */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Imagens atuais ({existingImages.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {existingImages.map((img) => (
                        <div
                          key={img.id}
                          className="relative rounded-md overflow-hidden border border-gray-200 aspect-video bg-gray-50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt="Imagem do serviço"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute top-1 right-1 inline-flex items-center justify-center rounded-full w-5 h-5 bg-black/60 text-white hover:bg-black/80 transition-colors"
                            aria-label="Remover imagem"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Novas imagens ({uploadedImages.length})
                    </p>
                    <div className="space-y-2">
                      {uploadedImages.map((img) => (
                        <div
                          key={img.id}
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                        >
                          <p className="text-sm text-gray-700 truncate">{img.file.name}</p>
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(img.id)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            aria-label={`Remover ${img.file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Configurações ── */}
          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  As opções abaixo são exclusivas: ao ligar uma, a outra é desligada automaticamente.
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Aceita propostas</p>
                    <p className="text-xs text-muted-foreground">
                      Clientes podem negociar valores para este serviço
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAcceptsOfferToggle}
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
                      Serviço voluntário sem negociação de proposta
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCommunityToggle}
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

                <div>
                  <Label>Status</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(v) =>
                      setValue('status', v as 'active' | 'inactive' | 'pending', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
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
          </TabsContent>
        </Tabs>

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
