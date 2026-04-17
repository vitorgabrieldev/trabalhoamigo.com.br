'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Service } from '@/types'
import { formatBRL } from '@/lib/utils'

/* ─── Individual slide card ─────────────────────────────────────────────── */
function SlideCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.uuid}`}
      className="block group cursor-pointer focus:outline-none"
    >
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg active:shadow-sm transition-all duration-200">
        {/* Image */}
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          {service.image_url ? (
            <Image
              src={service.image_url}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/20">
              <Tag className="h-10 w-10 text-primary/30" />
            </div>
          )}
          {service.is_community && (
            <div className="absolute top-2 left-2">
              <Badge variant="success" className="text-[10px] px-1.5">Comunitário</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
            {service.category?.name}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
            {service.title}
          </h3>

          {(service.reviews_count ?? 0) > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(service.average_rating ?? 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
              <span className="text-[10px] text-gray-500 ml-0.5">({service.reviews_count})</span>
            </div>
          )}

          <p className="text-sm font-bold text-primary mt-1">
            {service.base_price
              ? formatBRL(service.base_price)
              : service.accepts_offer
              ? 'Aceita proposta'
              : 'Sob consulta'}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* ─── Loading skeletons ─────────────────────────────────────────────────── */
function SlideSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-5 w-1/4 mt-1" />
      </div>
    </div>
  )
}

/* ─── Main carousel ─────────────────────────────────────────────────────── */
interface ServiceCarouselProps {
  title: string
  viewAllHref: string
  services: Service[]
  isLoading?: boolean
}

export function ServiceCarousel({
  title,
  viewAllHref,
  services,
  isLoading,
}: ServiceCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    dragFree: true,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
    },
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const items = isLoading ? Array.from({ length: 5 }) : services

  if (!isLoading && services.length === 0) return null

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-primary hover:text-primary/80 active:text-primary/60 transition-colors cursor-pointer underline-offset-2 hover:underline"
          >
            Visualizar mais
          </Link>
          {/* Nav arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">
          {items.map((service, i) => (
            <div
              key={isLoading ? i : (service as Service).uuid}
              className="flex-none w-[calc(100%-24px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-11px)]"
            >
              {isLoading ? <SlideSkeleton /> : <SlideCard service={service as Service} />}
            </div>
          ))}
        </div>
      </div>

      {/* Bullets + mobile arrows */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {/* Mobile prev */}
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="sm:hidden p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer mr-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Dots */}
        {scrollSnaps.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Ir para slide ${i + 1}`}
            className={`rounded-full transition-all duration-200 cursor-pointer ${
              i === selectedIndex
                ? 'bg-primary w-5 h-2'
                : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
            }`}
          />
        ))}

        {/* Mobile next */}
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="sm:hidden p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ml-1"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
