'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { getInitials } from '@/lib/utils'
import { authApi } from '@/lib/api'

export function PublicHeader() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {}
    clearAuth()
    router.push('/login')
  }

  const isLogin = pathname === '/login'
  const isRegister = pathname?.startsWith('/register')

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg tracking-tight text-gray-900 uppercase">
          Trabalho Amigo
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Procurar serviço
              </Link>
              <Link href="/proposals" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Listagem de proposta
              </Link>
              <Link href="/contracts" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Histórico de transações
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Ajuda
              </Link>
            </>
          ) : (
            <>
              <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Procurar serviço
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Ajuda
              </Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-primary text-white text-xs font-medium">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="px-2 py-3 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Olá, {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="block w-full text-center text-sm bg-primary text-white rounded-lg py-2 px-4 font-medium hover:bg-primary/90 transition-colors mb-2"
                >
                  Gerenciar conta
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/proposals">Propostas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contracts">Contratos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href={isRegister ? '/login' : '/register/provider'}
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                {isRegister ? 'Entrar' : 'Sou prestador'}
              </Link>
              <Link
                href={isLogin ? '/register' : '/login'}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-700 transition-colors"
              >
                {isLogin ? 'Cadastra-se' : 'Entrar'}
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link href="/services" className="block text-sm text-gray-700 hover:text-primary py-1" onClick={() => setMobileOpen(false)}>
            Procurar serviço
          </Link>
          {user && (
            <>
              <Link href="/proposals" className="block text-sm text-gray-700 hover:text-primary py-1" onClick={() => setMobileOpen(false)}>
                Propostas
              </Link>
              <Link href="/contracts" className="block text-sm text-gray-700 hover:text-primary py-1" onClick={() => setMobileOpen(false)}>
                Contratos
              </Link>
              <Link href="/dashboard" className="block text-sm text-gray-700 hover:text-primary py-1" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block text-sm text-red-600 py-1">
                Sair
              </button>
            </>
          )}
          {!user && (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/register/provider" className="text-center px-4 py-2 text-sm border border-gray-300 rounded-full" onClick={() => setMobileOpen(false)}>
                Sou prestador
              </Link>
              <Link href="/login" className="text-center px-4 py-2 text-sm bg-gray-900 text-white rounded-full" onClick={() => setMobileOpen(false)}>
                Entrar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
