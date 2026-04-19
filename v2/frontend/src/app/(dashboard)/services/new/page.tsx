'use client'

import { useState, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { servicesApi, categoriesApi } from '@/lib/api'
import type { Category } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category_uuid: z.string().min(1, 'Selecione uma categoria'),
  base_price: z.string().optional(),
  accepts_offer: z.boolean(),
  is_community: z.boolean(),
})

type FormData = z.infer<typeof schema>
type UploadedImage = {
  id: string
  file: File
}

function parseBRLMaskedInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, '')

  if (!digitsOnly) {
    return ''
  }

  return (Number(digitsOnly) / 100).toFixed(2)
}

function formatBRLInput(value?: string): string {
  if (!value) {
    return ''
  }

  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    return ''
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export default function NewServicePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDraggingImages, setIsDraggingImages] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      accepts_offer: true,
      is_community: false,
    },
  })

  const acceptsOffer = watch('accepts_offer')
  const isCommunity = watch('is_community')
  const basePrice = watch('base_price')

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  const addUploadedImages = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      return
    }

    setUploadedImages((prev) => {
      const existingKeys = new Set(
        prev.map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`),
      )
      const toAdd = imageFiles
        .filter((file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`))
        .map((file, index) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
          file,
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
    setUploadedImages((prev) => prev.filter((image) => image.id !== id))
  }

  const handleAcceptsOfferToggle = () => {
    const nextValue = !acceptsOffer
    setValue('accepts_offer', nextValue, { shouldDirty: true, shouldValidate: true })
    if (nextValue) {
      setValue('is_community', false, { shouldDirty: true, shouldValidate: true })
    }
  }

  const handleCommunityToggle = () => {
    const nextValue = !isCommunity
    setValue('is_community', nextValue, { shouldDirty: true, shouldValidate: true })
    if (nextValue) {
      setValue('accepts_offer', false, { shouldDirty: true, shouldValidate: true })
    }
  }

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      await servicesApi.create({
        title: data.title,
        description: data.description,
        category_uuid: data.category_uuid,
        base_price: data.base_price ? parseFloat(data.base_price) : undefined,
        accepts_offer: data.accepts_offer,
        is_community: data.is_community,
        images: uploadedImages.map((image) => image.file),
      })
      router.push('/dashboard/services')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError = axiosErr.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors)[0]?.[0]
        : null
      setError(firstError ?? axiosErr.response?.data?.message ?? 'Erro ao criar serviço.')
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Novo serviço</h1>
          <p className="text-sm text-muted-foreground">Preencha as informações do seu serviço</p>
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
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
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
                    onValueChange={(v) => setValue('category_uuid', v, { shouldDirty: true, shouldValidate: true })}
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
                  onDragOver={(event) => {
                    event.preventDefault()
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

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Imagens selecionadas ({uploadedImages.length})
                    </p>
                    <div className="space-y-2">
                      {uploadedImages.map((image) => (
                        <div
                          key={image.id}
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                        >
                          <p className="text-sm text-gray-700 truncate">
                            {image.file.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(image.id)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            aria-label={`Remover ${image.file.name}`}
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
                Criando...
              </span>
            ) : (
              'Criar serviço'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
