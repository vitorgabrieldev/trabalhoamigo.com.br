'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { ServiceCard } from '@/components/services/ServiceCard'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { servicesApi, categoriesApi } from '@/lib/api'
import type { PaginatedResponse, Service, Category } from '@/types'

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Mais recentes' },
  { value: 'base_price', label: 'Menor preço' },
  { value: '-base_price', label: 'Maior preço' },
  { value: '-average_rating', label: 'Melhor avaliados' },
]

const CATEGORIES_LIMIT = 8

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3 group cursor-pointer"
      >
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</p>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>
      {open && children}
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────

function parseList(v: string | null): string[] {
  if (!v) return []
  return v.split(',').filter(Boolean)
}

export default function ServicesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // ── read initial state from URL ──────────────────────────────────────────
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') ?? '1', 10))
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [categoryUuids, setCategoryUuids] = useState<string[]>(() => parseList(searchParams.get('categories')))
  const [sort, setSort] = useState(() => searchParams.get('sort') ?? '-created_at')
  const [priceMin, setPriceMin] = useState(() => searchParams.get('price_min') ?? '')
  const [priceMax, setPriceMax] = useState(() => searchParams.get('price_max') ?? '')
  const [city, setCity] = useState(() => searchParams.get('city') ?? '')
  const [stateUF, setStateUF] = useState(() => searchParams.get('state') ?? '')
  const [neighborhood, setNeighborhood] = useState(() => searchParams.get('neighborhood') ?? '')
  const [minRating, setMinRating] = useState(() => parseInt(searchParams.get('min_rating') ?? '0', 10))
  const [communityOnly, setCommunityOnly] = useState(() => searchParams.get('community') === '1')
  const [acceptsOfferOnly, setAcceptsOfferOnly] = useState(() => searchParams.get('accepts_offer') === '1')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)

  // ── sync state → URL (skip on first render) ───────────────────────────────
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const p = new URLSearchParams()
    if (search)                p.set('search', search)
    if (categoryUuids.length)  p.set('categories', categoryUuids.join(','))
    if (sort !== '-created_at') p.set('sort', sort)
    if (priceMin)              p.set('price_min', priceMin)
    if (priceMax)              p.set('price_max', priceMax)
    if (city)                  p.set('city', city)
    if (stateUF)               p.set('state', stateUF)
    if (neighborhood)          p.set('neighborhood', neighborhood)
    if (minRating > 0)         p.set('min_rating', String(minRating))
    if (communityOnly)         p.set('community', '1')
    if (acceptsOfferOnly)      p.set('accepts_offer', '1')
    if (page > 1)              p.set('page', String(page))
    const qs = p.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [search, categoryUuids, sort, priceMin, priceMax, city, stateUF, neighborhood, minRating, communityOnly, acceptsOfferOnly, page]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── categories fetch ──────────────────────────────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => {
      const body = r.data
      if (Array.isArray(body)) return body as Category[]
      if (body?.data && Array.isArray(body.data)) return body.data as Category[]
      return [] as Category[]
    }),
  })
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  // ── services fetch ────────────────────────────────────────────────────────
  const queryParams = {
    ...(search ? { 'filter[search]': search } : {}),
    ...(categoryUuids.length ? { 'filter[category_uuid]': categoryUuids.join(',') } : {}),
    ...(priceMin ? { 'filter[price_min]': priceMin } : {}),
    ...(priceMax ? { 'filter[price_max]': priceMax } : {}),
    ...(city ? { 'filter[city]': city } : {}),
    ...(stateUF ? { 'filter[state]': stateUF } : {}),
    ...(neighborhood ? { 'filter[neighborhood]': neighborhood } : {}),
    ...(minRating > 0 ? { 'filter[min_rating]': minRating } : {}),
    ...(communityOnly ? { 'filter[is_community]': 1 } : {}),
    ...(acceptsOfferOnly ? { 'filter[accepts_offer]': 1 } : {}),
    sort,
    page,
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['services', queryParams],
    queryFn: () =>
      servicesApi.list(queryParams).then((r) => r.data as PaginatedResponse<Service>),
  })

  // ── handlers ──────────────────────────────────────────────────────────────
  const toggleCategory = useCallback((uuid: string) => {
    setCategoryUuids((prev) =>
      prev.includes(uuid) ? prev.filter((u) => u !== uuid) : [...prev, uuid]
    )
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setCategoryUuids([])
    setSort('-created_at')
    setPriceMin('')
    setPriceMax('')
    setCity('')
    setStateUF('')
    setNeighborhood('')
    setMinRating(0)
    setCommunityOnly(false)
    setAcceptsOfferOnly(false)
    setPage(1)
  }, [])

  const services = data?.data ?? []
  const meta = data?.meta

  const hasFilters =
    !!search || categoryUuids.length > 0 || sort !== '-created_at' || !!priceMin || !!priceMax ||
    !!city || !!stateUF || !!neighborhood || minRating > 0 || communityOnly || acceptsOfferOnly

  // ── sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-64 shrink-0">
      {/* Categorias */}
      <FilterSection title="Categorias">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {(showAllCategories ? categories : categories.slice(0, CATEGORIES_LIMIT)).map((cat) => (
            <label key={cat.uuid} className="flex items-center gap-1.5 cursor-pointer py-0.5 min-w-0">
              <input
                type="checkbox"
                checked={categoryUuids.includes(cat.uuid)}
                onChange={() => toggleCategory(cat.uuid)}
                className="accent-primary shrink-0"
              />
              <span className="text-xs text-gray-700 truncate">{cat.name}</span>
            </label>
          ))}
        </div>
        {categories.length > CATEGORIES_LIMIT && (
          <button
            onClick={() => setShowAllCategories((v) => !v)}
            className="mt-3 text-xs text-primary hover:underline cursor-pointer flex items-center gap-1"
          >
            {showAllCategories ? (
              <><ChevronUp className="h-3 w-3" /> Mostrar menos</>
            ) : (
              <><ChevronDown className="h-3 w-3" /> Mostrar mais ({categories.length - CATEGORIES_LIMIT} restantes)</>
            )}
          </button>
        )}
      </FilterSection>

      {/* Faixa de preço */}
      <FilterSection title="Faixa de preço">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">Mínimo</p>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input
                type="number"
                min="0"
                value={priceMin}
                onChange={(e) => { setPriceMin(e.target.value); setPage(1) }}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <span className="text-gray-300 text-xs mt-4">—</span>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">Máximo</p>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input
                type="number"
                min="0"
                value={priceMax}
                onChange={(e) => { setPriceMax(e.target.value); setPage(1) }}
                placeholder="∞"
                className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Localização */}
      <FilterSection title="Localização">
        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Estado (UF)</p>
            <input
              type="text"
              value={stateUF}
              onChange={(e) => { setStateUF(e.target.value.toUpperCase().slice(0, 2)); setPage(1) }}
              placeholder="ex: SP"
              maxLength={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary uppercase"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Cidade</p>
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1) }}
              placeholder="ex: São Paulo"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Bairro</p>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => { setNeighborhood(e.target.value); setPage(1) }}
              placeholder="ex: Jardim América"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </FilterSection>

      {/* Avaliação mínima */}
      <FilterSection title="Avaliação mínima">
        <div className="space-y-1.5">
          {[0, 3, 4, 5].map((stars) => (
            <label key={stars} className="flex items-center gap-2 cursor-pointer py-0.5">
              <input
                type="radio"
                name="minRating"
                checked={minRating === stars}
                onChange={() => { setMinRating(stars); setPage(1) }}
                className="accent-primary"
              />
              {stars === 0 ? (
                <span className="text-sm text-gray-700">Qualquer</span>
              ) : (
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-0.5">ou mais</span>
                </span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Tipo de serviço */}
      <FilterSection title="Tipo">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer py-0.5">
            <input
              type="checkbox"
              checked={communityOnly}
              onChange={(e) => { setCommunityOnly(e.target.checked); setPage(1) }}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Apenas comunitários</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-0.5">
            <input
              type="checkbox"
              checked={acceptsOfferOnly}
              onChange={(e) => { setAcceptsOfferOnly(e.target.checked); setPage(1) }}
              className="accent-primary"
            />
            <span className="text-sm text-gray-700">Aceita proposta</span>
          </label>
        </div>
      </FilterSection>

      {/* Ordenar */}
      <FilterSection title="Ordenar por">
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5">
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
      </FilterSection>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-xs text-primary border border-primary rounded-lg py-2 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1 cursor-pointer mt-1"
        >
          <X className="h-3 w-3" /> Limpar filtros
        </button>
      )}
    </aside>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <Sidebar />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Digite aqui o serviço que procura..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                />
              </div>

              {/* Mobile filter toggle */}
              <button
                className="lg:hidden flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white cursor-pointer"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {hasFilters && (
                  <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {categoryUuids.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (city ? 1 : 0) + (stateUF ? 1 : 0) + (neighborhood ? 1 : 0) + (minRating > 0 ? 1 : 0) + (communityOnly ? 1 : 0) + (acceptsOfferOnly ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {categoryUuids.map((uuid) => {
                  const cat = categories.find((c) => c.uuid === uuid)
                  return cat ? (
                    <button
                      key={uuid}
                      onClick={() => toggleCategory(uuid)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {cat.name} <X className="h-3 w-3" />
                    </button>
                  ) : null
                })}
                {priceMin && (
                  <button onClick={() => setPriceMin('')} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                    Mín R${priceMin} <X className="h-3 w-3" />
                  </button>
                )}
                {priceMax && (
                  <button onClick={() => setPriceMax('')} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                    Máx R${priceMax} <X className="h-3 w-3" />
                  </button>
                )}
                {stateUF && (
                  <button onClick={() => setStateUF('')} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                    {stateUF} <X className="h-3 w-3" />
                  </button>
                )}
                {city && (
                  <button onClick={() => setCity('')} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                    {city} <X className="h-3 w-3" />
                  </button>
                )}
                {neighborhood && (
                  <button onClick={() => setNeighborhood('')} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                    {neighborhood} <X className="h-3 w-3" />
                  </button>
                )}
                {minRating > 0 && (
                  <button onClick={() => setMinRating(0)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full hover:bg-yellow-100 cursor-pointer">
                    {minRating}★+ <X className="h-3 w-3" />
                  </button>
                )}
                {communityOnly && (
                  <button onClick={() => setCommunityOnly(false)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full hover:bg-green-100 cursor-pointer">
                    Comunitário <X className="h-3 w-3" />
                  </button>
                )}
                {acceptsOfferOnly && (
                  <button onClick={() => setAcceptsOfferOnly(false)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">
                    Aceita proposta <X className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-1"
                >
                  Limpar tudo
                </button>
              </div>
            )}

            {/* Result count */}
            {meta && (
              <p className="text-xs text-gray-400 mb-5">
                {meta.total?.toLocaleString('pt-BR') ?? services.length} serviços encontrados
              </p>
            )}

            {/* Error */}
            {isError && (
              <Alert variant="destructive" className="mb-5">
                Erro ao carregar serviços:{' '}
                {(error as { message?: string })?.message ?? 'Tente novamente.'}
              </Alert>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border bg-white">
                    <Skeleton className="h-52 w-full" />
                    <div className="p-4 space-y-2.5">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-5 w-1/4 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && services.length === 0 && (
              <div className="text-center py-24">
                <p className="text-gray-400 text-base">Nenhum serviço encontrado.</p>
                <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros.</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline cursor-pointer">
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            {/* Grid */}
            {!isLoading && services.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {services.map((service) => (
                    <ServiceCard key={service.uuid} service={service} />
                  ))}
                </div>

                {meta && meta.last_page > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === meta.last_page)
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="text-sm text-gray-400 px-1">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
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
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto p-5 z-50">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-gray-900">Filtros</p>
              <button onClick={() => setMobileFiltersOpen(false)} className="cursor-pointer">
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
