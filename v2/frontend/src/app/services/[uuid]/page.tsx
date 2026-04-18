'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
  Tag,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScheduleSlotPicker } from '@/components/proposals/ScheduleSlotPicker'
import { servicesApi, proposalsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { formatBRL, formatDate, getInitials } from '@/lib/utils'
import type { Service, PaginatedResponse, Review, ScheduleType } from '@/types'

interface Slot {
  date: string
  time_type: 'specific_time' | 'all_day'
  start_time?: string
  end_time?: string
}

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [proposalOpen, setProposalOpen] = useState(false)
  const [scheduleType, setScheduleType] = useState<ScheduleType>('to_be_arranged')
  const [slots, setSlots] = useState<Slot[]>([])
  const [anyTimeDate, setAnyTimeDate] = useState('')
  const [offeredPrice, setOfferedPrice] = useState('')
  const [description, setDescription] = useState('')
  const [proposalError, setProposalError] = useState<string | null>(null)
  const [reviewPage, setReviewPage] = useState(1)

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', uuid],
    queryFn: () => servicesApi.get(uuid).then((r) => r.data as Service),
  })

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['service-reviews', uuid, reviewPage],
    queryFn: () =>
      servicesApi.getReviews(uuid, reviewPage).then((r) => r.data as PaginatedResponse<Review>),
    enabled: !!service,
  })

  const { mutate: submitProposal, isPending: submittingProposal } = useMutation({
    mutationFn: () =>
      proposalsApi.create(uuid, {
        offered_price: parseFloat(offeredPrice),
        description: description || undefined,
        schedule_type: scheduleType,
        any_time_date: scheduleType === 'any_time_on_day' ? anyTimeDate : undefined,
        slots: scheduleType === 'specific_slots' ? slots : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals-sent'] })
      setProposalOpen(false)
      router.push('/proposals')
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setProposalError(axiosErr.response?.data?.message ?? 'Erro ao enviar proposta.')
    },
  })

  const handleProposalSubmit = () => {
    setProposalError(null)
    if (!offeredPrice || isNaN(parseFloat(offeredPrice))) {
      setProposalError('Informe um valor válido.')
      return
    }
    submitProposal()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          Serviço não encontrado ou indisponível.
        </Alert>
      </div>
    )
  }

  const isOwner = user?.uuid === service.provider.uuid
  const canPropose = user && user.role === 'contractor' && !isOwner

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/services" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>

        {/* Hero image */}
        <div className="relative h-64 sm:h-80 bg-gray-100 rounded-xl overflow-hidden mb-6">
          {service.image_url ? (
            <Image
              src={service.image_url}
              alt={service.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/20">
              <Tag className="h-16 w-16 text-primary/30" />
            </div>
          )}
          {service.is_community && (
            <div className="absolute top-4 left-4">
              <Badge variant="success">Comunitário</Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + category */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {service.category?.name}
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>

              {(service.reviews_count ?? 0) > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(service.average_rating ?? 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{service.average_rating?.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({service.reviews_count} avaliações)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Avaliações {service.reviews_count ? `(${service.reviews_count})` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReviews ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.data.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.data.map((review) => (
                      <div key={review.uuid} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {getInitials(
                                review.reviewer?.first_name ?? 'U',
                                review.reviewer?.last_name ?? 'U',
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {review.reviewer?.first_name} {review.reviewer?.last_name}
                          </span>
                          <div className="flex ml-auto">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.stars
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    ))}

                    {/* Review pagination */}
                    {reviews?.meta && reviews.meta.last_page > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                          disabled={reviewPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {reviews.meta.current_page}/{reviews.meta.last_page}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setReviewPage((p) => Math.min(reviews.meta.last_page, p + 1))
                          }
                          disabled={reviewPage === reviews.meta.last_page}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Não há nada aqui :\
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price + action */}
            <Card>
              <CardContent className="p-5">
                <div className="mb-4">
                  {service.base_price ? (
                    <div>
                      <p className="text-xs text-muted-foreground">A partir de</p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {formatBRL(service.base_price)}
                      </p>
                    </div>
                  ) : service.accepts_offer ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="font-medium">Aceita proposta</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Sob consulta</span>
                  )}
                </div>

                {canPropose && (
                  <Button className="w-full" onClick={() => setProposalOpen(true)}>
                    Fazer proposta
                  </Button>
                )}
                {!user && (
                  <Button className="w-full" asChild>
                    <Link href="/login">Entrar para fazer proposta</Link>
                  </Button>
                )}
                {isOwner && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/services/${uuid}/edit`}>Editar serviço</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Provider card */}
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
                  Prestador
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={service.provider?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(
                        service.provider?.first_name ?? 'U',
                        service.provider?.last_name ?? 'U',
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {service.provider?.first_name} {service.provider?.last_name}
                    </p>
                    {service.provider?.address?.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {service.provider.address.city}, {service.provider.address.state}
                      </p>
                    )}
                  </div>
                </div>
                {(service.provider?.reviews_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1 mt-3">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">
                      {service.provider?.average_rating?.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({service.provider?.reviews_count} avaliações)
                    </span>
                  </div>
                )}
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Membro desde {formatDate(service.provider?.created_at ?? service.created_at, { year: 'numeric', month: 'long' })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Proposal dialog */}
      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fazer proposta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {proposalError && (
              <Alert variant="destructive">{proposalError}</Alert>
            )}

            <div>
              <Label htmlFor="offered_price">Valor oferecido (R$)</Label>
              <Input
                id="offered_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="mt-1"
              />
              {service.base_price && (
                <p className="text-xs text-muted-foreground mt-1">
                  Preço base: {formatBRL(service.base_price)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o que você precisa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <ScheduleSlotPicker
              scheduleType={scheduleType}
              onScheduleTypeChange={setScheduleType}
              slots={slots}
              onSlotsChange={setSlots}
              anyTimeDate={anyTimeDate}
              onAnyTimeDateChange={setAnyTimeDate}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProposalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProposalSubmit} disabled={submittingProposal}>
              {submittingProposal ? 'Enviando...' : 'Enviar proposta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
