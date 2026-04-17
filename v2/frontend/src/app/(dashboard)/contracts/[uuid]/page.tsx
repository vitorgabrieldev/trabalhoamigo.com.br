'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { contractsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { formatBRL, formatDate, formatDateTime, getInitials, statusLabel, statusColor } from '@/lib/utils'
import type { Contract } from '@/types'

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [disputeOpen, setDisputeOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ['contract', uuid],
    queryFn: () => contractsApi.get(uuid).then((r) => r.data as Contract),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['contract', uuid] })
    queryClient.invalidateQueries({ queryKey: ['contracts'] })
  }

  const { mutate: complete, isPending: completing } = useMutation({
    mutationFn: () => contractsApi.providerComplete(uuid),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setActionError(axiosErr.response?.data?.message ?? 'Erro ao marcar como concluído.')
    },
  })

  const { mutate: confirm, isPending: confirming } = useMutation({
    mutationFn: () => contractsApi.contractorConfirm(uuid),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setActionError(axiosErr.response?.data?.message ?? 'Erro ao confirmar conclusão.')
    },
  })

  const { mutate: openDispute, isPending: disputing } = useMutation({
    mutationFn: () => contractsApi.dispute(uuid, disputeReason),
    onSuccess: () => {
      invalidate()
      setDisputeOpen(false)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setActionError(axiosErr.response?.data?.message ?? 'Erro ao abrir disputa.')
    },
  })

  const { mutate: submitReview, isPending: reviewing } = useMutation({
    mutationFn: () =>
      contractsApi.review(uuid, reviewStars, reviewComment || undefined),
    onSuccess: () => {
      invalidate()
      setReviewOpen(false)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setActionError(axiosErr.response?.data?.message ?? 'Erro ao enviar avaliação.')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !contract) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto">
        Contrato não encontrado.
      </Alert>
    )
  }

  const isProvider = user?.uuid === contract.provider?.uuid
  const isContractor = user?.uuid === contract.contractor?.uuid
  const otherParty = isProvider ? contract.contractor : contract.provider

  const canComplete = isProvider && contract.status === 'active'
  const canConfirm = isContractor && contract.status === 'provider_completed'
  const canDispute =
    (isProvider || isContractor) &&
    (contract.status === 'active' || contract.status === 'provider_completed')
  const canReview =
    (isProvider || isContractor) &&
    (contract.status === 'contractor_confirmed' || contract.status === 'auto_completed')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Detalhes do contrato</h1>
      </div>

      {actionError && <Alert variant="destructive">{actionError}</Alert>}

      {/* Header card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {contract.proposal?.service?.category?.name}
              </p>
              <h2 className="text-lg font-bold text-gray-900">
                {contract.proposal?.service?.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Criado em {formatDateTime(contract.created_at)}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${statusColor(
                contract.status,
              )}`}
            >
              {statusLabel(contract.status)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contract details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-semibold text-gray-900">{formatBRL(contract.price)}</span>
            </div>
            {contract.scheduled_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Agendado para:</span>
                <span className="font-medium">{formatDate(contract.scheduled_at)}</span>
              </div>
            )}
            {contract.provider_completed_at && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Concluído pelo prestador:</span>
                <span className="font-medium text-xs">
                  {formatDateTime(contract.provider_completed_at)}
                </span>
              </div>
            )}
            {contract.contractor_confirmed_at && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Confirmado pelo contratante:</span>
                <span className="font-medium text-xs">
                  {formatDateTime(contract.contractor_confirmed_at)}
                </span>
              </div>
            )}
            {contract.auto_release_at && contract.status === 'provider_completed' && (
              <div className="text-xs text-muted-foreground mt-1">
                Liberação automática em {formatDateTime(contract.auto_release_at)}
              </div>
            )}
            {contract.dispute_reason && (
              <div className="pt-2 border-t">
                <p className="text-xs text-red-500 font-medium mb-1">Motivo da disputa:</p>
                <p className="text-sm text-gray-700">{contract.dispute_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other party */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {isProvider ? 'Contratante' : 'Prestador'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParty?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(otherParty?.first_name ?? 'U', otherParty?.last_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {otherParty?.first_name} {otherParty?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{otherParty?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/conversations">
                <MessageCircle className="h-4 w-4 mr-2" />
                Mensagens
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canComplete && (
          <Button onClick={() => complete()} disabled={completing}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {completing ? 'Marcando...' : 'Marcar como concluído'}
          </Button>
        )}
        {canConfirm && (
          <Button onClick={() => confirm()} disabled={confirming}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {confirming ? 'Confirmando...' : 'Confirmar conclusão'}
          </Button>
        )}
        {canReview && (
          <Button variant="outline" onClick={() => setReviewOpen(true)}>
            <Star className="h-4 w-4 mr-2" />
            Avaliar serviço
          </Button>
        )}
        {canDispute && (
          <Button
            variant="destructive"
            onClick={() => setDisputeOpen(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Abrir disputa
          </Button>
        )}
      </div>

      {/* Dispute dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir disputa</DialogTitle>
            <DialogDescription>
              Descreva o motivo da disputa. Nossa equipe irá analisar o caso.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="dispute_reason">Motivo *</Label>
            <Textarea
              id="dispute_reason"
              placeholder="Descreva o problema..."
              rows={4}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => openDispute()}
              disabled={disputing || !disputeReason.trim()}
            >
              {disputing ? 'Enviando...' : 'Confirmar disputa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nota</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewStars(s)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        s <= reviewStars
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review_comment">Comentário (opcional)</Label>
              <Textarea
                id="review_comment"
                placeholder="Conte sua experiência..."
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => submitReview()} disabled={reviewing}>
              {reviewing ? 'Enviando...' : 'Enviar avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
