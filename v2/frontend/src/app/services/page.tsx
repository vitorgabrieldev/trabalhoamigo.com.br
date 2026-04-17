'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ServiceFilters } from '@/components/services/ServiceFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { servicesApi } from '@/lib/api'
import type { PaginatedResponse, Service } from '@/types'

export default function ServicesPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    category_uuid: '',
    sort: 'created_at',
  })

  const queryParams = {
    ...(filters.search ? { 'filter[search]': filters.search } : {}),
    ...(filters.category_uuid && filters.category_uuid !== 'all'
      ? { 'filter[category_uuid]': filters.category_uuid }
      : {}),
    sort: filters.sort,
    page,
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['services', queryParams],
    queryFn: () =>
      servicesApi.list(queryParams).then((r) => r.data as PaginatedResponse<Service>),
  })

  const handleFiltersChange = useCallback(
    (newFilters: { search: string; category_uuid: string; sort: string }) => {
      setFilters(newFilters)
      setPage(1)
    },
    [],
  )

  const services = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Serviços disponíveis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Encontre o profissional certo para o seu projeto
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ServiceFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Error */}
        {isError && (
          <Alert variant="destructive" className="mb-6">
            Erro ao carregar serviços:{' '}
            {(error as { message?: string })?.message ?? 'Tente novamente.'}
          </Alert>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border bg-white">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && services.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Nenhum serviço encontrado.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Tente ajustar os filtros de busca.
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && services.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {services.map((service) => (
                <ServiceCard key={service.uuid} service={service} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {meta.current_page} de {meta.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
