'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, XCircle, FileText, CalendarCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { proposalsApi } from '@/lib/api'
import { formatBRL } from '@/lib/utils'
import type { Proposal } from '@/types'

export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const called = useRef(false)

  useEffect(() => {
    if (!sessionId || called.current) return
    called.current = true

    proposalsApi.pay(uuid, sessionId)
      .then((res) => {
        setProposal(res.data?.data ?? res.data ?? null)
        setStatus('success')
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message ?? 'Erro ao confirmar pagamento.')
        setStatus('error')
      })
  }, [uuid, sessionId])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-600 font-medium">Confirmando seu pagamento...</p>
        <p className="text-xs text-gray-400">Isso pode levar alguns segundos</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center max-w-sm mx-auto px-4">
        <div className="rounded-full bg-red-100 p-5">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Erro ao confirmar</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{errorMsg}</p>
        <Button variant="outline" onClick={() => router.push(`/proposals/${uuid}`)}>
          Voltar à proposta
        </Button>
      </div>
    )
  }

  const selectedSlot = proposal?.slots?.find((s) => s.is_selected) ?? proposal?.slots?.[0]
  const serviceTitle = proposal?.service?.title
  const amount = proposal?.offered_price
  const contractUuid = proposal?.contract_uuid

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="rounded-full bg-green-100 p-6 mb-5 shadow-sm">
            <CheckCircle className="h-16 w-16 text-green-500" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamento confirmado!</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs">
            Seu pagamento foi processado com sucesso. O prestador já foi notificado e o serviço está pronto para começar.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-sm mb-6">
          {serviceTitle && (
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-gray-500">Serviço</span>
              <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%] truncate">{serviceTitle}</span>
            </div>
          )}

          {amount != null && (
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-gray-500">Valor pago</span>
              <span className="text-sm font-semibold text-green-700">{formatBRL(amount)}</span>
            </div>
          )}

          {selectedSlot && (
            <div className="flex items-start justify-between px-5 py-4">
              <span className="text-sm text-gray-500">Agendamento</span>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
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
          )}

          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-500">Status do contrato</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              <CalendarCheck className="h-3.5 w-3.5" />
              Ativo
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {contractUuid && (
            <Button
              className="w-full gap-2"
              onClick={() => router.push(`/contracts/${contractUuid}`)}
            >
              <FileText className="h-4 w-4" />
              Ver contrato
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/contracts')}
          >
            Ver todos os contratos
          </Button>
        </div>
      </div>
    </div>
  )
}
