'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, MapPin, Shield, Monitor, CreditCard } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/settings', label: 'Perfil', icon: User },
  { href: '/settings/address', label: 'Endereço', icon: MapPin },
  { href: '/settings/security', label: 'Segurança', icon: Shield },
  { href: '/settings/devices', label: 'Dispositivos', icon: Monitor },
  { href: '/settings/stripe', label: 'Pagamentos', icon: CreditCard, roles: ['provider'] },
] as const

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const filteredItems = navItems.filter(
    (item) => !('roles' in item) || (user?.role && item.roles.includes(user.role as 'provider')),
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie as preferências e informações da sua conta
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="md:w-48 flex-shrink-0">
          <div className="flex md:flex-col gap-1">
            {filteredItems.map((item) => {
              const isActive =
                item.href === '/settings'
                  ? pathname === '/settings'
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
