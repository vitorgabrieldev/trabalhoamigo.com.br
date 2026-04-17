'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { CreditCard, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { meApi } from '@/lib/api'
import type { StripeStatus } from '@/types'
import { useState } from 'react'

export default function StripeSettingsPage() {
  const [error, setError] = useState<string | null>(null)

  const { data: status, isLoading, isError } = useQuery({
    queryKey: ['stripe-status'],
    queryFn: () => meApi.stripeStatus().then((r) => r.data as StripeStatus),
  })

  const { mutate: startOnboarding, isPending: redirecting } = useMutation({
    mutationFn: () => meApi.stripeOnboarding(),
    onSuccess: (res) => {
      const url = res.data?.url
      if (url) {
        window.location.href = url
      } else {
        setError('Não foi possível obter o link de onboarding.')
      }
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Erro ao iniciar configuração de pagamento.')
    },
  })

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      {isError && (
        <Alert variant="destructive">Erro ao carregar status do Stripe.</Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Configuração de pagamentos</CardTitle>
          </div>
          <CardDescription>
            Configure sua conta no Stripe para receber pagamentos dos seus serviços.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Spinner size="sm" />
              <span className="text-sm text-muted-foreground">Verificando status...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status indicator */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                status?.stripe_onboarding_completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                {status?.stripe_onboarding_completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    status?.stripe_onboarding_completed ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {status?.stripe_onboarding_completed
                      ? 'Conta ativa — pronto para receber pagamentos'
                      : 'Configuração pendente'}
                  </p>
                  {status?.message && (
                    <p className={`text-xs mt-0.5 ${
                      status.stripe_onboarding_completed ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {status.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              {!status?.stripe_onboarding_completed && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Para receber pagamentos dos seus serviços, você precisa completar o cadastro no Stripe.
                    O processo é rápido e seguro.
                  </p>
                  <Button
                    onClick={() => startOnboarding()}
                    disabled={redirecting}
                    className="flex items-center gap-2"
                  >
                    {redirecting ? (
                      <Spinner size="sm" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {redirecting ? 'Redirecionando...' : 'Configurar conta Stripe'}
                  </Button>
                </div>
              )}

              {status?.stripe_onboarding_completed && (
                <Button
                  variant="outline"
                  onClick={() => startOnboarding()}
                  disabled={redirecting}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {redirecting ? 'Redirecionando...' : 'Acessar painel Stripe'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2">Como funciona?</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Clique em &ldquo;Configurar conta Stripe&rdquo; e complete o cadastro
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Informe seus dados bancários para receber pagamentos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              Quando um contrato for concluído, o valor será transferido automaticamente
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
