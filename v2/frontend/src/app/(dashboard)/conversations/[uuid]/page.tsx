'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Send, Paperclip, X, FileText, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Lightbox } from '@/components/ui/lightbox'
import { messagingApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { getInitials } from '@/lib/utils'
import type { Message, MessageMedia } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LINK_PATTERN = /(\b(?:https?:\/\/|www\.)\S+[^\s.,;:!?)"'\]])|(\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b)|(\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)(?:9\s?)?\d{4}[-\s]?\d{4}\b)/gi

function parseMessageText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let last = 0
  const regex = new RegExp(LINK_PATTERN.source, 'gi')
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const raw = match[0]
    const isEmail = /^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(raw)
    const isPhone = /^[\d\s\-+()]+$/.test(raw.replace(/\s/g, ''))
    let href: string
    if (isEmail) {
      href = `mailto:${raw}`
    } else if (isPhone) {
      href = `tel:${raw.replace(/\D/g, '')}`
    } else {
      href = raw.startsWith('http') ? raw : `https://${raw}`
    }
    parts.push(
      <a
        key={match.index}
        href={href}
        target={isEmail || isPhone ? '_self' : '_blank'}
        rel="noopener noreferrer"
        className="underline underline-offset-2 break-all"
      >
        {raw}
      </a>,
    )
    last = match.index + raw.length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function formatMsgTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return `Ontem ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Media grid ───────────────────────────────────────────────────────────────

function MediaGrid({
  items,
  onImageClick,
}: {
  items: MessageMedia[]
  onImageClick: (idx: number) => void
}) {
  const images = items.filter((m) => m.type === 'image')
  const n = images.length

  if (n === 1) {
    return (
      <button
        type="button"
        onClick={() => onImageClick(0)}
        className="relative block overflow-hidden rounded-xl cursor-zoom-in max-w-[260px]"
      >
        <Image
          src={images[0].url}
          alt=""
          width={260}
          height={200}
          unoptimized
          className="object-cover w-full h-auto max-h-[220px]"
        />
      </button>
    )
  }

  const cols = n === 2 ? 'grid-cols-2' : 'grid-cols-2'
  const visible = images.slice(0, 4)
  const overflow = n - 4

  if (n === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden w-[240px]">
        <button type="button" onClick={() => onImageClick(0)} className="cursor-zoom-in row-span-2">
          <Image src={visible[0].url} alt="" width={120} height={180} unoptimized className="w-full h-full object-cover" />
        </button>
        <button type="button" onClick={() => onImageClick(1)} className="cursor-zoom-in">
          <Image src={visible[1].url} alt="" width={120} height={89} unoptimized className="w-full h-full object-cover" />
        </button>
        <button type="button" onClick={() => onImageClick(2)} className="cursor-zoom-in">
          <Image src={visible[2].url} alt="" width={120} height={89} unoptimized className="w-full h-full object-cover" />
        </button>
      </div>
    )
  }

  return (
    <div className={`grid ${cols} gap-0.5 rounded-xl overflow-hidden w-[240px]`}>
      {visible.map((img, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onImageClick(i)}
          className="relative cursor-zoom-in h-[118px]"
        >
          <Image src={img.url} alt="" fill unoptimized className="object-cover" />
          {i === 3 && overflow > 0 && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="text-white text-xl font-bold">+{overflow + 1}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Document item ────────────────────────────────────────────────────────────

function DocumentItem({ item }: { item: MessageMedia }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      download={item.name}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-black/10 hover:bg-black/20 transition-colors min-w-[180px] max-w-[260px]"
    >
      <div className="h-9 w-9 rounded-lg bg-white/30 flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{item.name ?? 'Arquivo'}</p>
        <p className="text-[10px] opacity-70">Toque para baixar</p>
      </div>
    </a>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onImageClick,
}: {
  msg: Message
  onImageClick: (images: string[], idx: number) => void
}) {
  const isOwn = msg.sender.is_me
  const images = msg.media?.filter((m) => m.type === 'image') ?? []
  const videos = msg.media?.filter((m) => m.type === 'video') ?? []
  const docs = msg.media?.filter((m) => m.type === 'document') ?? []
  const hasMedia = (msg.media?.length ?? 0) > 0
  const hasText = !!msg.body?.trim()

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-7 w-7 shrink-0 mb-1">
        <AvatarImage src={msg.sender.avatar_url} />
        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
          {getInitials(msg.sender.first_name, msg.sender.last_name)}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[72%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Image grid */}
        {images.length > 0 && (
          <div
            className={`overflow-hidden rounded-xl ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
          >
            <MediaGrid
              items={images}
              onImageClick={(i) => onImageClick(images.map((m) => m.url), i)}
            />
          </div>
        )}

        {/* Videos */}
        {videos.map((v, i) => (
          <div
            key={i}
            className={`rounded-xl overflow-hidden max-w-[260px] relative ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
          >
            <video
              src={v.url}
              controls
              className="w-full max-h-[220px] rounded-xl"
              preload="metadata"
            />
          </div>
        ))}

        {/* Documents */}
        {docs.map((d, i) => (
          <div
            key={i}
            className={`${isOwn ? 'text-white' : 'text-gray-900'}`}
          >
            <DocumentItem item={d} />
          </div>
        ))}

        {/* Text bubble */}
        {hasText && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm break-words whitespace-pre-wrap ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-sm'
            }`}
          >
            {parseMessageText(msg.body!)}
          </div>
        )}

        <span className="text-[10px] text-muted-foreground px-1">
          {formatMsgTime(msg.created_at)}
        </span>
      </div>
    </div>
  )
}

