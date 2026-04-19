'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { meApi } from '@/lib/api'
import type { StripeStatus } from '@/types'

const onlyDigits = (value: string) => value.replace(/\D+/g, '')

const formatCpfCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14)

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
}

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 13)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  if (digits.length <= 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`
  }

  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
}

const formatPixKey = (value: string) => {
  const trimmed = value.trimStart()

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase().slice(0, 120)
  }

  const digits = onlyDigits(trimmed)

  if (digits.length === 11 || digits.length === 14) {
    return formatCpfCnpj(digits)
  }

  if (digits.length >= 10 && digits.length <= 13) {
    return formatPhone(digits)
  }

  return trimmed.slice(0, 120)
}

const formatHolderName = (value: string) =>
  value
    .replace(/[^A-Za-zÀ-ÿ\s'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, 120)
    .toUpperCase()

const formatBankName = (value: string) =>
  value
    .replace(/[^A-Za-zÀ-ÿ0-9\s.&'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, 120)
    .toUpperCase()

const formatDigits = (value: string, max: number) => onlyDigits(value).slice(0, max)

const formatAlphaNumericX = (value: string, max: number) =>
  value
    .toUpperCase()
    .replace(/[^0-9X]/g, '')
    .slice(0, max)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isValidPixKey = (value?: string) => {
  const normalized = (value ?? '').trim()
  if (!normalized) return true

  const digits = onlyDigits(normalized)
  const isCpfOrCnpj = digits.length === 11 || digits.length === 14
  const isPhone = digits.length >= 10 && digits.length <= 13
  const isEmail = emailRegex.test(normalized)
  const isUuid = uuidRegex.test(normalized)

  return isCpfOrCnpj || isPhone || isEmail || isUuid
}

const schema = z.object({
  bank_holder_name: z
    .string()
    .min(3, 'Nome do titular é obrigatório')
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, 'Use apenas letras e espaços'),
  bank_holder_document: z
    .string()
    .min(1, 'Informe CPF/CNPJ')
    .refine((value) => {
      const digits = onlyDigits(value)
      return digits.length === 11 || digits.length === 14
    }, 'Informe CPF/CNPJ válido'),
  bank_name: z
    .string()
    .min(2, 'Banco é obrigatório')
    .regex(/^[A-Za-zÀ-ÿ0-9\s.&'-]+$/, 'Nome do banco inválido'),
  bank_code: z
    .string()
    .refine((value) => onlyDigits(value).length === 3, 'Use 3 dígitos (ex: 001)'),
  bank_agency: z
    .string()
    .refine((value) => {
      const length = onlyDigits(value).length
      return length >= 1 && length <= 10
    }, 'Agência inválida'),
  bank_agency_digit: z
    .string()
    .optional()
    .refine((value) => !value || /^[0-9Xx]{1,4}$/.test(value), 'Dígito inválido'),
  bank_account_number: z
    .string()
    .refine((value) => {
      const length = onlyDigits(value).length
      return length >= 1 && length <= 20
    }, 'Conta inválida'),
  bank_account_digit: z
    .string()
    .optional()
    .refine((value) => !value || /^[0-9Xx]{1,4}$/.test(value), 'Dígito inválido'),
  bank_account_type: z.enum(['checking', 'savings']),
  bank_pix_key: z
    .string()
    .max(120, 'Máximo de 120 caracteres')
    .optional()
    .refine((value) => isValidPixKey(value), 'Chave PIX inválida'),
})

type FormData = z.infer<typeof schema>

export default function StripeSettingsPage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: status, isLoading, isError } = useQuery({
    queryKey: ['stripe-status'],
    queryFn: () => meApi.stripeStatus().then((r) => r.data as StripeStatus),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bank_account_type: 'checking',
    },
  })

  useEffect(() => {
    if (!status?.bank_details) return
    reset({
      bank_holder_name: formatHolderName(status.bank_details.bank_holder_name ?? ''),
      bank_holder_document: formatCpfCnpj(status.bank_details.bank_holder_document ?? ''),
      bank_name: formatBankName(status.bank_details.bank_name ?? ''),
      bank_code: formatDigits(status.bank_details.bank_code ?? '', 3),
      bank_agency: formatDigits(status.bank_details.bank_agency ?? '', 10),
      bank_agency_digit: formatAlphaNumericX(status.bank_details.bank_agency_digit ?? '', 4),
      bank_account_number: formatDigits(status.bank_details.bank_account_number ?? '', 20),
      bank_account_digit: formatAlphaNumericX(status.bank_details.bank_account_digit ?? '', 4),
      bank_account_type: status.bank_details.bank_account_type ?? 'checking',
      bank_pix_key: formatPixKey(status.bank_details.bank_pix_key ?? ''),
    })
  }, [status, reset])

  const { mutate: saveBankDetails, isPending: savingBankDetails } = useMutation({
    mutationFn: (data: FormData) =>
      meApi.stripeOnboarding({
        bank_holder_name: data.bank_holder_name.trim(),
        bank_holder_document: onlyDigits(data.bank_holder_document),
        bank_name: data.bank_name.trim(),
        bank_code: onlyDigits(data.bank_code),
        bank_agency: onlyDigits(data.bank_agency),
        bank_agency_digit: data.bank_agency_digit?.trim() || undefined,
        bank_account_number: onlyDigits(data.bank_account_number),
        bank_account_digit: data.bank_account_digit?.trim() || undefined,
        bank_account_type: data.bank_account_type,
        bank_pix_key: data.bank_pix_key?.trim() || undefined,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['stripe-status'] })
      setError(null)
      setSuccess(response.data?.message ?? 'Dados bancários salvos com sucesso.')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Erro ao salvar dados bancários.')
    },
  })

  const payoutReady = Boolean(status?.payout_details_completed)

  return (
    <div className="space-y-6">
      {success && <Alert className="border-green-200 bg-green-50 text-green-800">{success}</Alert>}
      {error && <Alert variant="destructive">{error}</Alert>}

      {isError && (
        <Alert variant="destructive">Erro ao carregar status de pagamentos.</Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Configuração de pagamentos</CardTitle>
          </div>
          <CardDescription>
            Cadastre os dados bancários para receber repasses da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Spinner size="sm" />
              <span className="text-sm text-muted-foreground">Carregando dados...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                payoutReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                {payoutReady ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    payoutReady ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {payoutReady
                      ? 'Dados bancários ativos para repasse'
                      : 'Dados bancários pendentes'}
                  </p>
                  {status?.message && (
                    <p className={`text-xs mt-0.5 ${
                      payoutReady ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {status.message}
                    </p>
                  )}
                </div>
              </div>

              <form
                className="space-y-4"
                onSubmit={handleSubmit((data) => saveBankDetails(data))}
              >
                <div>
                  <Label htmlFor="bank_holder_name">Nome do titular *</Label>
                  <Input
                    id="bank_holder_name"
                    className="mt-1"
                    maxLength={120}
                    placeholder="NOME COMPLETO DO TITULAR"
                    {...register('bank_holder_name', {
                      onChange: (event) => {
                        event.target.value = formatHolderName(event.target.value)
                      },
                    })}
                  />
                  {errors.bank_holder_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.bank_holder_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_holder_document">CPF/CNPJ do titular *</Label>
                    <Input
                      id="bank_holder_document"
                      className="mt-1"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      maxLength={18}
                      inputMode="numeric"
                      {...register('bank_holder_document', {
                        onChange: (event) => {
                          event.target.value = formatCpfCnpj(event.target.value)
                        },
                      })}
                    />
                    {errors.bank_holder_document && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_holder_document.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Banco *</Label>
                    <Input
                      id="bank_name"
                      className="mt-1"
                      maxLength={120}
                      placeholder="EX: BANCO DO BRASIL"
                      {...register('bank_name', {
                        onChange: (event) => {
                          event.target.value = formatBankName(event.target.value)
                        },
                      })}
                    />
                    {errors.bank_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bank_code">Código do banco *</Label>
                    <Input
                      id="bank_code"
                      className="mt-1"
                      placeholder="001"
                      inputMode="numeric"
                      maxLength={3}
                      {...register('bank_code', {
                        onChange: (event) => {
                          event.target.value = formatDigits(event.target.value, 3)
                        },
                      })}
                    />
                    {errors.bank_code && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_code.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bank_agency">Agência *</Label>
                    <Input
                      id="bank_agency"
                      className="mt-1"
                      placeholder="1234"
                      inputMode="numeric"
                      maxLength={10}
                      {...register('bank_agency', {
                        onChange: (event) => {
                          event.target.value = formatDigits(event.target.value, 10)
                        },
                      })}
                    />
                    {errors.bank_agency && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_agency.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bank_agency_digit">Dígito agência</Label>
                    <Input
                      id="bank_agency_digit"
                      className="mt-1"
                      placeholder="0"
                      maxLength={4}
                      {...register('bank_agency_digit', {
                        onChange: (event) => {
                          event.target.value = formatAlphaNumericX(event.target.value, 4)
                        },
                      })}
                    />
                    {errors.bank_agency_digit && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_agency_digit.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bank_account_type">Tipo de conta *</Label>
                    <select
                      id="bank_account_type"
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      {...register('bank_account_type')}
                    >
                      <option value="checking">Conta corrente</option>
                      <option value="savings">Conta poupança</option>
                    </select>
                    {errors.bank_account_type && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_account_type.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_account_number">Número da conta *</Label>
                    <Input
                      id="bank_account_number"
                      className="mt-1"
                      placeholder="12345678"
                      inputMode="numeric"
                      maxLength={20}
                      {...register('bank_account_number', {
                        onChange: (event) => {
                          event.target.value = formatDigits(event.target.value, 20)
                        },
                      })}
                    />
                    {errors.bank_account_number && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_account_number.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bank_account_digit">Dígito da conta</Label>
                    <Input
                      id="bank_account_digit"
                      className="mt-1"
                      placeholder="1"
                      maxLength={4}
                      {...register('bank_account_digit', {
                        onChange: (event) => {
                          event.target.value = formatAlphaNumericX(event.target.value, 4)
                        },
                      })}
                    />
                    {errors.bank_account_digit && (
                      <p className="text-xs text-red-500 mt-1">{errors.bank_account_digit.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bank_pix_key">Chave PIX (opcional)</Label>
                  <Input
                    id="bank_pix_key"
                    className="mt-1"
                    placeholder="CPF, CNPJ, telefone, e-mail ou chave aleatória"
                    maxLength={120}
                    {...register('bank_pix_key', {
                      onChange: (event) => {
                        event.target.value = formatPixKey(event.target.value)
                      },
                    })}
                  />
                  {errors.bank_pix_key && (
                    <p className="text-xs text-red-500 mt-1">{errors.bank_pix_key.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={savingBankDetails} className="min-w-44">
                  {savingBankDetails ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar dados bancários'
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
