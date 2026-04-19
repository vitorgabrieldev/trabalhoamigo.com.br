'use client'

import { use, useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  CalendarDays,
  Calendar as CalendarIcon,
  Handshake,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { servicesApi, proposalsApi } from '@/lib/api'
import type { Service, ScheduleType } from '@/types'

// ─── BRL helpers ─────────────────────────────────────────────────────────────

function parseBRLMaskedInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return (Number(digits) / 100).toFixed(2)
}

function formatBRLInput(value?: string): string {
  if (!value) return ''
  const n = Number(value)
  if (Number.isNaN(n)) return ''
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

// ─── Slot summary ─────────────────────────────────────────────────────────────

const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function formatSlotSummary(slot: {
  date: string
  start_hour: string
  start_minute: string
  end_hour: string
  end_minute: string
}): string {
  if (!slot.date) return 'sem data'
  const [, month, day] = slot.date.split('-')
  return `${parseInt(day)} de ${MONTH_SHORT[parseInt(month) - 1]} · ${slot.start_hour}:${slot.start_minute} – ${slot.end_hour}:${slot.end_minute}`
}

// ─── Hours / minutes ─────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

// ─── Zod schema ──────────────────────────────────────────────────────────────

const slotSchema = z.object({
  date: z.string(),
  start_hour: z.string(),
  start_minute: z.string(),
  end_hour: z.string(),
  end_minute: z.string(),
})

const schema = z
  .object({
    offered_price: z.string().optional(),
    description: z.string().min(1, 'Descrição é obrigatória'),
    scheduleType: z.enum(['specific_slots', 'any_time_on_day', 'to_be_arranged']),
    any_time_dates: z.array(z.string()),
    slots: z.array(slotSchema),
  })
  .superRefine((val, ctx) => {
    if (val.scheduleType === 'specific_slots') {
      if (val.slots.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['slots'], message: 'Adicione pelo menos um horário.' })
      }
      val.slots.forEach((s, i) => {
        if (!s.date) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['slots', i, 'date'], message: 'Selecione uma data.' })
        }
      })
    }
    if (val.scheduleType === 'any_time_on_day' && val.any_time_dates.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['any_time_dates'], message: 'Selecione pelo menos uma data.' })
    }
  })

type FormData = z.infer<typeof schema>

// ─── Schedule type options ────────────────────────────────────────────────────

