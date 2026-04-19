'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { messagingApi } from '@/lib/api'
import { getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import type { Conversation } from '@/types'

function formatConvTime(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) {
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()]
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function ConversationsPage() {
  const { user } = useAuthStore()
  const isProvider = user?.role === 'provider'

  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.listConversations().then((r) => r.data.data as Conversation[]),
  })

  return (
    <div className="space-y-4">
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
        <div className="bg-white rounded-xl border divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <Skeleton className="h-11 w-11 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && conversations?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl">
          <MessageCircle className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-600 font-medium">Nenhuma conversa ainda</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Quando você fizer ou receber uma proposta, a conversa aparecerá aqui.
          </p>
        </div>
      )}

      {!isLoading && conversations && conversations.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden divide-y divide-gray-100">
          {conversations.map((conv) => {
            const name = `${conv.other_party?.first_name ?? ''} ${conv.other_party?.last_name ?? ''}`.trim()
            const hasUnread = conv.unread_count > 0

            return (
              <Link
                key={conv.uuid}
                href={`/conversations/${conv.uuid}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {/* Avatar with unread dot */}
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={conv.other_party?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {getInitials(
                        conv.other_party?.first_name ?? 'U',
                        conv.other_party?.last_name ?? 'U',
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {name || 'Usuário'}
                    </p>
                    {conv.last_message_at && (
                      <span className={`text-xs shrink-0 ${hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {formatConvTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>

                  {conv.service_title && (
                    <p className="text-[11px] text-primary/80 font-medium truncate leading-tight mt-0.5">
                      {conv.service_title}
                    </p>
                  )}

                  <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-800 font-medium' : 'text-muted-foreground'}`}>
                    {conv.last_message
                      ? conv.last_message.body?.trim()
                        || (conv.last_message.media?.[0]?.type === 'image' ? '📷 Imagem'
                          : conv.last_message.media?.[0]?.type === 'video' ? '🎬 Vídeo'
                          : conv.last_message.media?.[0] ? '📄 Arquivo'
                          : '')
                      : <span className="italic">Envie a primeira mensagem...</span>}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
