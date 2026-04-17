'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categoriesApi } from '@/lib/api'
import type { Category } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

interface ServiceFiltersProps {
  onFiltersChange: (filters: {
    search: string
    category_uuid: string
    sort: string
  }) => void
}

export function ServiceFilters({ onFiltersChange }: ServiceFiltersProps) {
  const [search, setSearch] = useState('')
  const [categoryUuid, setCategoryUuid] = useState('')
  const [sort, setSort] = useState('created_at')
  const [categories, setCategories] = useState<Category[]>([])
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    onFiltersChange({
      search: debouncedSearch,
      category_uuid: categoryUuid,
      sort,
    })
  }, [debouncedSearch, categoryUuid, sort, onFiltersChange])

  const clearFilters = () => {
    setSearch('')
    setCategoryUuid('')
    setSort('created_at')
  }

  const hasFilters = search || categoryUuid || sort !== 'created_at'

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category */}
      <Select value={categoryUuid} onValueChange={setCategoryUuid}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.uuid} value={cat.uuid}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Mais recentes</SelectItem>
          <SelectItem value="base_price">Menor preço</SelectItem>
          <SelectItem value="-base_price">Maior preço</SelectItem>
          <SelectItem value="-average_rating">Melhor avaliados</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