// ─── Pending file preview ─────────────────────────────────────────────────────

function PendingFilePreview({
  files,
  onRemove,
}: {
  files: File[]
  onRemove: (i: number) => void
}) {
  if (files.length === 0) return null
  return (
    <div className="flex gap-2 flex-wrap px-1 pb-2">
      {files.map((file, i) => (
        <div key={i} className="relative group">
          {file.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="h-16 w-16 object-cover rounded-lg border"
            />
          ) : file.type.startsWith('video/') ? (
            <div className="h-16 w-16 bg-gray-800 rounded-lg flex items-center justify-center border">
              <Play className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="h-16 w-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center border gap-1">
              <FileText className="h-6 w-6 text-gray-400" />
              <span className="text-[9px] text-gray-500 px-1 truncate w-full text-center leading-tight">
                {file.name}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer"
            aria-label="Remover"
          >
            <X className="h-2.5 w-2.5 text-white" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConversationPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = use(params)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [body, setBody] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [sendError, setSendError] = useState<string | null>(null)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use conversations cache for other_party name
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.listConversations().then((r) => r.data.data),
    staleTime: 5 * 60_000,
  })
  const convInfo = conversations?.find((c: { uuid: string }) => c.uuid === uuid)

  const { data: messages, isLoading, isError } = useQuery({
    queryKey: ['messages', uuid],
    queryFn: () => messagingApi.getMessages(uuid).then((r) => r.data.data as Message[]),
    refetchInterval: 5_000,
  })

  // Derive other_party name from messages if not in cache yet
  const otherSender = messages?.find((m) => !m.sender.is_me)?.sender
  const otherName = convInfo
    ? `${convInfo.other_party.first_name} ${convInfo.other_party.last_name}`
    : otherSender
    ? `${otherSender.first_name} ${otherSender.last_name}`
    : null

  const otherAvatar = convInfo?.other_party.avatar_url ?? otherSender?.avatar_url

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: () => messagingApi.sendMessage(uuid, body, pendingFiles.length > 0 ? pendingFiles : undefined),
    onSuccess: () => {
      setBody('')
      setPendingFiles([])
      setSendError(null)
      queryClient.invalidateQueries({ queryKey: ['messages', uuid] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      focusInput()
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setSendError(axiosErr.response?.data?.message ?? 'Erro ao enviar mensagem.')
      focusInput()
    },
  })

  const canSend = body.trim().length > 0 || pendingFiles.length > 0

  const handleSend = () => {
    if (!canSend || sending) return
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setPendingFiles((prev) => [...prev, ...files].slice(0, 5))
    e.target.value = ''
    focusInput()
  }

  const openLightbox = (images: string[], idx: number) => {
    setLightboxImages(images)
    setLightboxIndex(idx)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex items-center gap-3 py-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/conversations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {otherName
                ? getInitials(otherName.split(' ')[0], otherName.split(' ')[1] ?? '')
                : '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {otherName ?? 'Carregando...'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'provider' ? 'Contratante' : 'Prestador'}
            </p>
          </div>
        </div>

        {/* Proposal banner */}
        {convInfo?.service_title && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 border-t text-sm">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium leading-none mb-0.5">Proposta</p>
              <p className="font-medium text-gray-900 truncate">{convInfo.service_title}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 text-xs h-7">
              <Link href={`/proposals/${convInfo.proposal_uuid}`}>
                Ver proposta
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1">
        {isError && <Alert variant="destructive">Erro ao carregar mensagens.</Alert>}

        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Diga olá!
          </div>
        ) : (
          messages?.map((msg) => (
            <MessageBubble key={msg.uuid} msg={msg} onImageClick={openLightbox} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-2 border-t bg-white">
        {sendError && <p className="text-xs text-red-500 mb-1.5">{sendError}</p>}

        <PendingFilePreview
          files={pendingFiles}
          onRemove={(i) => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
        />

        <div className="flex items-end gap-2">
          {/* File picker */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Anexar arquivo"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            className="hidden"
            onChange={handleFiles}
          />

          {/* Text input */}
          <Textarea
            ref={inputRef}
            placeholder="Digite uma mensagem..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            rows={1}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none py-2.5 text-sm"
          />

          {/* Send */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !canSend}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          alt="Imagem"
          onClose={() => setLightboxImages([])}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
