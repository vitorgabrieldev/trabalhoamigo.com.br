'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [redirectingToStripe, setRedirectingToStripe] = useState(false)

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

  const openPayment = async () => {
    setRedirectingToStripe(true)
    try {
      const res = await proposalsApi.getCheckout(uuid)
      window.location.href = res.data.url
    } catch {
      setActionError('Erro ao iniciar pagamento. Tente novamente.')
      setRedirectingToStripe(false)
    }
  }

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
                proposal.status, proposal.payment_status,
              )}`}
            >
              {statusLabel(proposal.status, proposal.payment_status)}
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

      {/* Payment banner — contractor needs to pay after provider accepted */}
      {proposal.status === 'accepted' && proposal.payment_status === 'pending_payment' && isContractor && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-amber-900 text-base">Proposta aceita — conclua o pagamento</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  O prestador aceitou. Revise os detalhes abaixo e pague para confirmar o serviço.
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-200 text-amber-900">
                Pagamento pendente
              </span>
            </div>

            {/* Schedule details */}
            <div className="rounded-xl border border-amber-200 bg-white/70 p-4 space-y-3">
              <p className="text-xs text-amber-800 uppercase tracking-wide font-semibold">Resumo do serviço</p>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-amber-700 shrink-0" />
                <span className="text-gray-600">Valor total:</span>
                <span className="font-bold text-gray-900 ml-auto">{formatBRL(proposal.offered_price ?? 0)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                <span className="text-gray-600">Tipo de agendamento:</span>
                <span className="font-medium text-gray-900 ml-auto">{scheduleTypeLabel}</span>
              </div>

              {(() => {
                const selectedSlot = proposal.slots.find((s) => s.is_selected) ?? (proposal.slots.length === 1 ? proposal.slots[0] : null)

                if (proposal.schedule_type === 'to_be_arranged') {
                  return <p className="text-xs text-gray-500 pl-6">Horário combinado entre as partes via chat.</p>
                }

                if (selectedSlot) {
                  return (
                    <div className="flex items-center gap-2.5 pl-2 py-2 rounded-lg bg-amber-100/60 border border-amber-200 text-sm">
                      <Calendar className="h-4 w-4 text-amber-700 shrink-0 ml-1" />
                      <div>
                        <span className="font-semibold text-gray-900">{formatDate(selectedSlot.date)}</span>
                        {selectedSlot.time_type === 'all_day' ? (
                          <span className="text-gray-600 ml-1.5">— dia todo</span>
                        ) : selectedSlot.start_time ? (
                          <span className="text-gray-600 ml-1.5">— {selectedSlot.start_time} às {selectedSlot.end_time}</span>
                        ) : null}
                      </div>
                      <span className="ml-auto mr-2 text-xs font-medium text-amber-700 bg-amber-200 rounded-full px-2 py-0.5">Horário confirmado</span>
                    </div>
                  )
                }

                return (
                  <div className="pl-6 space-y-1.5">
                    {proposal.slots.map((slot) => (
                      <div key={slot.uuid} className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span className="font-medium text-gray-900">{formatDate(slot.date)}</span>
                        {slot.time_type === 'all_day' ? (
                          <span className="text-xs text-gray-500">— dia todo</span>
                        ) : (
                          <span className="text-xs text-gray-500">— {slot.start_time} às {slot.end_time}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}

              {proposal.description && (
                <div className="pt-2 border-t border-amber-100 text-sm">
                  <span className="text-gray-500">Descrição: </span>
                  <span className="text-gray-800">{proposal.description}</span>
                </div>
              )}
            </div>

            <Button onClick={openPayment} disabled={redirectingToStripe} className="w-full flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {redirectingToStripe ? 'Redirecionando para o Stripe...' : `Pagar ${formatBRL(proposal.offered_price ?? 0)}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment banner — provider waiting for contractor payment */}
      {proposal.status === 'accepted' && proposal.payment_status === 'pending_payment' && isProvider && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <p className="font-semibold text-blue-900">Aguardando pagamento do contratante</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Você aceitou a proposta. O contratante foi notificado e precisa confirmar o pagamento.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {proposal.status === 'pending' && (
        <div className="flex flex-wrap gap-3">
          {isProvider && (
            <>
              <Button
                onClick={() => { setTermsAccepted(false); setSelectedSlot(''); setAcceptOpen(true) }}
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
      <Dialog open={acceptOpen} onOpenChange={(v) => { setAcceptOpen(v); if (!v) setActionError(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Check className="h-5 w-5 text-green-600" />
              Aceitar proposta
            </DialogTitle>
            <DialogDescription>
              Revise os detalhes abaixo antes de confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Service + contractor */}
            <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Serviço</p>
                <p className="font-semibold text-gray-900 mt-0.5">{proposal.service?.title}</p>
                <p className="text-xs text-muted-foreground">{proposal.service?.category?.name}</p>
              </div>
              <div className="flex items-center gap-2.5 pt-1 border-t">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={proposal.contractor?.avatar_url} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(proposal.contractor?.first_name ?? 'C', proposal.contractor?.last_name ?? 'C')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Contratante</p>
                  <p className="text-sm font-medium">{proposal.contractor?.first_name} {proposal.contractor?.last_name}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">Você receberá</p>
                  <p className="text-base font-bold text-green-700">{formatBRL(proposal.provider_amount ?? 0)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {proposal.description && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Descrição do serviço</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{proposal.description}</p>
              </div>
            )}

            {/* Schedule */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                {proposal.schedule_type === 'specific_slots' && proposal.slots.length > 1
                  ? 'Selecione o horário de preferência'
                  : 'Agendamento'}
              </p>

              {proposal.schedule_type === 'to_be_arranged' && (
                <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  Horário já combinado entre as partes via chat.
                </div>
              )}

              {proposal.schedule_type === 'any_time_on_day' && (
                <div className="space-y-1.5">
                  {proposal.slots.map((slot) => (
                    <div key={slot.uuid} className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{formatDate(slot.date)}</span>
                      <Badge variant="outline" className="text-xs ml-auto">Qualquer horário</Badge>
                    </div>
                  ))}
                </div>
              )}

              {proposal.schedule_type === 'specific_slots' && (
                <div className="space-y-2">
                  {proposal.slots.map((slot, idx) => {
                    const isSelected = selectedSlot === slot.uuid || (proposal.slots.length === 1 && !selectedSlot)
                    return (
                      <button
                        key={slot.uuid}
                        type="button"
                        onClick={() => setSelectedSlot(slot.uuid)}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="text-left flex-1">
                          <span className="text-muted-foreground text-xs mr-2">Opção {idx + 1}</span>
                          <span className="font-medium">{formatDate(slot.date)}</span>
                        </div>
                        {slot.time_type === 'all_day' ? (
                          <Badge variant="outline" className="text-xs">Dia todo</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">{slot.start_time} – {slot.end_time}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Termos e condições</p>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                <li>Ao aceitar, você se compromete a realizar o serviço na data e horário combinados.</li>
                <li>O pagamento ficará retido pela plataforma e só será liberado após a confirmação de conclusão.</li>
                <li>Em caso de não comparecimento sem justificativa, a proposta poderá ser cancelada e o valor estornado ao contratante.</li>
              </ul>
              <label className="flex items-start gap-2.5 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary cursor-pointer"
                />
                <span className="text-sm text-gray-700 leading-snug">
                  Li e aceito os termos acima e confirmo que realizarei o serviço conforme combinado.
                </span>
              </label>
            </div>

            {actionError && <Alert variant="destructive">{actionError}</Alert>}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => acceptProposal()}
              disabled={
                accepting ||
                !termsAccepted ||
                (proposal.schedule_type === 'specific_slots' && proposal.slots.length > 1 && !selectedSlot)
              }
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {accepting ? 'Aceitando...' : 'Confirmar aceitação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
