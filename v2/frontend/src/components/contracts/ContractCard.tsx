'use client'

import Link from 'next/link'
import { Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Contract } from '@/types'
import { formatBRL, formatDate, getInitials, statusLabel, statusColor } from '@/lib/utils'

interface ContractCardProps {
  contract: Contract
  viewAs: 'provider' | 'contractor'
}

export function ContractCard({ contract, viewAs }: ContractCardProps) {
  const otherParty = viewAs === 'provider' ? contract.contractor : contract.provider

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Service title */}
            <h3 className="font-semibold text-gray-900 truncate mb-1">
              {contract.proposal?.service?.title}
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
                {viewAs === 'provider' ? 'Contratante' : 'Prestador'}: {otherParty?.first_name} {otherParty?.last_name}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-900">{formatBRL(contract.price)}</span>
              </div>
              {contract.scheduled_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(contract.scheduled_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${statusColor(contract.status)}`}>
            {statusLabel(contract.status)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/contracts/${contract.uuid}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
