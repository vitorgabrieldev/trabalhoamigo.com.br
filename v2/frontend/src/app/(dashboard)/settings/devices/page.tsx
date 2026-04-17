'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Monitor, Smartphone, Trash2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { authApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Session } from '@/types'
import { useState } from 'react'

export default function DevicesPage() {
  const queryClient = useQueryClient()
  const [revokeAllOpen, setRevokeAllOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => authApi.getSessions().then((r) => r.data as Session[]),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['sessions'] })

  const { mutate: revokeSession, isPending: revoking } = useMutation({
    mutationFn: (uuid: string) => authApi.revokeSession(uuid),
    onSuccess: () => {
      invalidate()
      setSuccess('Sessão encerrada.')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Erro ao revogar sessão.')
    },
  })

  const { mutate: revokeAll, isPending: revokingAll } = useMutation({
    mutationFn: () => authApi.revokeAllSessions(),
    onSuccess: () => {
      invalidate()
      setRevokeAllOpen(false)
      setSuccess('Todas as sessões foram encerradas.')
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Erro ao revogar sessões.')
    },
  })

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">{success}</Alert>
      )}
      {error && <Alert variant="destructive">{error}</Alert>}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Sessões ativas</CardTitle>
              <CardDescription>
                Gerencie os dispositivos conectados à sua conta
              </CardDescription>
            </div>
            {sessions && sessions.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRevokeAllOpen(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Encerrar todas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <Alert variant="destructive">Erro ao carregar sessões.</Alert>
          )}

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && sessions && sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma sessão ativa.
            </p>
          )}

          {!isLoading && sessions && sessions.length > 0 && (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.uuid}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {session.device?.toLowerCase().includes('mobile') ? (
                      <Smartphone className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Monitor className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {session.device ?? 'Dispositivo desconhecido'}
                      </p>
                      {session.is_current && (
                        <Badge variant="success" className="text-[10px]">Atual</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.ip_address && `IP: ${session.ip_address}`}
                      {session.ip_address && session.last_active_at && ' · '}
                      {session.last_active_at && `Último acesso: ${formatDateTime(session.last_active_at)}`}
                    </p>
                  </div>

                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => revokeSession(session.uuid)}
                      disabled={revoking}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke all dialog */}
      <Dialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar todas as sessões</DialogTitle>
            <DialogDescription>
              Isso encerrará todas as sessões ativas, exceto a atual. Você precisará fazer login novamente em todos os outros dispositivos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeAllOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeAll()}
              disabled={revokingAll}
            >
              {revokingAll ? 'Encerrando...' : 'Encerrar todas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
