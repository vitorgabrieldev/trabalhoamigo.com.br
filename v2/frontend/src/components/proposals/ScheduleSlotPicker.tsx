'use client'

import { useState } from 'react'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ScheduleType, TimeType } from '@/types'

interface Slot {
  date: string
  time_type: TimeType
  start_time?: string
  end_time?: string
}

interface ScheduleSlotPickerProps {
  scheduleType: ScheduleType
  onScheduleTypeChange: (type: ScheduleType) => void
  slots: Slot[]
  onSlotsChange: (slots: Slot[]) => void
  anyTimeDate?: string
  onAnyTimeDateChange?: (date: string) => void
}

export function ScheduleSlotPicker({
  scheduleType,
  onScheduleTypeChange,
  slots,
  onSlotsChange,
  anyTimeDate,
  onAnyTimeDateChange,
}: ScheduleSlotPickerProps) {
  const addSlot = () => {
    onSlotsChange([...slots, { date: '', time_type: 'all_day' }])
  }

  const removeSlot = (idx: number) => {
    onSlotsChange(slots.filter((_, i) => i !== idx))
  }

  const updateSlot = (idx: number, updates: Partial<Slot>) => {
    onSlotsChange(slots.map((s, i) => (i === idx ? { ...s, ...updates } : s)))
  }

  return (
    <div className="space-y-4">
      {/* Schedule Type */}
      <div>
        <Label className="mb-1.5 block">Tipo de agendamento</Label>
        <Select value={scheduleType} onValueChange={(v) => onScheduleTypeChange(v as ScheduleType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="specific_slots">Horários específicos</SelectItem>
            <SelectItem value="any_time_on_day">Qualquer horário do dia</SelectItem>
            <SelectItem value="to_be_arranged">A combinar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Any time on day */}
      {scheduleType === 'any_time_on_day' && (
        <div>
          <Label className="mb-1.5 block">Data</Label>
          <Input
            type="date"
            value={anyTimeDate ?? ''}
            onChange={(e) => onAnyTimeDateChange?.(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      {/* Specific slots */}
      {scheduleType === 'specific_slots' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Horários propostos</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSlot}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </Button>
          </div>

          {slots.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhum horário adicionado</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addSlot}>
                Adicionar horário
              </Button>
            </div>
          )}

          {slots.map((slot, idx) => (
            <div key={idx} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Opção {idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() => removeSlot(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Data</Label>
                  <Input
                    type="date"
                    value={slot.date}
                    onChange={(e) => updateSlot(idx, { date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Tipo</Label>
                  <Select
                    value={slot.time_type}
                    onValueChange={(v) => updateSlot(idx, { time_type: v as TimeType })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_day">Dia todo</SelectItem>
                      <SelectItem value="specific_time">Horário específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {slot.time_type === 'specific_time' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Início</Label>
                    <Input
                      type="time"
                      value={slot.start_time ?? ''}
                      onChange={(e) => updateSlot(idx, { start_time: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Fim</Label>
                    <Input
                      type="time"
                      value={slot.end_time ?? ''}
                      onChange={(e) => updateSlot(idx, { end_time: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
