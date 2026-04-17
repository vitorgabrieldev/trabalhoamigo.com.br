'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { Shield, ShieldCheck, ShieldOff, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { authApi, meApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

export default function SecuritySettingsPage() {
  const { user, setUser } = useAuthStore()
  const [setupOpen, setSetupOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [confirmCode, setConfirmCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: profile, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: () => meApi.getProfile().then((r) => r.data as User),
    initialData: user ?? undefined,
  })

  const totpEnabled = profile?.totp_enabled ?? false

  const { mutate: setupTotp, isPending: settingUp } = useMutation({
    mutationFn: () => authApi.setupTotp(),
    onSuccess: (res) => {
      setQrCodeUrl(res.data.qr_code_url)
      setSecret(res.data.secret)
      setError(null)
      setSetupOpen(true)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Erro ao configurar 2FA.')
    },
  })

  const { mutate: confirmTotp, isPending: confirming } = useMutation({
    mutationFn: () => authApi.confirmTotp(confirmCode),
    onSuccess: () => {
      refetch()
      setSetupOpen(false)
      setConfirmCode('')
      setQrCodeUrl(null)
      setSuccess('Autenticação de dois fatores ativada!')
      setTimeout(() => setSuccess(null), 4000)
      setUser({ ...profile!, totp_enabled: true })
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Código inválido.')
    },
  })

  const { mutate: disableTotp, isPending: disabling } = useMutation({
    mutationFn: () => authApi.disableTotp(disableCode),
    onSuccess: () => {
      refetch()
      setDisableOpen(false)
      setDisableCode('')
      setSuccess('Autenticação de dois fatores desativada.')
      setTimeout(() => setSuccess(null), 4000)
      setUser({ ...profile!, totp_enabled: false })
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Código inválido.')
    },
  })

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">{success}</Alert>
      )}
      {error && !setupOpen && !disableOpen && (
        <Alert variant="destructive">{error}</Alert>
      )}

      {/* 2FA Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {totpEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
              <Shield className="h-5 w-5 text-gray-400" />
            )}
            <CardTitle className="text-base">Autenticação de dois fatores (2FA)</CardTitle>
          </div>
          <CardDescription>
            {totpEnabled
              ? 'Sua conta está protegida com autenticação de dois fatores.'
              : 'Adicione uma camada extra de segurança à sua conta.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Aplicativo autenticador</p>
                <p className="text-xs text-muted-foreground">
                  {totpEnabled ? 'Ativado — usando app TOTP' : 'Não configurado'}
                </p>
              </div>
            </div>
            {totpEnabled ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setError(null)
                  setDisableOpen(true)
                }}
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Desativar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setError(null)
                  setupTotp()
                }}
                disabled={settingUp}
              >
                {settingUp ? <Spinner size="sm" /> : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Ativar 2FA
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup dialog */}
      <Dialog open={setupOpen} onOpenChange={(open) => { setSetupOpen(open); setError(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Configurar autenticação 2FA</DialogTitle>
            <DialogDescription>
              Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center">
                <div className="border rounded-lg p-3 bg-white">
                  <Image src={qrCodeUrl} alt="QR Code 2FA" width={180} height={180} />
                </div>
              </div>
            )}

            {secret && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Código manual:</p>
                <p className="font-mono text-sm font-medium tracking-widest text-center break-all">
                  {secret}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="confirm_code">Código de verificação</Label>
              <Input
                id="confirm_code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="mt-1 text-center tracking-widest text-lg"
              />
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => confirmTotp()}
              disabled={confirming || confirmCode.length < 6}
            >
              {confirming ? <Spinner size="sm" /> : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={disableOpen} onOpenChange={(open) => { setDisableOpen(open); setError(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Desativar 2FA</DialogTitle>
            <DialogDescription>
              Digite o código do seu aplicativo autenticador para confirmar.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="disable_code">Código 2FA</Label>
            <Input
              id="disable_code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              className="mt-1 text-center tracking-widest text-lg"
            />
          </div>
          {error && <Alert variant="destructive">{error}</Alert>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => disableTotp()}
              disabled={disabling || disableCode.length < 6}
            >
              {disabling ? <Spinner size="sm" /> : 'Desativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
