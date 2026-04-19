'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface CalendarEvent {
  date: string
  type: 'proposal' | 'contract'
  title: string
  status?: string
  contract_uuid?: string
}

type View = 'month' | 'week' | 'year'

interface ProviderCalendarProps {
  events?: CalendarEvent[]
  onPeriodChange?: (year: number, month: number) => void
}

export function ProviderCalendar({ events = [], onPeriodChange }: ProviderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>('month')
  const router = useRouter()

  const handleEventClick = (event: CalendarEvent) => {
    if (event.contract_uuid) router.push(`/contracts/${event.contract_uuid}`)
  }

  const navigate = (direction: 'prev' | 'next') => {
    let newDate: Date
    if (view === 'month') {
      newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
    } else if (view === 'week') {
      newDate = direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1)
    } else {
      newDate = direction === 'prev' ? subYears(currentDate, 1) : addYears(currentDate, 1)
    }
    setCurrentDate(newDate)
    onPeriodChange?.(newDate.getFullYear(), newDate.getMonth() + 1)
  }

  const getTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: ptBR })
    }
    if (view === 'week') {
      const wStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const wEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (wStart.getMonth() === wEnd.getMonth()) {
        return `${format(wStart, 'd')} – ${format(wEnd, 'd')} de ${format(wStart, 'MMMM yyyy', { locale: ptBR })}`
      }
      return `${format(wStart, "d 'de' MMM", { locale: ptBR })} – ${format(wEnd, "d 'de' MMM yyyy", { locale: ptBR })}`
    }
    return format(currentDate, 'yyyy')
  }

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day))

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Month view data
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd })

  // Week view data
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDaysArr = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Year view data
  const yearMonths = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1))

  const renderMonthView = () => (
    <>
      <div className="grid grid-cols-7 border-b">
        {weekDayLabels.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())
          return (
            <div
              key={idx}
              className={cn(
                'min-h-20 p-1 border-b border-r',
                !isCurrentMonth && 'bg-gray-50',
                idx % 7 === 6 && 'border-r-0',
              )}
            >
              <div className={cn(
                'w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1',
                isToday && 'bg-primary text-white font-semibold',
                !isToday && isCurrentMonth && 'text-gray-900',
                !isCurrentMonth && 'text-gray-400',
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event, eIdx) => (
                  <div
                    key={eIdx}
                    onClick={() => handleEventClick(event)}
                    className={cn(
                      'text-xs px-1 py-0.5 rounded truncate',
                      event.type === 'contract' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
                      event.contract_uuid && 'cursor-pointer',
                    )}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} mais</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )

  const renderWeekView = () => (
    <div className="grid grid-cols-7 divide-x">
      {weekDaysArr.map((day, idx) => {
        const dayEvents = getEventsForDay(day)
        const isToday = isSameDay(day, new Date())
        return (
          <div key={idx} className="flex flex-col min-h-80">
            <div className={cn(
              'flex flex-col items-center py-3 border-b',
              isToday && 'bg-primary/5',
            )}>
              <span className="text-xs font-medium text-gray-500 uppercase">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <div className={cn(
                'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mt-1',
                isToday ? 'bg-primary text-white' : 'text-gray-800',
              )}>
                {format(day, 'd')}
              </div>
            </div>
            <div className="flex-1 p-1 space-y-1">
              {dayEvents.length === 0 && (
                <div className="h-full" />
              )}
              {dayEvents.map((event, eIdx) => (
                <div
                  key={eIdx}
                  onClick={() => handleEventClick(event)}
                  className={cn(
                    'text-xs px-1.5 py-1 rounded truncate',
                    event.type === 'contract' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
                    event.contract_uuid && 'cursor-pointer',
                  )}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderYearView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {yearMonths.map((monthDate, mIdx) => {
        const mStart = startOfMonth(monthDate)
        const mEnd = endOfMonth(monthDate)
        const mGridStart = startOfWeek(mStart, { weekStartsOn: 0 })
        const mGridEnd = endOfWeek(mEnd, { weekStartsOn: 0 })
        const mDays = eachDayOfInterval({ start: mGridStart, end: mGridEnd })
        const isThisMonth = isSameMonth(monthDate, new Date()) && currentDate.getFullYear() === new Date().getFullYear()

        return (
          <div
            key={mIdx}
            className="cursor-pointer rounded-lg border p-2 hover:bg-gray-50 transition-colors"
            onClick={() => {
              setCurrentDate(monthDate)
              setView('month')
              onPeriodChange?.(monthDate.getFullYear(), monthDate.getMonth() + 1)
            }}
          >
            <p className={cn(
              'text-xs font-semibold capitalize text-center mb-2',
              isThisMonth ? 'text-primary' : 'text-gray-700',
            )}>
              {format(monthDate, 'MMMM', { locale: ptBR })}
            </p>
            <div className="grid grid-cols-7">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-[9px] text-center text-gray-400 pb-0.5">{d}</div>
              ))}
              {mDays.map((day, dIdx) => {
                const hasEvents = events.some((e) => isSameDay(new Date(e.date), day))
                const isInMonth = isSameMonth(day, monthDate)
                const isDayToday = isSameDay(day, new Date())
                return (
                  <div key={dIdx} className="flex flex-col items-center mb-0.5">
                    <div className={cn(
                      'text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none',
                      !isInMonth && 'text-gray-300',
                      isInMonth && !isDayToday && 'text-gray-600',
                      isDayToday && 'bg-primary text-white font-bold',
                    )}>
                      {format(day, 'd')}
                    </div>
                    {hasEvents && isInMonth && (
                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b gap-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold text-gray-900 capitalize min-w-45 text-center text-sm sm:text-base">
            {getTitle()}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center rounded-lg border bg-gray-50 p-0.5">
          {(['month', 'week', 'year'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'year' && renderYearView()}
    </div>
  )
}
