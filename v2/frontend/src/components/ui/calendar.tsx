'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildMonthGrid(year: number, month: number): Array<{ date: Date; currentMonth: boolean }> {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const cells: Array<{ date: Date; currentMonth: boolean }> = []

  const leadingCount = firstDay.getDay()
  for (let i = leadingCount - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), currentMonth: false })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), currentMonth: true })
  }
  const trailingCount = 7 - (cells.length % 7 === 0 ? 7 : cells.length % 7)
  if (trailingCount < 7) {
    for (let d = 1; d <= trailingCount; d++) {
      cells.push({ date: new Date(year, month + 1, d), currentMonth: false })
    }
  }
  return cells
}

interface CalendarProps {
  // Single select
  value?: string
  onChange?: (date: string) => void
  // Multi select
  multiSelect?: boolean
  values?: string[]
  onMultiChange?: (dates: string[]) => void
  // Common
  disablePast?: boolean
  className?: string
}

export function Calendar({
  value,
  onChange,
  multiSelect = false,
  values,
  onMultiChange,
  disablePast = true,
  className,
}: CalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const seedDate = value
    ? new Date(value + 'T00:00:00')
    : values?.[0]
    ? new Date(values[0] + 'T00:00:00')
    : today

  const [viewYear, setViewYear] = useState(seedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(seedDate.getMonth())

  const todayStr = toLocalDateString(today)
  const cells = buildMonthGrid(viewYear, viewMonth)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  function handleDayClick(date: Date, isPast: boolean, isCurrentMonth: boolean) {
    if (isPast && disablePast) return
    const dateStr = toLocalDateString(date)
    if (!isCurrentMonth) {
      setViewYear(date.getFullYear())
      setViewMonth(date.getMonth())
    }
    if (multiSelect && onMultiChange) {
      const current = values ?? []
      onMultiChange(
        current.includes(dateStr) ? current.filter((d) => d !== dateStr) : [...current, dateStr],
      )
    } else if (onChange) {
      onChange(dateStr)
    }
  }

  return (
    <div className={cn('w-full select-none', className)}>
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900 capitalize">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map(({ date, currentMonth }, idx) => {
          const dateStr = toLocalDateString(date)
          const isPast = disablePast && date < today
          const isToday = dateStr === todayStr
          const isSelected = multiSelect
            ? (values ?? []).includes(dateStr)
            : dateStr === value

          return (
            <div key={idx} className="flex items-center justify-center py-0.5">
              <button
                type="button"
                onClick={() => handleDayClick(date, isPast, currentMonth)}
                disabled={isPast}
                aria-label={dateStr}
                aria-pressed={isSelected}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  !currentMonth && 'text-gray-300',
                  isPast && 'text-gray-300 pointer-events-none cursor-not-allowed opacity-50',
                  currentMonth && !isPast && !isSelected && !isToday && 'text-gray-800 hover:bg-gray-100',
                  isToday && !isSelected && 'ring-2 ring-primary ring-offset-1 text-primary font-semibold',
                  isSelected && 'bg-primary text-white font-semibold hover:bg-primary/90',
                )}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
