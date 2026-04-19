'use client'

import Link from 'next/link'
import { Calendar, CreditCard, DollarSign, Clock } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Proposal } from '@/types'
import { formatBRL, formatDate, getInitials, statusLabel, statusColor } from '@/lib/utils'

interface ProposalCardProps {
  proposal: Proposal
  viewAs: 'provider' | 'contractor'
}

export function ProposalCard({ proposal, viewAs }: ProposalCardProps) {
  const otherParty = viewAs === 'provider' ? proposal.contractor : proposal.provider
  const price = (proposal as unknown as { price?: { amount: number } }).price?.amount
  const needsPayment = viewAs === 'contractor' && proposal.status === 'accepted' && proposal.payment_status === 'pending_payment'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Service title */}
            <h3 className="font-semibold text-gray-900 truncate mb-1">
              {proposal.service?.title}
            </h3>

            {/* Other party */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={otherParty?.avatar_url} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(otherParty?.first_name ?? 'U', otherParty?.last_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {viewAs === 'provider' ? 'De' : 'Para'}: {otherParty?.first_name} {otherParty?.last_name}
              </span>
            </div>

            {/* Details row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="font-medium text-gray-900">{formatBRL(price)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="capitalize">{
                  proposal.schedule_type === 'specific_slots' ? 'Horário específico' :
                  proposal.schedule_type === 'any_time_on_day' ? 'Qualquer horário do dia' :
                  'A combinar'
                }</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(proposal.created_at)}</span>
              </div>
            </div>

            {proposal.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{proposal.description}</p>
            )}
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(proposal.status, proposal.payment_status)}`}>
              {statusLabel(proposal.status, proposal.payment_status)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2 flex-wrap">
        {needsPayment && (
          <Button size="sm" asChild className="flex items-center gap-1.5">
            <Link href={`/proposals/${proposal.uuid}`}>
              <CreditCard className="h-3.5 w-3.5" />
              Pagar agora
            </Link>
          </Button>
        )}
        <Button variant={needsPayment ? 'outline' : 'outline'} size="sm" asChild>
          <Link href={`/proposals/${proposal.uuid}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