const SCHEDULE_TYPES: Array<{ value: ScheduleType; icon: React.ReactNode; label: string; description: string }> = [
  {
    value: 'specific_slots',
    icon: <CalendarDays className="h-5 w-5" />,
    label: 'Horário específico',
    description: 'Escolha data e hora exata',
  },
  {
    value: 'any_time_on_day',
    icon: <CalendarIcon className="h-5 w-5" />,
    label: 'Qualquer horário do dia',
    description: 'Escolha os dias disponíveis',
  },
  {
    value: 'to_be_arranged',
    icon: <Handshake className="h-5 w-5" />,
    label: 'A combinar',
    description: 'Defina com o prestador depois',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProposalPage({
  params,
}: {
  params: Promise<{ service_uuid: string }>
}) {
  const { service_uuid } = use(params)
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [openSlotIndex, setOpenSlotIndex] = useState<number>(0)

  const { data: service, isLoading: loadingService, isError: serviceError } = useQuery({
    queryKey: ['service', service_uuid],
    queryFn: () => servicesApi.get(service_uuid).then((r) => r.data as Service),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      offered_price: '',
      description: '',
      scheduleType: 'specific_slots',
      any_time_dates: [],
      slots: [{ date: '', start_hour: '08', start_minute: '00', end_hour: '09', end_minute: '00' }],
    },
  })

  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({
    control,
    name: 'slots',
  })

  const scheduleType = watch('scheduleType')
  const offeredPrice = watch('offered_price')
  const anyTimeDates = watch('any_time_dates')
  const description = watch('description')
  const watchedSlots = watch('slots')

  const isFormValid = useMemo(() => {
    if (!description?.trim()) return false
    if (service?.accepts_offer && (!offeredPrice || parseFloat(offeredPrice) <= 0)) return false
    if (scheduleType === 'any_time_on_day' && anyTimeDates.length === 0) return false
    if (scheduleType === 'specific_slots') {
      if (watchedSlots.length === 0) return false
      if (watchedSlots.some((s) => !s.date)) return false
    }
    return true
  }, [description, offeredPrice, scheduleType, anyTimeDates, watchedSlots, service?.accepts_offer])

  const { mutate: submitProposal } = useMutation({
    mutationFn: async (data: FormData) => {
      const price = data.offered_price ? parseFloat(data.offered_price) : (service?.base_price ?? 0)

      if (data.scheduleType === 'to_be_arranged') {
        return proposalsApi.create(service_uuid, {
          offered_price: price,
          description: data.description,
          schedule_type: 'to_be_arranged',
        })
      }

      if (data.scheduleType === 'any_time_on_day') {
        return proposalsApi.create(service_uuid, {
          offered_price: price,
          description: data.description,
          schedule_type: 'any_time_on_day',
          any_time_dates: data.any_time_dates,
        })
      }

      return proposalsApi.create(service_uuid, {
        offered_price: price,
        description: data.description,
        schedule_type: 'specific_slots',
        slots: data.slots.map((s) => ({
          date: s.date,
          time_type: 'specific_time' as const,
          start_time: `${s.start_hour}:${s.start_minute}`,
          end_time: `${s.end_hour}:${s.end_minute}`,
        })),
      })
    },
    onSuccess: () => router.push('/proposals'),
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError = axiosErr.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors)[0]?.[0]
        : null
      setSubmitError(firstError ?? axiosErr.response?.data?.message ?? 'Erro ao enviar proposta.')
    },
  })

  if (loadingService) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (serviceError || !service) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        Serviço não encontrado ou ocorreu um erro ao carregar.
      </Alert>
    )
  }

  const providerName = `${service.provider.first_name} ${service.provider.last_name}`

  return (
    <div className="w-full pb-24 sm:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/services/${service_uuid}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fazer proposta</h1>
          <p className="text-sm text-muted-foreground">
            para <span className="font-medium text-gray-700">{service.title}</span>
          </p>
        </div>
      </div>

      {/* Service context */}
      <Card className="border-gray-200">
        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{service.title}</p>
            <p className="text-xs text-muted-foreground">por {providerName}</p>
          </div>
          {service.base_price ? (
            <p className="text-sm font-semibold text-primary whitespace-nowrap">
              R${' '}
              {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                service.base_price,
              )}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Preço a negociar</p>
          )}
        </CardContent>
      </Card>

      {submitError && <Alert variant="destructive">{submitError}</Alert>}

      {/* Form */}
      <form id="proposal-form" onSubmit={handleSubmit((data) => submitProposal(data))} className="space-y-6">
        <Tabs defaultValue="proposta" className="w-full">
          <TabsList className="h-auto w-full justify-start gap-1 flex-wrap">
            <TabsTrigger value="proposta">Proposta</TabsTrigger>
            <TabsTrigger value="agendamento">Agendamento</TabsTrigger>
          </TabsList>

          {/* ── Tab: Proposta ── */}
          <TabsContent value="proposta">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhes da proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.accepts_offer && (
                  <div>
                    <Label htmlFor="offered_price">Valor oferecido (R$)</Label>
                    <input type="hidden" {...register('offered_price')} />
                    <Input
                      id="offered_price"
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      className="mt-1"
                      value={formatBRLInput(offeredPrice)}
                      onChange={(e) =>
                        setValue('offered_price', parseBRLMaskedInput(e.target.value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Deixe vazio para aceitar o preço base do serviço.
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o que você precisa..."
                    className="mt-1 resize-none h-32"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Agendamento ── */}
          <TabsContent value="agendamento">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quando você precisa do serviço?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Schedule type cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {SCHEDULE_TYPES.map((opt) => {
                    const isActive = scheduleType === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setValue('scheduleType', opt.value, { shouldDirty: true, shouldValidate: true })
                        }
                        className={`flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                          isActive
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                        aria-pressed={isActive}
                      >
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                            isActive ? 'bg-primary/10' : 'bg-gray-100'
                          }`}
                        >
                          {opt.icon}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{opt.label}</p>
                          <p className={`text-xs mt-0.5 ${isActive ? 'text-primary/70' : 'text-muted-foreground'}`}>
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* ── specific_slots ── */}
                {scheduleType === 'specific_slots' && (
                  <div className="space-y-3">
                    {slotFields.map((field, idx) => {
                      const isAccordion = slotFields.length > 1
                      const isOpen = !isAccordion || openSlotIndex === idx
                      const slot = watchedSlots[idx]

                      return (
                        <div key={field.id} className="rounded-lg border border-gray-200 overflow-hidden">
                          {/* Accordion header — only when multiple slots */}
                          {isAccordion && (
                            <div
                              role="button"
                              aria-expanded={isOpen}
                              onClick={() => setOpenSlotIndex(isOpen ? -1 : idx)}
                              className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors ${
                                isOpen
                                  ? 'bg-gray-50 border-b border-gray-200'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm font-semibold text-gray-800 shrink-0">
                                  Opção {idx + 1}
                                </span>
                                {!isOpen && slot && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    — {formatSlotSummary(slot)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeSlot(idx)
                                    setOpenSlotIndex((prev) =>
                                      prev >= slotFields.length - 1
                                        ? Math.max(0, slotFields.length - 2)
                                        : prev,
                                    )
                                  }}
                                  className="inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors cursor-pointer"
                                  aria-label="Remover opção"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <ChevronDown
                                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                    isOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </div>
                          )}

                          {/* Slot content */}
                          {isOpen && (
                            <div className="p-4 space-y-4">
                              <div>
                                <Label className="mb-2 block">Data</Label>
                                <div className="rounded-lg border border-gray-200 bg-white p-3">
                                  <Controller
                                    control={control}
                                    name={`slots.${idx}.date`}
                                    render={({ field: f }) => (
                                      <CalendarPicker value={f.value} onChange={f.onChange} disablePast />
                                    )}
                                  />
                                </div>
                                {errors.slots?.[idx]?.date && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {errors.slots[idx]?.date?.message}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {/* Start time */}
                                <div>
                                  <Label className="mb-1.5 block text-xs text-muted-foreground">Início</Label>
                                  <div className="flex gap-1.5">
                                    <Controller
                                      control={control}
                                      name={`slots.${idx}.start_hour`}
                                      render={({ field: f }) => (
                                        <Select value={f.value} onValueChange={f.onChange}>
                                          <SelectTrigger className="cursor-pointer flex-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {HOURS.map((h) => (
                                              <SelectItem key={h} value={h} className="cursor-pointer">
                                                {h}h
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    />
                                    <Controller
                                      control={control}
                                      name={`slots.${idx}.start_minute`}
                                      render={({ field: f }) => (
                                        <Select value={f.value} onValueChange={f.onChange}>
                                          <SelectTrigger className="cursor-pointer flex-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {MINUTES.map((m) => (
                                              <SelectItem key={m} value={m} className="cursor-pointer">
                                                {m}min
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    />
                                  </div>
                                </div>

                                {/* End time */}
                                <div>
                                  <Label className="mb-1.5 block text-xs text-muted-foreground">Fim</Label>
                                  <div className="flex gap-1.5">
                                    <Controller
                                      control={control}
                                      name={`slots.${idx}.end_hour`}
                                      render={({ field: f }) => (
                                        <Select value={f.value} onValueChange={f.onChange}>
                                          <SelectTrigger className="cursor-pointer flex-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {HOURS.map((h) => (
                                              <SelectItem key={h} value={h} className="cursor-pointer">
                                                {h}h
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    />
                                    <Controller
                                      control={control}
                                      name={`slots.${idx}.end_minute`}
                                      render={({ field: f }) => (
                                        <Select value={f.value} onValueChange={f.onChange}>
                                          <SelectTrigger className="cursor-pointer flex-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {MINUTES.map((m) => (
                                              <SelectItem key={m} value={m} className="cursor-pointer">
                                                {m}min
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {slotFields.length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          appendSlot({ date: '', start_hour: '08', start_minute: '00', end_hour: '09', end_minute: '00' })
                          setOpenSlotIndex(slotFields.length)
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar outra opção
                      </button>
                    )}

                    {errors.slots && !Array.isArray(errors.slots) && (
                      <p className="text-xs text-red-500">
                        {(errors.slots as { message?: string }).message}
                      </p>
                    )}
                  </div>
                )}

                {/* ── any_time_on_day ── */}
                {scheduleType === 'any_time_on_day' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Selecione os dias disponíveis</Label>
                      {anyTimeDates.length > 0 && (
                        <span className="text-xs text-primary font-medium">
                          {anyTimeDates.length}{' '}
                          {anyTimeDates.length === 1 ? 'dia selecionado' : 'dias selecionados'}
                        </span>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 w-full">
                      <CalendarPicker
                        multiSelect
                        values={anyTimeDates}
                        onMultiChange={(dates) =>
                          setValue('any_time_dates', dates, { shouldValidate: true })
                        }
                        disablePast
                      />
                    </div>
                    {errors.any_time_dates && (
                      <p className="text-xs text-red-500 mt-1">
                        {(errors.any_time_dates as { message?: string }).message}
                      </p>
                    )}
                  </div>
                )}

                {/* ── to_be_arranged ── */}
                {scheduleType === 'to_be_arranged' && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                    <Handshake className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">
                      O horário será combinado diretamente com o prestador.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Após a proposta ser aceita, vocês poderão conversar e definir o melhor momento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Desktop actions */}
        <div className="hidden sm:flex justify-end gap-3">
          <Button type="button" variant="outline" className="min-w-[120px]" asChild>
            <Link href={`/services/${service_uuid}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={!isFormValid || isSubmitting} className="min-w-[160px]">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Enviando...
              </span>
            ) : (
              'Enviar proposta'
            )}
          </Button>
        </div>
      </form>

      {/* Mobile sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-3 border-t border-gray-200 bg-white px-4 py-3 sm:hidden">
        <Button type="button" variant="outline" className="flex-1 h-11" asChild>
          <Link href={`/services/${service_uuid}`}>Cancelar</Link>
        </Button>
        <Button
          type="button"
          disabled={!isFormValid || isSubmitting}
          className="flex-1 h-11"
          onClick={handleSubmit((data) => submitProposal(data))}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Enviando...
            </span>
          ) : (
            'Enviar proposta'
          )}
        </Button>
      </div>
    </div>
  )
}
