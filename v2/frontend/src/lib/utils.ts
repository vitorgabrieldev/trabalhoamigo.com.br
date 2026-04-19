import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number | string | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value ?? 0))
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...opts,
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function statusLabel(status: string, paymentStatus?: string | null): string {
  if (status === 'accepted' && paymentStatus === 'pending_payment') {
    return 'Aceito · Pagamento pendente'
  }
  const labels: Record<string, string> = {
    pending: 'Pendente',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado',
    active: 'Em andamento',
    provider_completed: 'Aguardando confirmação',
    contractor_confirmed: 'Concluído',
    auto_completed: 'Concluído automaticamente',
    disputed: 'Em disputa',
    payment_held: 'Aguardando pagamento',
  }
  return labels[status] ?? status
}

export function statusColor(status: string, paymentStatus?: string | null): string {
  if (status === 'accepted' && paymentStatus === 'pending_payment') {
    return 'bg-amber-100 text-amber-800'
  }
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    provider_completed: 'bg-orange-100 text-orange-800',
    contractor_confirmed: 'bg-green-100 text-green-800',
    auto_completed: 'bg-green-100 text-green-800',
    disputed: 'bg-red-100 text-red-800',
    payment_held: 'bg-amber-100 text-amber-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}
