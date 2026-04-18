'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Tag, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Service } from '@/types'
import { formatBRL, getInitials } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
  compact?: boolean
}

export function ServiceCard({ service, compact }: ServiceCardProps) {
  const images = service.images?.length
    ? service.images
    : service.image_url
    ? [service.image_url]
    : []

  const [imgIndex, setImgIndex] = useState(0)
  const [hovered, setHovered] = useState(false)

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImgIndex((i) => (i - 1 + images.length) % images.length)
  }
  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImgIndex((i) => (i + 1) % images.length)
  }

  if (compact) {
    return (
      <Link href={`/services/${service.uuid}`} className="block group">
        <div className="rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow">
          <div className="relative h-32 bg-gray-100 overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[0]}
                alt={service.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/10 to-primary/20">
                <Tag className="h-8 w-8 text-primary/40" />
              </div>
            )}
            {service.is_community && (
              <div className="absolute top-1.5 left-1.5">
                <Badge variant="success" className="text-[10px] px-1.5 py-0">Comunitário</Badge>
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">
              {service.category?.name}
            </p>
            <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
              {service.title}
            </h3>
            {(service.reviews_count ?? 0) > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-medium">{service.average_rating?.toFixed(1)}</span>
                <span className="text-[10px] text-gray-400">({service.reviews_count})</span>
              </div>
            )}
            {service.base_price ? (
              <p className="text-sm font-bold text-primary mt-1">{formatBRL(service.base_price)}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Sob consulta</p>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/services/${service.uuid}`} className="block group focus:outline-none h-full">
      <div
        className="rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          {images.length > 0 ? (
            <Image
              src={images[imgIndex]}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-primary/10 to-primary/20">
              <Tag className="h-12 w-12 text-primary/30" />
            </div>
          )}

          {service.is_community && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <Badge variant="success" className="text-[10px] px-2 py-0.5 rounded-full">Comunitário</Badge>
            </div>
          )}

          {/* Image navigation — only when multiple images and hovered */}
          {images.length > 1 && hovered && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-200 ${
                      i === imgIndex
                        ? 'w-4 h-1.5 bg-white'
                        : 'w-1.5 h-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
            {service.category?.name}
          </p>

          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2.5">
            {service.title}
          </h3>

          {/* Rating */}
          {(service.reviews_count ?? 0) > 0 ? (
            <div className="flex items-center gap-1 mb-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(service.average_rating ?? 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-100 text-gray-200'
                  }`}
                />
              ))}
              <span className="text-[10px] text-gray-500 ml-0.5">
                {service.average_rating?.toFixed(1)} ({service.reviews_count})
              </span>
            </div>
          ) : (
            <div className="mb-2.5" />
          )}

          {/* Provider + location */}
          <div className="mb-3 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarImage src={service.provider?.avatar_url} />
                <AvatarFallback className="text-[8px] bg-gray-100 text-gray-600">
                  {getInitials(service.provider?.first_name ?? 'U', service.provider?.last_name ?? 'U')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-gray-800 truncate">
                {service.provider?.first_name} {service.provider?.last_name}
              </span>
            </div>
            {service.provider?.address?.city && (
              <div className="flex items-center gap-1 mt-0.5 ml-6">
                <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 truncate">
                  {service.provider.address.city}
                  {service.provider.address.state ? `, ${service.provider.address.state}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Price — pushed to bottom */}
          <div className="border-t border-gray-100 pt-3 mt-auto">
            {service.base_price ? (
              <div>
                <span className="text-[10px] text-gray-400">A partir de</span>
                <p className="text-base font-bold text-gray-900 leading-tight">
                  {formatBRL(service.base_price)}
                </p>
              </div>
            ) : service.accepts_offer ? (
              <p className="text-sm font-semibold text-gray-700">Aceita proposta</p>
            ) : (
              <p className="text-sm text-gray-400">Sob consulta</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
