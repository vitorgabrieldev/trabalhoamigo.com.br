'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight, ArrowRight } from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { ServiceCard } from '@/components/services/ServiceCard'
import { servicesApi, categoriesApi } from '@/lib/api'
import type { Service, Category, PaginatedResponse } from '@/types'

function SectionRow({
  title,
  services,
  isLoading,
}: {
  title: string
  services: Service[]
  isLoading: boolean
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <Link
          href="/services"
          className="text-xs text-primary flex items-center gap-0.5 hover:underline"
        >
          Visualizar mais <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-60 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">Nenhum serviço disponível ainda.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {services.slice(0, 8).map((service) => (
            <div key={service.uuid} className="flex-shrink-0 w-48">
              <ServiceCard service={service} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryUuid, setCategoryUuid] = useState('')

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

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      categoriesApi.list().then((r) => r.data as { data: Category[] }),
  })

  const latest = latestData?.data ?? []
  const byPrice = priceData?.data ?? []
  const categories = categoriesData?.data ?? []

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

      {/* Hero */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          minHeight: '380px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20">
          <h1 className="text-3xl sm:text-5xl font-bold mb-8 tracking-tight">
            Procure por serviços
          </h1>

          <form
            onSubmit={handleSearch}
            className="flex items-stretch w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-xl"
          >
            <select
              value={categoryUuid}
              onChange={(e) => setCategoryUuid(e.target.value)}
              className="px-4 py-3 text-gray-600 text-sm border-r border-gray-200 focus:outline-none bg-white min-w-[130px]"
            >
              <option value="">Categorias</option>
              {categories.map((c) => (
                <option key={c.uuid} value={c.uuid}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O que você procura?"
              className="flex-1 px-4 py-3 text-gray-700 text-sm focus:outline-none bg-white"
            />
            <button
              type="submit"
              className="bg-primary text-white px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar Serviços</span>
            </button>
          </form>

          {categories.length > 0 && (
            <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
              <span className="text-white/50 text-xs">Ou filtre por:</span>
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.uuid}
                  href={`/services?category=${c.uuid}`}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full border border-white/15 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionRow
          title="Recomendações com base nos seus últimos vistos"
          services={latest}
          isLoading={loadingLatest}
        />
        <SectionRow
          title="Populares"
          services={[...latest].reverse()}
          isLoading={loadingLatest}
        />
        <SectionRow
          title="Recomendados"
          services={byPrice}
          isLoading={loadingPrice}
        />
      </div>

      {/* Category map */}
      {categories.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-6">
              Mapa de categorias e subcategorias
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((cat) => (
                <div key={cat.uuid}>
                  <Link
                    href={`/services?category=${cat.uuid}`}
                    className="text-xs font-semibold text-gray-800 hover:text-primary block mb-1 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-14 text-white text-center">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3">Pronto para começar?</h2>
          <p className="text-white/75 text-sm mb-7">
            Crie sua conta gratuitamente e encontre o serviço ideal ou comece a oferecer os seus.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/register/contractor"
              className="px-6 py-2.5 bg-white text-primary text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Criar conta grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="px-6 py-2.5 border border-white/40 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Ver serviços
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <p className="font-bold text-sm uppercase mb-3 tracking-tight">Trabalho Amigo</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Marketplace que conecta prestadores e contratantes de forma simples e segura.
              </p>
            </div>

            {[
              {
                title: 'Empresa',
                links: ['Sobre', 'Notícias', 'Serviços', 'FAQ', 'Termos de contrato', 'Fale conosco'],
              },
              {
                title: 'Usuário',
                links: ['Sobre', 'Notícias', 'Serviços', 'FAQ', 'Termos de contrato', 'Fale conosco'],
              },
              {
                title: 'Terceiros',
                links: ['Sobre', 'Notícias', 'Serviços', 'FAQ', 'Termos de contrato', 'Fale conosco'],
              },
              {
                title: 'Links Rápidos',
                links: ['Central de ajuda', 'Segunda opção', 'Terceira opção', 'Quarta opção'],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Trabalho Amigo. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/services" className="text-xs text-gray-500 hover:text-white transition-colors">
                Procurar serviços
              </Link>
              <Link href="/login" className="text-xs text-gray-500 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="text-xs text-gray-500 hover:text-white transition-colors">
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
