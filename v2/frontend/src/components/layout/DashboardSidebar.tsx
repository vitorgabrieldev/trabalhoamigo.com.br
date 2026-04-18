'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ScrollText,
  Calendar,
  MessageCircle,
  Settings,
  CreditCard,
  Shield,
  MapPin,
  Search,
  X,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: Array<'provider' | 'contractor' | 'admin'>
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: '/services',
    label: 'Buscar Serviços',
    icon: <Search className="h-4 w-4" />,
  },
  {
    href: '/dashboard/services',
    label: 'Meus Serviços',
    icon: <Briefcase className="h-4 w-4" />,
    roles: ['provider'],
  },
  {
    href: '/proposals',
    label: 'Propostas',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    href: '/contracts',
    label: 'Contratos',
    icon: <ScrollText className="h-4 w-4" />,
  },
  {
    href: '/calendar',
    label: 'Calendário',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    href: '/conversations',
    label: 'Mensagens',
    icon: <MessageCircle className="h-4 w-4" />,
  },
]

const settingsItems: NavItem[] = [
  { href: '/settings', label: 'Perfil', icon: <Settings className="h-4 w-4" /> },
  { href: '/settings/address', label: 'Endereço', icon: <MapPin className="h-4 w-4" /> },
  { href: '/settings/security', label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
  {
    href: '/settings/stripe',
    label: 'Pagamentos',
    icon: <CreditCard className="h-4 w-4" />,
    roles: ['provider'],
  },
]

interface DashboardSidebarProps {
  onClose?: () => void
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const filteredNav = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role as 'provider' | 'contractor' | 'admin')),
  )

  const filteredSettings = settingsItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role as 'provider' | 'contractor' | 'admin')),
  )

  return (
    <aside className="flex flex-col h-full bg-white border-r w-64">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Briefcase className="h-5 w-5" />
          <span className="text-sm">Trabalho Amigo</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Principal
        </p>
        {filteredNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <div className="pt-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Configurações
          </p>
          {filteredSettings.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
