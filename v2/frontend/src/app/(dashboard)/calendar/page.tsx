'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar } from 'lucide-react'
import { ProviderCalendar, type CalendarEvent } from '@/components/calendar/ProviderCalendar'
import { Alert } from '@/components/ui/alert'
import { meApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface CalendarDayPayload {
  date?: string
  contracts?: Array<{ uuid?: string; status?: string; proposal?: { service?: { title?: string } } }>
  slots?: Array<{ date?: string }>
  blocks?: Array<{ starts_at?: string; contract_uuid?: string }>
}

const toDateOnly = (value?: string): string | null => {
  if (!value) return null
  const date = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
}

export default function CalendarPage() {
  const { user } = useAuthStore()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  if (user?.role === 'contractor') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Calendar className="h-14 w-14 text-gray-200 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Calendário não disponível</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Esta funcionalidade é exclusiva para prestadores de serviço.
        </p>
      </div>
    )
  }

  const { data: calendarData, isError } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () =>
      meApi
        .getCalendar(year, month)
        .then((r) => r.data.days as Record<string, CalendarDayPayload> | CalendarDayPayload[]),
  })

  const dayValues = Array.isArray(calendarData)
    ? calendarData
    : Object.values(calendarData ?? {})

  const events: CalendarEvent[] = dayValues.flatMap((day) => {
    const fallbackDate = toDateOnly(day.date)
    const result: CalendarEvent[] = []

    for (const contract of day.contracts ?? []) {
      const date = fallbackDate
      if (date) result.push({ date, type: 'contract', title: contract.proposal?.service?.title ?? 'Contrato', status: contract.status, contract_uuid: contract.uuid })
    }

    for (const slot of day.slots ?? []) {
      const date = toDateOnly(slot.date) ?? fallbackDate
      if (date) result.push({ date, type: 'proposal', title: 'Proposta' })
    }

    for (const block of day.blocks ?? []) {
      const date = toDateOnly(block.starts_at) ?? fallbackDate
      if (date) result.push({ date, type: 'contract', title: 'Compromisso', contract_uuid: block.contract_uuid })
    }

    return result
  })

  const handlePeriodChange = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize seus compromissos e agendamentos
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          Erro ao carregar os eventos do calendário. Tente novamente.
        </Alert>
      )}

      <ProviderCalendar events={events} onPeriodChange={handlePeriodChange} />

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Contratos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Propostas</span>
        </div>
      </div>
    </div>
  )
}
