import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Service } from '@/types'
import { formatBRL, getInitials } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
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
        {/* Category */}
        <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">
          {service.category?.name}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {service.description}
        </p>

        {/* Provider */}
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

        {/* Rating */}
        {(service.reviews_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{service.average_rating?.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({service.reviews_count} avaliações)</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Price */}
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
