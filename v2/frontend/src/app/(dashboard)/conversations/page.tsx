'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { MessageCircle, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { messagingApi } from '@/lib/api'
import { formatDateTime, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import type { Conversation } from '@/types'

export default function ConversationsPage() {
  const { user } = useAuthStore()
  const isProvider = user?.role === 'provider'

  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.listConversations().then((r) => r.data.data as Conversation[]),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isProvider ? 'Suas conversas com contratantes' : 'Suas conversas com prestadores'}
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">Erro ao carregar conversas. Tente novamente.</Alert>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 border rounded-xl">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && conversations && conversations.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Não há nada aqui :\</p>
          <p className="text-sm text-muted-foreground mt-1">
            Quando você fizer ou receber propostas, as conversas aparecerão aqui
          </p>
        </div>
      )}

      {!isLoading && conversations && conversations.length > 0 && (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <Link
              key={conv.uuid}
              href={`/conversations/${conv.uuid}`}
              className="flex items-center gap-4 p-4 rounded-xl border hover:bg-gray-50 transition-colors group"
            >
              <div className="relative">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={conv.other_party?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(
                      conv.other_party?.first_name ?? 'U',
                      conv.other_party?.last_name ?? 'U',
                    )}
                  </AvatarFallback>
                </Avatar>
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                    {conv.other_party?.first_name} {conv.other_party?.last_name}
                  </p>
                  {conv.last_message_at && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(conv.last_message_at)}
                    </span>
                  )}
                </div>
                {conv.last_message && (
                  <p className={`text-sm truncate mt-0.5 ${conv.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-muted-foreground'}`}>
                    {conv.last_message.body}
                  </p>
                )}
                {conv.unread_count > 0 && (
                  <Badge className="mt-1 text-xs" variant="default">
                    {conv.unread_count} nova{conv.unread_count > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
