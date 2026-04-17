'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { servicesApi } from '@/lib/api'
import { formatBRL, statusLabel, statusColor } from '@/lib/utils'
import type { Service } from '@/types'
import { useState } from 'react'

export default function MyServicesPage() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: services, isLoading, isError } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => servicesApi.listMy().then((r) => r.data as Service[]),
  })

  const { mutate: deleteService, isPending: isDeleting } = useMutation({
    mutationFn: (uuid: string) => servicesApi.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] })
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setDeleteError(axiosErr.response?.data?.message ?? 'Erro ao excluir serviço.')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Serviços</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os serviços que você oferece
          </p>
        </div>
        <Button asChild>
          <Link href="/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo serviço
          </Link>
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">Erro ao carregar seus serviços. Tente novamente.</Alert>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      )}

      {!isLoading && services && services.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhum serviço cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Comece criando seu primeiro serviço
          </p>
          <Button asChild className="mt-4">
            <Link href="/services/new">Criar serviço</Link>
          </Button>
        </div>
      )}

      {!isLoading && services && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.uuid} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {service.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(
                          service.status,
                        )}`}
                      >
                        {statusLabel(service.status)}
                      </span>
                      {service.is_community && (
                        <Badge variant="success" className="text-xs">Comunitário</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.category?.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {service.base_price && (
                        <span className="font-medium text-gray-700">
                          {formatBRL(service.base_price)}
                        </span>
                      )}
                      {service.reviews_count !== undefined && service.reviews_count > 0 && (
                        <span>{service.reviews_count} avaliações</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/services/${service.uuid}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setDeleteError(null)
                        setDeleteTarget(service)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o serviço{' '}
              <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <Alert variant="destructive">{deleteError}</Alert>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteService(deleteTarget.uuid)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
