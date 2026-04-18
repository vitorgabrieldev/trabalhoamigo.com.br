'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { messagingApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { formatDateTime, getInitials } from '@/lib/utils'
import type { Message } from '@/types'

export default function ConversationPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading, isError } = useQuery({
    queryKey: ['messages', uuid],
    queryFn: () => messagingApi.getMessages(uuid).then((r) => r.data.data as Message[]),
    refetchInterval: 5000,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: () => messagingApi.sendMessage(uuid, message),
    onSuccess: () => {
      setMessage('')
      setSendError(null)
      queryClient.invalidateQueries({ queryKey: ['messages', uuid] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setSendError(axiosErr.response?.data?.message ?? 'Erro ao enviar mensagem.')
    },
  })

  const handleSend = () => {
    if (!message.trim()) return
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/conversations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Conversa</h1>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {isError && (
          <Alert variant="destructive">Erro ao carregar mensagens.</Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-12 w-48 rounded-xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isOwn = msg.sender?.uuid === user?.uuid
            return (
              <div
                key={msg.uuid}
                className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={msg.sender?.avatar_url} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(
                      msg.sender?.first_name ?? 'U',
                      msg.sender?.last_name ?? 'U',
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.body}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatDateTime(msg.created_at)}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Não há nada aqui :\
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-3 border-t">
        {sendError && (
          <p className="text-xs text-red-500 mb-2">{sendError}</p>
        )}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Digite uma mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
