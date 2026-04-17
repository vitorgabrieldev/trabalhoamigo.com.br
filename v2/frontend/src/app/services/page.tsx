'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ServiceCard } from '@/components/services/ServiceCard'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { servicesApi, categoriesApi } from '@/lib/api'
import { useDebounce } from '@/hooks/useDebounce'
import type { PaginatedResponse, Service, Category } from '@/types'
import { formatBRL } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Mais recentes' },
  { value: 'base_price', label: 'Menor preço' },
  { value: '-base_price', label: 'Maior preço' },
]

export default function ServicesPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [categoryUuid, setCategoryUuid] = useState(searchParams.get('category') ?? '')
  const [sort, setSort] = useState('created_at')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data as { data: Category[] }),
  })
  const categories = categoriesData?.data ?? []

  const queryParams = {
    ...(debouncedSearch ? { 'filter[search]': debouncedSearch } : {}),
    ...(categoryUuid && categoryUuid !== 'all' ? { 'filter[category_uuid]': categoryUuid } : {}),
    sort,
    page,
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['services', queryParams],
    queryFn: () =>
      servicesApi.list(queryParams).then((r) => r.data as PaginatedResponse<Service>),
  })

  const handleCategoryChange = useCallback((uuid: string) => {
    setCategoryUuid(uuid)
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setCategoryUuid('')
    setSort('created_at')
    setPriceMin('')
    setPriceMax('')
    setPage(1)
  }, [])

  const services = data?.data ?? []
  const meta = data?.meta

  const hasFilters = search || categoryUuid || sort !== 'created_at' || priceMin || priceMax

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0">
      {/* Categories */}
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Categorias</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={categoryUuid === ''}
              onChange={() => handleCategoryChange('')}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Todas</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.uuid} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={categoryUuid === cat.uuid}
                onChange={() => handleCategoryChange(cat.uuid)}
                className="accent-primary"
              />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-6 border-t border-gray-100 pt-5">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Preço</p>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">Preço mínimo</p>
            <input
              type="number"
              min="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="R$ 0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">Preço máximo</p>
            <input
              type="number"
              min="0"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="R$ 999"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="mb-6 border-t border-gray-100 pt-5">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Ordenar</p>
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                checked={sort === opt.value}
                onChange={() => { setSort(opt.value); setPage(1) }}
                className="accent-primary"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-xs text-primary border border-primary rounded-lg py-2 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
        >
          <X className="h-3 w-3" /> Limpar filtros
        </button>
      )}
    </aside>
  )

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Digite aqui o serviço que procura..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Mobile filter toggle */}
              <button
                className="lg:hidden flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {['Todos', ...categories.slice(0, 4).map((c) => c.name)].map((label, i) => {
                const isActive =
                  i === 0 ? categoryUuid === '' : categories[i - 1]?.name === label && categoryUuid === categories[i - 1]?.uuid
                return (
                  <button
                    key={label}
                    onClick={() => handleCategoryChange(i === 0 ? '' : categories[i - 1]?.uuid ?? '')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isActive
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}

              {meta && (
                <span className="ml-auto text-xs text-gray-400">
                  {meta.total?.toLocaleString('pt-BR') ?? services.length} serviços encontrados
                </span>
              )}
            </div>

            {/* Error */}
            {isError && (
              <Alert variant="destructive" className="mb-5">
                Erro ao carregar serviços:{' '}
                {(error as { message?: string })?.message ?? 'Tente novamente.'}
              </Alert>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border bg-white">
                    <Skeleton className="h-44 w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && services.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-base">Nenhum serviço encontrado.</p>
                <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros.</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            {/* Grid */}
            {!isLoading && services.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {services.map((service) => (
                    <ServiceCard key={service.uuid} service={service} />
                  ))}
                </div>

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
                    <span className="text-sm text-gray-500">
                      {meta.current_page} / {meta.last_page}
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
      </div>

      {/* Mobile sidebar overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto p-5 z-50">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-gray-900">Filtros</p>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  )
}
