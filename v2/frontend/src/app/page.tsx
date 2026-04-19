'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Star, TrendingUp, MapPin } from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { ServiceCarousel } from '@/components/services/ServiceCarousel'
import { HeroCanvas } from '@/components/ui/hero-canvas'
import { CategorySelect } from '@/components/ui/category-select'
import { servicesApi, categoriesApi } from '@/lib/api'
import type { Service, Category, PaginatedResponse } from '@/types'

const QUICK_FILTERS = [
  { label: 'Melhores avaliações', icon: Star, href: '/services?sort=-average_rating' },
  { label: 'Mais relevantes', icon: TrendingUp, href: '/services' },
  { label: 'Próximos de mim', icon: MapPin, href: '/services?nearby=1' },
]

export default function LandingPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryUuid, setCategoryUuid] = useState('')

  /* ── Data ─────────────────────────────────────────────────────────── */
  const { data: latestData, isLoading: loadingLatest } = useQuery({
    queryKey: ['landing-latest'],
    queryFn: () =>
      servicesApi
        .list({ sort: '-created_at', page: 1 })
        .then((r) => r.data as PaginatedResponse<Service>),
  })

  const { data: priceData, isLoading: loadingPrice } = useQuery({
    queryKey: ['landing-price'],
    queryFn: () =>
      servicesApi
        .list({ sort: 'base_price', page: 1 })
        .then((r) => r.data as PaginatedResponse<Service>),
  })

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.list()
      const body = res.data
      if (Array.isArray(body)) return body as Category[]
      if (body?.data && Array.isArray(body.data)) return body.data as Category[]
      return []
    },
  })

  const latest = (latestData?.data ?? []).slice(0, 6)
  const popular = [...(latestData?.data ?? [])].reverse()
  const byPrice = priceData?.data ?? []

  /* ── Search ────────────────────────────────────────────────────────── */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryUuid) params.set('category', categoryUuid)
    router.push(`/services${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          minHeight: '440px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)',
        }}
      >
        {/* Interactive canvas */}
        <HeroCanvas />

        {/* Subtle vignette so text stays readable */}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
            Procure por serviços
          </h1>
          <p className="text-white/60 text-sm sm:text-base mb-8 max-w-md">
            Conecte-se com profissionais verificados perto de você
          </p>

          {/* Search bar — full container width */}
          <form
            onSubmit={handleSearch}
            className="flex items-stretch w-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/40"
            style={{ maxWidth: 'min(820px, calc(100vw - 2rem))' }}
          >
            {/* Custom category select */}
            <div className="flex-shrink-0 h-14">
              <CategorySelect
                categories={categories}
                value={categoryUuid}
                onChange={setCategoryUuid}
                className="h-14 rounded-none"
              />
            </div>

            {/* Search input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar serviços..."
              className="flex-1 px-5 py-0 h-14 text-gray-700 text-sm focus:outline-none bg-white placeholder:text-gray-400 min-w-0"
            />

            {/* Submit */}
            <button
              type="submit"
              className="flex-shrink-0 h-14 bg-primary text-white px-5 sm:px-8 text-sm font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>

          {/* Quick filter chips */}
          <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
            {QUICK_FILTERS.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-xs rounded-full border border-white/15 transition-colors cursor-pointer font-medium"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Carousels ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ServiceCarousel
          title="Recomendações com base nos seus últimos vistos"
          viewAllHref="/services?sort=-created_at"
          services={latest}
          isLoading={loadingLatest}
        />

        <ServiceCarousel
          title="Populares"
          viewAllHref="/services?sort=popular"
          services={popular}
          isLoading={loadingLatest}
        />

        <ServiceCarousel
          title="Recomendados"
          viewAllHref="/services?sort=base_price"
          services={byPrice}
          isLoading={loadingPrice}
        />
      </div>

      {/* ── Category map ──────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-bold text-gray-900 mb-6">Mapa de categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-3">
              {categories.map((cat) => (
                <Link
                  key={cat.uuid}
                  href={`/services?category=${cat.uuid}`}
                  className="text-sm text-gray-700 hover:text-primary font-medium transition-colors cursor-pointer hover:underline underline-offset-2"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-primary py-16 sm:py-20 text-white text-center">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Pronto para começar?</h2>
          <p className="text-white/75 text-sm sm:text-base mb-8 leading-relaxed">
            Crie sua conta e encontre o serviço ideal — ou comece a oferecer seus talentos hoje.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary text-sm font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
            >
              Criar minha conta <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/40 text-white text-sm font-medium rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
            >
              Explorar serviços
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="font-bold text-sm uppercase tracking-wider mb-3">Trabalho Amigo</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Onde talentos encontram oportunidades. Uma plataforma criada para valorizar
                quem trabalha e quem contrata — com transparência, segurança e propósito.
              </p>
            </div>

            {/* Plataforma */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Plataforma
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Explorar serviços', href: '/services' },
                  { label: 'Entrar', href: '/login' },
                  { label: 'Criar conta', href: '/register' },
                  { label: 'Dashboard', href: '/dashboard' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white active:text-gray-200 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Para prestadores */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Para prestadores
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Cadastre seus serviços', href: '/register?role=provider' },
                  { label: 'Gerenciar propostas', href: '/proposals' },
                  { label: 'Meus contratos', href: '/contracts' },
                  { label: 'Configurações', href: '/settings' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white active:text-gray-200 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Para contratantes */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Para contratantes
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Encontrar serviços', href: '/services' },
                  { label: 'Minhas propostas', href: '/proposals' },
                  { label: 'Histórico de contratos', href: '/contracts' },
                  { label: 'Meu perfil', href: '/settings' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white active:text-gray-200 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 order-2 sm:order-1">
              © {new Date().getFullYear()} Trabalho Amigo. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-500 italic order-1 sm:order-2 text-center sm:text-right max-w-sm">
              &ldquo;Todo grande trabalho começa com uma primeira conexão.&rdquo;
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
