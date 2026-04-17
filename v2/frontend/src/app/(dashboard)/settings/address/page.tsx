'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { meApi } from '@/lib/api'
import type { User } from '@/types'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const schema = z.object({
  zip_code: z.string().min(8, 'CEP inválido').max(9),
  street: z.string().min(3, 'Rua é obrigatória'),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado inválido'),
})

type FormData = z.infer<typeof schema>

export default function AddressSettingsPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: () => meApi.getProfile().then((r) => r.data as User),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile?.address) {
      reset({
        zip_code: profile.address.zip_code,
        street: profile.address.street,
        neighborhood: profile.address.neighborhood,
        number: profile.address.number,
        complement: profile.address.complement ?? '',
        city: profile.address.city,
        state: profile.address.state,
      })
    }
  }, [profile, reset])

  const { mutate: updateAddress } = useMutation({
    mutationFn: (data: FormData) =>
      meApi.updateAddress({
        zip_code: data.zip_code,
        street: data.street,
        neighborhood: data.neighborhood,
        number: data.number,
        complement: data.complement || undefined,
        city: data.city,
        state: data.state,
      }),
    onSuccess: () => {
      setSuccess(true)
      setError(null)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Erro ao atualizar endereço.')
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Endereço</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            Endereço atualizado com sucesso!
          </Alert>
        )}
        {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit((data) => updateAddress(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zip_code">CEP *</Label>
              <Input
                id="zip_code"
                placeholder="00000-000"
                maxLength={9}
                className="mt-1"
                {...register('zip_code')}
              />
              {errors.zip_code && (
                <p className="text-xs text-red-500 mt-1">{errors.zip_code.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">Estado *</Label>
              <select
                id="state"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('state')}
              >
                <option value="">Selecione</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="street">Rua / Avenida *</Label>
            <Input id="street" placeholder="Rua das Flores" className="mt-1" {...register('street')} />
            {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">Número *</Label>
              <Input id="number" placeholder="123" className="mt-1" {...register('number')} />
              {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number.message}</p>}
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" placeholder="Apto 42" className="mt-1" {...register('complement')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input id="neighborhood" placeholder="Centro" className="mt-1" {...register('neighborhood')} />
              {errors.neighborhood && (
                <p className="text-xs text-red-500 mt-1">{errors.neighborhood.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" placeholder="São Paulo" className="mt-1" {...register('city')} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Salvando...
                </span>
              ) : (
                'Salvar endereço'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
