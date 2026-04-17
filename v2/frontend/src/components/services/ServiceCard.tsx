import Link from 'next/link'
import Image from 'next/image'
import { Star, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Service } from '@/types'
import { formatBRL, getInitials } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
  compact?: boolean
}

export function ServiceCard({ service, compact }: ServiceCardProps) {
  if (compact) {
    return (
      <Link href={`/services/${service.uuid}`} className="block group">
        <div className="rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow">
          <div className="relative h-32 bg-gray-100 overflow-hidden">
            {service.image_url ? (
              <Image
                src={service.image_url}
                alt={service.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/20">
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/20">
            <Tag className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {service.is_community && (
          <div className="absolute top-2 left-2">
            <Badge variant="success" className="text-xs">Comunitário</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">
          {service.category?.name}
        </p>

        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {service.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={service.provider?.avatar_url} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(service.provider?.first_name ?? 'U', service.provider?.last_name ?? 'U')}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-600">
            {service.provider?.first_name} {service.provider?.last_name}
          </span>
        </div>

        {(service.reviews_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{service.average_rating?.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({service.reviews_count} avaliações)</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          {service.base_price ? (
            <div>
              <span className="text-xs text-gray-400">A partir de</span>
              <p className="text-base font-bold text-primary">{formatBRL(service.base_price)}</p>
            </div>
          ) : service.accepts_offer ? (
            <Badge variant="secondary">Aceita Proposta</Badge>
          ) : (
            <span className="text-sm text-gray-500">Sob consulta</span>
          )}
        </div>

        <Button size="sm" asChild>
          <Link href={`/services/${service.uuid}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
