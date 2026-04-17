'use client'

import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface CategorySelectProps {
  categories: Category[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = 'Categorias',
  className,
}: CategorySelectProps) {
  return (
    <RadixSelect.Root value={value || '__all__'} onValueChange={(v) => onChange(v === '__all__' ? '' : v)}>
      <RadixSelect.Trigger
        className={cn(
          'flex items-center gap-2 px-4 py-0 h-full text-sm text-gray-600 bg-white',
          'border-r border-gray-200 min-w-[140px] sm:min-w-[160px]',
          'hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer',
          'focus:outline-none select-none',
          'data-[state=open]:bg-gray-50',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon asChild>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-auto transition-transform duration-200 data-[state=open]:rotate-180" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={2}
          className={cn(
            'z-[200] min-w-[200px] max-h-72 overflow-y-auto rounded-xl bg-white',
            'shadow-xl shadow-black/10 border border-gray-100',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2',
          )}
        >
          <RadixSelect.Viewport className="py-1.5">
            {/* All option */}
            <RadixSelect.Item
              value="__all__"
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-600 cursor-pointer select-none outline-none data-[highlighted]:bg-primary/5 data-[highlighted]:text-primary transition-colors"
            >
              <RadixSelect.ItemText>Todas as categorias</RadixSelect.ItemText>
              <RadixSelect.ItemIndicator className="ml-auto">
                <Check className="h-3.5 w-3.5 text-primary" />
              </RadixSelect.ItemIndicator>
            </RadixSelect.Item>

            {categories.length > 0 && (
              <div className="my-1 border-t border-gray-100" />
            )}

            {categories.map((cat) => (
              <RadixSelect.Item
                key={cat.uuid}
                value={cat.uuid}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-700 cursor-pointer select-none outline-none data-[highlighted]:bg-primary/5 data-[highlighted]:text-primary transition-colors"
              >
                <RadixSelect.ItemText>{cat.name}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
