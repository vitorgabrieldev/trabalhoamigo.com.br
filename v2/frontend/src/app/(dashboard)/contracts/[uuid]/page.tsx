'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Star,
  MessageCircle,
  HelpCircle,
  Clock,
  CreditCard,
  User,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

const HELP_OPTIONS = [
  { id: 'no_show', label: 'O prestador não apareceu', icon: <User className="h-4 w-4" /> },
  { id: 'not_completed', label: 'O serviço não foi concluído como combinado', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'quality', label: 'Qualidade abaixo do esperado', icon: <AlertCircle className="h-4 w-4" /> },
  { id: 'payment', label: 'Problema com pagamento ou cobrança', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'other', label: 'Outro motivo', icon: <HelpCircle className="h-4 w-4" /> },
]

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeNote, setCompleteNote] = useState('')
  const [completeAgreed, setCompleteAgreed] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmNote, setConfirmNote] = useState('')
  const [confirmAgreed, setConfirmAgreed] = useState(false)

  const [helpOpen, setHelpOpen] = useState(false)
  const [helpOption, setHelpOption] = useState<string | null>(null)
  const [helpReason, setHelpReason] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
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
    mutationFn: () => contractsApi.providerComplete(uuid, completeNote),
    onSuccess: () => { invalidate(); setCompleteOpen(false); setCompleteNote(''); setCompleteAgreed(false) },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } }
      setActionError(e.response?.data?.message ?? 'Erro ao marcar como concluído.')
    },
  })

  const { mutate: confirm, isPending: confirming } = useMutation({
    mutationFn: () => contractsApi.contractorConfirm(uuid, confirmNote),
    onSuccess: () => { invalidate(); setConfirmOpen(false); setConfirmNote(''); setConfirmAgreed(false) },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } }
      setActionError(e.response?.data?.message ?? 'Erro ao confirmar conclusão.')
    },
  })

  const { mutate: openDispute, isPending: disputing } = useMutation({
    mutationFn: () => {
      const selected = HELP_OPTIONS.find((o) => o.id === helpOption)
      const fullReason = selected ? `[${selected.label}] ${helpReason}`.trim() : helpReason
      return contractsApi.dispute(uuid, fullReason)
    },
    onSuccess: () => {
      invalidate()
      setHelpOpen(false)
      setHelpOption(null)
      setHelpReason('')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } }
      setActionError(e.response?.data?.message ?? 'Erro ao enviar solicitação.')
    },
  })

  const { mutate: submitReview, isPending: reviewing } = useMutation({
    mutationFn: () => contractsApi.review(uuid, reviewStars, reviewComment || undefined),
    onSuccess: () => {
      invalidate()
      setReviewOpen(false)
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } }
      setActionError(e.response?.data?.message ?? 'Erro ao enviar avaliação.')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !contract) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        Contrato não encontrado.
      </Alert>
    )
  }

  const isProvider = user?.uuid === contract.provider?.uuid
  const isContractor = user?.uuid === contract.contractor?.uuid
  const otherParty = isProvider ? contract.contractor : contract.provider

  const canComplete = isProvider && contract.status === 'active'
  const canConfirm = isContractor && contract.status === 'provider_completed'
  const canDispute = contract.can_dispute && (isProvider || isContractor)
  const canReview = contract.can_review && (isProvider || isContractor)

  const selectedSlot = contract.proposal?.slots?.find((s) => s.is_selected) ?? contract.proposal?.slots?.[0]

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contracts"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Detalhes do contrato</h1>
      </div>

      {actionError && (
        <Alert variant="destructive" className="rounded-xl">
          {actionError}
        </Alert>
      )}

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            {contract.service?.category?.name && (
              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                {contract.service.category.name}
              </p>
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {contract.service?.title ?? contract.proposal?.uuid}
            </h2>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${statusColor(contract.status)}`}>
            {statusLabel(contract.status)}
          </span>
        </div>
        {contract.proposal?.description && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{contract.proposal.description}</p>
        )}
      </div>

      {/* Info grid */}
      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-sm">
        {/* Price */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CreditCard className="h-4 w-4" />
            <span>Valor {isProvider ? 'a receber' : 'pago'}</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{formatBRL(contract.price?.amount)}</span>
        </div>

        {/* Payment confirmed */}
        {contract.payment?.paid_at && (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Pagamento confirmado</span>
            </div>
            <span className="text-xs text-gray-600">{formatDateTime(contract.payment.paid_at)}</span>
          </div>
        )}

        {/* Scheduled */}
        {selectedSlot ? (
          <div className="flex items-start justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Agendamento</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {selectedSlot.start_time && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedSlot.start_time}
                  {selectedSlot.end_time ? ` – ${selectedSlot.end_time}` : ''}
                </p>
              )}
            </div>
          </div>
        ) : contract.scheduled_at ? (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Agendado para</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{formatDate(contract.scheduled_at)}</span>
          </div>
        ) : null}

        {/* Acceptance */}
        {contract.proposal?.provider_terms_accepted_at && (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4" />
              <span>Proposta aceita em</span>
            </div>
            <span className="text-xs text-gray-600">{formatDateTime(contract.proposal.provider_terms_accepted_at)}</span>
          </div>
        )}

        {/* Contract created */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Contrato criado em</span>
          </div>
          <span className="text-xs text-gray-600">{formatDateTime(contract.created_at)}</span>
        </div>

        {/* Provider completed */}
        {contract.provider_completed_at && (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase className="h-4 w-4 text-orange-500" />
              <span>Serviço concluído pelo prestador</span>
            </div>
            <span className="text-xs text-gray-600">{formatDateTime(contract.provider_completed_at)}</span>
          </div>
        )}

        {/* Contractor confirmed */}
        {contract.contractor_confirmed_at && (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Conclusão confirmada</span>
            </div>
            <span className="text-xs text-gray-600">{formatDateTime(contract.contractor_confirmed_at)}</span>
          </div>
        )}

        {/* Auto release warning */}
        {contract.auto_release_at && contract.status === 'provider_completed' && (
          <div className="px-5 py-4 bg-amber-50">
            <p className="text-xs text-amber-700">
              Se não confirmado, o pagamento será liberado automaticamente em{' '}
              <span className="font-semibold">{formatDateTime(contract.auto_release_at)}</span>.
            </p>
          </div>
        )}

        {/* Active dispute */}
        {contract.dispute && (
          <div className="px-5 py-4 bg-red-50">
            <p className="text-xs font-medium text-red-600 mb-1">Solicitação de suporte aberta</p>
            {contract.dispute.reason && (
              <p className="text-sm text-red-700">{contract.dispute.reason}</p>
            )}
            <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {contract.dispute.status}
            </span>
          </div>
        )}
      </div>

      {/* Other party */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {isProvider ? 'Contratante' : 'Prestador'}
        </p>
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-11 w-11">
            <AvatarImage src={otherParty?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(otherParty?.first_name ?? 'U', otherParty?.last_name ?? 'U')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">
              {otherParty?.first_name} {otherParty?.last_name}
            </p>
            {otherParty?.email && (
              <p className="text-xs text-muted-foreground">{otherParty.email}</p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={contract.conversation_uuid ? `/conversations/${contract.conversation_uuid}` : '/conversations'}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Abrir conversa
          </Link>
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {canComplete && (
          <Button onClick={() => setCompleteOpen(true)} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar serviço como concluído
          </Button>
        )}
        {canConfirm && (
          <Button onClick={() => setConfirmOpen(true)} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar que o serviço foi concluído
          </Button>
        )}
        {canReview && (
          <Button variant="outline" onClick={() => setReviewOpen(true)} className="w-full">
            <Star className="h-4 w-4 mr-2" />
            Avaliar serviço
          </Button>
        )}
        {canDispute && (
          <Button variant="outline" onClick={() => setHelpOpen(true)} className="w-full text-gray-600 border-dashed">
            <HelpCircle className="h-4 w-4 mr-2" />
            Precisa de ajuda?
          </Button>
        )}
      </div>

      {/* Provider complete modal */}
      <Dialog open={completeOpen} onOpenChange={(o) => { setCompleteOpen(o); if (!o) { setCompleteNote(''); setCompleteAgreed(false) } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar conclusão do serviço</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O contratante será notificado para confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="complete_note">
                Serviço finalizado <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="complete_note"
                placeholder="Descreva o que foi realizado no serviço (mínimo 10 caracteres)..."
                rows={4}
                value={completeNote}
                onChange={(e) => setCompleteNote(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">{completeNote.length}/1000 caracteres</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={completeAgreed}
                onChange={(e) => setCompleteAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm text-gray-600 leading-snug">
                Confirmo que o serviço foi concluído e estou ciente de que esta ação <strong>não pode ser desfeita</strong>.
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => complete()}
              disabled={completing || !completeAgreed || completeNote.trim().length < 10}
            >
              {completing ? 'Enviando...' : 'Confirmar conclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contractor confirm modal */}
      <Dialog open={confirmOpen} onOpenChange={(o) => { setConfirmOpen(o); if (!o) { setConfirmNote(''); setConfirmAgreed(false) } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar recebimento do serviço</DialogTitle>
            <DialogDescription>
              Ao confirmar, o pagamento será liberado ao prestador. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirm_note">
                Serviço finalizado <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="confirm_note"
                placeholder="Descreva sua experiência e o que foi entregue (mínimo 10 caracteres)..."
                rows={4}
                value={confirmNote}
                onChange={(e) => setConfirmNote(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">{confirmNote.length}/1000 caracteres</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmAgreed}
                onChange={(e) => setConfirmAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary"
              />
              <span className="text-sm text-gray-600 leading-snug">
                Confirmo que o serviço foi entregue conforme combinado e autorizo a liberação do pagamento ao prestador. Esta ação <strong>não pode ser desfeita</strong>.
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => confirm()}
              disabled={confirming || !confirmAgreed || confirmNote.trim().length < 10}
            >
              {confirming ? 'Confirmando...' : 'Liberar pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help / Dispute dialog */}
      <Dialog open={helpOpen} onOpenChange={(o) => { setHelpOpen(o); if (!o) { setHelpOption(null); setHelpReason('') } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Como podemos ajudar?</DialogTitle>
            <DialogDescription>
              Selecione o motivo da sua solicitação e nossa equipe entrará em contato.
            </DialogDescription>
          </DialogHeader>

          {!helpOption ? (
            <div className="space-y-2">
              {HELP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setHelpOption(opt.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-800">
                    <span className="text-gray-400">{opt.icon}</span>
                    {opt.label}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setHelpOption(null)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-3 w-3" /> Voltar
              </button>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {HELP_OPTIONS.find((o) => o.id === helpOption)?.icon}
                {HELP_OPTIONS.find((o) => o.id === helpOption)?.label}
              </div>
              <div>
                <Label htmlFor="help_reason">
                  Descreva o que aconteceu <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="help_reason"
                  placeholder="Forneça detalhes para agilizar o atendimento (mínimo 20 caracteres)..."
                  rows={4}
                  value={helpReason}
                  onChange={(e) => setHelpReason(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">{helpReason.length}/2000 caracteres</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setHelpOpen(false)}>Cancelar</Button>
                <Button onClick={() => openDispute()} disabled={disputing || helpReason.trim().length < 20}>
                  {disputing ? 'Enviando...' : 'Enviar solicitação'}
                </Button>
              </DialogFooter>
            </div>
          )}
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
                  <button key={s} type="button" onClick={() => setReviewStars(s)} className="p-1">
                    <Star className={`h-6 w-6 ${s <= reviewStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
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
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancelar</Button>
            <Button onClick={() => submitReview()} disabled={reviewing}>
              {reviewing ? 'Enviando...' : 'Enviar avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
