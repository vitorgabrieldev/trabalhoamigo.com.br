'use client'

import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X, Star, ChevronDown, ChevronUp, Loader2, SlidersHorizontal as FiltersIcon } from 'lucide-react'
import { ServiceCard } from '@/components/services/ServiceCard'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Skeleton } from '@/components/ui/skeleton'
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

interface Filters {
  categoryUuids: string[]
  sort: string
  priceMin: string
  priceMax: string
  city: string
  stateUF: string
  neighborhood: string
  minRating: number
  communityOnly: boolean
  acceptsOfferOnly: boolean
}

const EMPTY_FILTERS: Filters = {
  categoryUuids: [],
  sort: '-created_at',
  priceMin: '',
  priceMax: '',
  city: '',
  stateUF: '',
  neighborhood: '',
  minRating: 0,
  communityOnly: false,
  acceptsOfferOnly: false,
}

function parseList(v: string | null): string[] {
  if (!v) return []
  return v.split(',').filter(Boolean)
}

function filtersFromParams(searchParams: URLSearchParams): Filters {
  return {
    categoryUuids: parseList(searchParams.get('categories')),
    sort: searchParams.get('sort') ?? '-created_at',
    priceMin: searchParams.get('price_min') ?? '',
    priceMax: searchParams.get('price_max') ?? '',
    city: searchParams.get('city') ?? '',
    stateUF: searchParams.get('state') ?? '',
    neighborhood: searchParams.get('neighborhood') ?? '',
    minRating: parseInt(searchParams.get('min_rating') ?? '0', 10),
    communityOnly: searchParams.get('community') === '1',
    acceptsOfferOnly: searchParams.get('accepts_offer') === '1',
  }
}

function isDirty(draft: Filters, applied: Filters): boolean {
  return JSON.stringify(draft) !== JSON.stringify(applied)
}

function hasActiveFilters(f: Filters): boolean {
  return (
    f.categoryUuids.length > 0 || f.sort !== '-created_at' || !!f.priceMin || !!f.priceMax ||
    !!f.city || !!f.stateUF || !!f.neighborhood || f.minRating > 0 || f.communityOnly || f.acceptsOfferOnly
  )
}

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
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
          : <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />}
      </button>
      {open && children}
    </div>
  )
}

function ServicesContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [applied, setApplied] = useState<Filters>(() => filtersFromParams(searchParams))
  const [draft, setDraft] = useState<Filters>(() => filtersFromParams(searchParams))
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)

  // ── sync applied + search → URL ──────────────────────────────────────────
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const p = new URLSearchParams()
    if (search)                          p.set('search', search)
    if (applied.categoryUuids.length)    p.set('categories', applied.categoryUuids.join(','))
    if (applied.sort !== '-created_at')  p.set('sort', applied.sort)
    if (applied.priceMin)                p.set('price_min', applied.priceMin)
    if (applied.priceMax)                p.set('price_max', applied.priceMax)
    if (applied.city)                    p.set('city', applied.city)
    if (applied.stateUF)                 p.set('state', applied.stateUF)
    if (applied.neighborhood)            p.set('neighborhood', applied.neighborhood)
    if (applied.minRating > 0)           p.set('min_rating', String(applied.minRating))
    if (applied.communityOnly)           p.set('community', '1')
    if (applied.acceptsOfferOnly)        p.set('accepts_offer', '1')
    const qs = p.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [applied, search]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── categories ────────────────────────────────────────────────────────────
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

  // ── infinite query (uses applied, not draft) ──────────────────────────────
  const queryFilters = {
    ...(search ? { 'filter[search]': search } : {}),
    ...(applied.categoryUuids.length ? { 'filter[category_uuid]': applied.categoryUuids.join(',') } : {}),
    ...(applied.priceMin ? { 'filter[price_min]': applied.priceMin } : {}),
    ...(applied.priceMax ? { 'filter[price_max]': applied.priceMax } : {}),
    ...(applied.city ? { 'filter[city]': applied.city } : {}),
    ...(applied.stateUF ? { 'filter[state]': applied.stateUF } : {}),
    ...(applied.neighborhood ? { 'filter[neighborhood]': applied.neighborhood } : {}),
    ...(applied.minRating > 0 ? { 'filter[min_rating]': applied.minRating } : {}),
    ...(applied.communityOnly ? { 'filter[is_community]': 1 } : {}),
    ...(applied.acceptsOfferOnly ? { 'filter[accepts_offer]': 1 } : {}),
    sort: applied.sort,
  }

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['services-infinite', queryFilters],
      queryFn: ({ pageParam }) =>
        servicesApi.list({ ...queryFilters, page: pageParam }).then((r) => r.data as PaginatedResponse<Service>),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.current_page < lastPage.meta.last_page
          ? lastPage.meta.current_page + 1
          : undefined,
    })

  const services = data?.pages.flatMap((p) => p.data) ?? []
  const total = data?.pages[0]?.meta.total

  // ── intersection observer ─────────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // ── handlers ──────────────────────────────────────────────────────────────
  const applyFilters = useCallback(() => {
    setApplied({ ...draft })
    setMobileFiltersOpen(false)
  }, [draft])

  const clearFilters = useCallback(() => {
    setDraft({ ...EMPTY_FILTERS })
    setApplied({ ...EMPTY_FILTERS })
  }, [])

  const dirty = isDirty(draft, applied)
  const activeFilters = hasActiveFilters(applied)

  // ── sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-64 shrink-0">
      {/* Apply / Clear buttons — TOP of sidebar */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={applyFilters}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            dirty
              ? 'bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/30'
              : 'bg-gray-100 text-gray-400 cursor-default'
          }`}
          disabled={!dirty}
        >
          Aplicar filtros
        </button>
        {activeFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Pending changes indicator */}
      {dirty && (
        <p className="text-[10px] text-primary/70 mb-4 -mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 inline-block" />
          Filtros alterados — clique em Aplicar
        </p>
      )}

      <FilterSection title="Categorias">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {(showAllCategories ? categories : categories.slice(0, CATEGORIES_LIMIT)).map((cat) => (
            <label key={cat.uuid} className="flex items-center gap-1.5 cursor-pointer py-0.5 min-w-0">
              <input
                type="checkbox"
                checked={draft.categoryUuids.includes(cat.uuid)}
                onChange={() =>
                  setDraft((d) => ({
                    ...d,
                    categoryUuids: d.categoryUuids.includes(cat.uuid)
                      ? d.categoryUuids.filter((u) => u !== cat.uuid)
                      : [...d.categoryUuids, cat.uuid],
                  }))
                }
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
            {showAllCategories
              ? <><ChevronUp className="h-3 w-3" /> Mostrar menos</>
              : <><ChevronDown className="h-3 w-3" /> Mostrar mais ({categories.length - CATEGORIES_LIMIT} restantes)</>}
          </button>
        )}
      </FilterSection>

      <FilterSection title="Faixa de preço">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">Mínimo</p>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input type="number" min="0" value={draft.priceMin}
                onChange={(e) => setDraft((d) => ({ ...d, priceMin: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-2 text-xs focus:outline-none focus:border-primary" />
            </div>
          </div>
          <span className="text-gray-300 text-xs mt-4">—</span>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1">Máximo</p>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input type="number" min="0" value={draft.priceMax}
                onChange={(e) => setDraft((d) => ({ ...d, priceMax: e.target.value }))}
                placeholder="∞"
                className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-2 text-xs focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Localização">
        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Estado (UF)</p>
            <input type="text" value={draft.stateUF}
              onChange={(e) => setDraft((d) => ({ ...d, stateUF: e.target.value.toUpperCase().slice(0, 2) }))}
              placeholder="ex: SP" maxLength={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary uppercase" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Cidade</p>
            <input type="text" value={draft.city}
              onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
              placeholder="ex: São Paulo"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Bairro</p>
            <input type="text" value={draft.neighborhood}
              onChange={(e) => setDraft((d) => ({ ...d, neighborhood: e.target.value }))}
              placeholder="ex: Jardim América"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary" />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Avaliação mínima">
        <div className="space-y-1.5">
          {[0, 3, 4, 5].map((stars) => (
            <label key={stars} className="flex items-center gap-2 cursor-pointer py-0.5">
              <input type="radio" name="minRating" checked={draft.minRating === stars}
                onChange={() => setDraft((d) => ({ ...d, minRating: stars }))}
                className="accent-primary" />
              {stars === 0 ? (
                <span className="text-sm text-gray-700">Qualquer</span>
              ) : (
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-500 ml-0.5">ou mais</span>
                </span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Tipo">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer py-0.5">
            <input type="checkbox" checked={draft.communityOnly}
              onChange={(e) => setDraft((d) => ({ ...d, communityOnly: e.target.checked }))}
              className="accent-primary" />
            <span className="text-sm text-gray-700">Apenas comunitários</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-0.5">
            <input type="checkbox" checked={draft.acceptsOfferOnly}
              onChange={(e) => setDraft((d) => ({ ...d, acceptsOfferOnly: e.target.checked }))}
              className="accent-primary" />
            <span className="text-sm text-gray-700">Aceita proposta</span>
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Ordenar por">
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5">
              <input type="radio" name="sort" checked={draft.sort === opt.value}
                onChange={() => setDraft((d) => ({ ...d, sort: opt.value }))}
                className="accent-primary" />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
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

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Digite aqui o serviço que procura..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
                />
              </div>
              <button
                className="lg:hidden flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white cursor-pointer relative"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {(activeFilters || dirty) && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {draft.categoryUuids.length + (draft.priceMin ? 1 : 0) + (draft.priceMax ? 1 : 0) + (draft.city ? 1 : 0) + (draft.stateUF ? 1 : 0) + (draft.neighborhood ? 1 : 0) + (draft.minRating > 0 ? 1 : 0) + (draft.communityOnly ? 1 : 0) + (draft.acceptsOfferOnly ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Active applied filter chips */}
            {activeFilters && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {applied.categoryUuids.map((uuid) => {
                  const cat = categories.find((c) => c.uuid === uuid)
                  return cat ? (
                    <button key={uuid}
                      onClick={() => { setDraft((d) => ({ ...d, categoryUuids: d.categoryUuids.filter((u) => u !== uuid) })); setApplied((a) => ({ ...a, categoryUuids: a.categoryUuids.filter((u) => u !== uuid) })) }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 cursor-pointer">
                      {cat.name} <X className="h-3 w-3" />
                    </button>
                  ) : null
                })}
                {applied.priceMin && <button onClick={() => { setDraft((d) => ({ ...d, priceMin: '' })); setApplied((a) => ({ ...a, priceMin: '' })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">Mín R${applied.priceMin} <X className="h-3 w-3" /></button>}
                {applied.priceMax && <button onClick={() => { setDraft((d) => ({ ...d, priceMax: '' })); setApplied((a) => ({ ...a, priceMax: '' })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">Máx R${applied.priceMax} <X className="h-3 w-3" /></button>}
                {applied.stateUF && <button onClick={() => { setDraft((d) => ({ ...d, stateUF: '' })); setApplied((a) => ({ ...a, stateUF: '' })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">{applied.stateUF} <X className="h-3 w-3" /></button>}
                {applied.city && <button onClick={() => { setDraft((d) => ({ ...d, city: '' })); setApplied((a) => ({ ...a, city: '' })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">{applied.city} <X className="h-3 w-3" /></button>}
                {applied.neighborhood && <button onClick={() => { setDraft((d) => ({ ...d, neighborhood: '' })); setApplied((a) => ({ ...a, neighborhood: '' })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">{applied.neighborhood} <X className="h-3 w-3" /></button>}
                {applied.minRating > 0 && <button onClick={() => { setDraft((d) => ({ ...d, minRating: 0 })); setApplied((a) => ({ ...a, minRating: 0 })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full hover:bg-yellow-100 cursor-pointer">{applied.minRating}★+ <X className="h-3 w-3" /></button>}
                {applied.communityOnly && <button onClick={() => { setDraft((d) => ({ ...d, communityOnly: false })); setApplied((a) => ({ ...a, communityOnly: false })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full hover:bg-green-100 cursor-pointer">Comunitário <X className="h-3 w-3" /></button>}
                {applied.acceptsOfferOnly && <button onClick={() => { setDraft((d) => ({ ...d, acceptsOfferOnly: false })); setApplied((a) => ({ ...a, acceptsOfferOnly: false })) }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer">Aceita proposta <X className="h-3 w-3" /></button>}
                <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-1">Limpar tudo</button>
              </div>
            )}

            {/* Result count */}
            {total !== undefined && (
              <p className="text-xs text-gray-400 mb-5">
                {total.toLocaleString('pt-BR')} serviços encontrados
              </p>
            )}

            {isError && (
              <Alert variant="destructive" className="mb-5">
                Erro ao carregar serviços: {(error as { message?: string })?.message ?? 'Tente novamente.'}
              </Alert>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
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

            {!isLoading && services.length === 0 && (
              <div className="text-center py-24">
                <p className="text-gray-400 text-base">Nenhum serviço encontrado.</p>
                <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros.</p>
                {activeFilters && (
                  <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline cursor-pointer">
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            {services.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {services.map((service) => (
                  <ServiceCard key={service.uuid} service={service} />
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && !hasNextPage && services.length > 0 && (
              <p className="text-center text-xs text-gray-400 py-10">
                Você viu todos os {services.length.toLocaleString('pt-BR')} serviços
              </p>
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

export default function ServicesPage() {
  return (
    <Suspense>
      <ServicesContent />
    </Suspense>
  )
}
