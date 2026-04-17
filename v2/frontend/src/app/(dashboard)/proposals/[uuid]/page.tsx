'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MessageCircle,
  Check,
  X,
  Ban,
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { proposalsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { formatBRL, formatDate, formatDateTime, getInitials, statusLabel, statusColor } from '@/lib/utils'
import type { Proposal } from '@/types'

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [acceptOpen, setAcceptOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: proposal, isLoading, isError } = useQuery({
    queryKey: ['proposal', uuid],
    queryFn: () => proposalsApi.get(uuid).then((r) => r.data as Proposal),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['proposal', uuid] })
    queryClient.invalidateQueries({ queryKey: ['proposals-sent'] })
    queryClient.invalidateQueries({ queryKey: ['proposals-received'] })
  }

  const { mutate: acceptProposal, isPending: accepting } = useMutation({
    mutationFn: () => proposalsApi.accept(uuid, selectedSlot || undefined),
    onSuccess: () => {
      invalidate()
      setAcceptOpen(false)
      router.push('/contracts')
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setActionError(axiosErr.response?.data?.message ?? 'Erro ao aceitar proposta.')
    },
  })

  const { mutate: rejectProposal, isPending: rejecting } = useMutation({
    mutationFn: () => proposalsApi.reject(uuid),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setActionError(axiosErr.response?.data?.message ?? 'Erro ao rejeitar proposta.')
    },
  })

  const { mutate: cancelProposal, isPending: cancelling } = useMutation({
    mutationFn: () => proposalsApi.cancel(uuid),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setActionError(axiosErr.response?.data?.message ?? 'Erro ao cancelar proposta.')
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

  if (isError || !proposal) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto">
        Proposta não encontrada.
      </Alert>
    )
  }

  const isProvider = user?.uuid === proposal.provider?.uuid
  const isContractor = user?.uuid === proposal.contractor?.uuid
  const otherParty = isProvider ? proposal.contractor : proposal.provider
  const price = isProvider ? proposal.provider_amount : proposal.offered_price

  const scheduleTypeLabel = {
    specific_slots: 'Horários específicos',
    any_time_on_day: 'Qualquer horário do dia',
    to_be_arranged: 'A combinar',
  }[proposal.schedule_type] ?? proposal.schedule_type

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/proposals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da proposta</h1>
        </div>
      </div>

      {actionError && (
        <Alert variant="destructive">{actionError}</Alert>
      )}

      {/* Status + Service */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {proposal.service?.category?.name}
              </p>
              <h2 className="text-lg font-bold text-gray-900">
                {proposal.service?.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enviada em {formatDateTime(proposal.created_at)}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${statusColor(
                proposal.status,
              )}`}
            >
              {statusLabel(proposal.status)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {price && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-semibold text-gray-900">{formatBRL(price)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Agendamento:</span>
              <span className="font-medium">{scheduleTypeLabel}</span>
            </div>
            {proposal.any_time_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">{formatDate(proposal.any_time_date)}</span>
              </div>
            )}
            {proposal.description && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm text-gray-700">{proposal.description}</p>
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
            {proposal.service?.uuid && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/services/${proposal.service.uuid}`}>
                  Ver serviço
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slots */}
      {proposal.slots && proposal.slots.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Horários propostos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proposal.slots.map((slot, idx) => (
                <div key={slot.uuid} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-50">
                  <span className="text-muted-foreground text-xs">Opção {idx + 1}</span>
                  <span className="font-medium">{formatDate(slot.date)}</span>
                  {slot.time_type === 'all_day' ? (
                    <Badge variant="outline" className="text-xs">Dia todo</Badge>
                  ) : (
                    <span className="text-muted-foreground">
                      {slot.start_time} — {slot.end_time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {proposal.status === 'pending' && (
        <div className="flex flex-wrap gap-3">
          {isProvider && (
            <>
              <Button
                onClick={() => setAcceptOpen(true)}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Aceitar proposta
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectProposal()}
                disabled={rejecting}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {rejecting ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </>
          )}
          {isContractor && (
            <Button
              variant="destructive"
              onClick={() => cancelProposal()}
              disabled={cancelling}
              className="flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              {cancelling ? 'Cancelando...' : 'Cancelar proposta'}
            </Button>
          )}
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href="/conversations">
              <MessageCircle className="h-4 w-4" />
              Ver mensagens
            </Link>
          </Button>
        </div>
      )}

      {/* Accept proposal dialog */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceitar proposta</DialogTitle>
            <DialogDescription>
              Selecione o horário de preferência para realizar o serviço.
            </DialogDescription>
          </DialogHeader>

          {proposal.slots && proposal.slots.length > 0 && (
            <div>
              <Label>Horário confirmado</Label>
              <Select onValueChange={setSelectedSlot}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {proposal.slots.map((slot, idx) => (
                    <SelectItem key={slot.uuid} value={slot.uuid}>
                      Opção {idx + 1}: {formatDate(slot.date)}
                      {slot.time_type === 'all_day'
                        ? ' (dia todo)'
                        : ` ${slot.start_time}–${slot.end_time}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {actionError && <Alert variant="destructive">{actionError}</Alert>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => acceptProposal()} disabled={accepting}>
              {accepting ? 'Aceitando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
