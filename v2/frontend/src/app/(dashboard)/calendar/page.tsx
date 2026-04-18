'use client'

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProviderCalendar } from '@/components/calendar/ProviderCalendar'
import { Alert } from '@/components/ui/alert'
import { meApi } from '@/lib/api'
import type { CalendarEvent } from '@/types'
import { useState } from 'react'

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { data: calendarData, isError } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => meApi.getCalendar(year, month).then((r) => r.data.days as CalendarEvent[]),
  })

  // Map CalendarEvent to the format expected by ProviderCalendar
  const events = (Array.isArray(calendarData) ? calendarData : []).flatMap((ce) => [
    ...ce.contracts.map((c) => ({
      date: ce.date,
      type: 'contract' as const,
      title: c.proposal?.service?.title ?? 'Contrato',
      status: c.status,
    })),
    ...ce.slots.map((s) => ({
      date: s.date,
      type: 'proposal' as const,
      title: 'Proposta',
    })),
  ])

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y)
    setMonth(m)
  }, [])

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

      <ProviderCalendar events={events} onMonthChange={handleMonthChange} />

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
