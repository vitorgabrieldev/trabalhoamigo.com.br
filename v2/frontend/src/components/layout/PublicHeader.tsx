'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { getInitials } from '@/lib/utils'
import { authApi } from '@/lib/api'
import { Logo } from '@/components/ui/logo'

export function PublicHeader() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {}
    clearAuth()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="cursor-pointer">
          <Logo />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Logged-in nav links */}
              <nav className="hidden lg:flex items-center gap-5 mr-2">
                <Link
                  href="/services"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Serviços
                </Link>
                <Link
                  href="/proposals"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Propostas
                </Link>
                <Link
                  href="/contracts"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Contratos
                </Link>
              </nav>

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none cursor-pointer">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
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
                    className="block w-full text-center text-sm bg-primary text-white rounded-lg py-2 px-4 font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors mb-2 cursor-pointer"
                  >
                    Gerenciar conta
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/proposals" className="cursor-pointer">Propostas</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/contracts" className="cursor-pointer">Contratos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 active:bg-primary/80 transition-colors cursor-pointer shadow-sm shadow-primary/25"
            >
              Começar agora <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-4 space-y-2">
          <Link
            href="/services"
            className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setMobileOpen(false)}
          >
            Serviços
          </Link>
          {user ? (
            <>
              <Link
                href="/proposals"
                className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                Propostas
              </Link>
              <Link
                href="/contracts"
                className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                Contratos
              </Link>
              <Link
                href="/dashboard"
                className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                Sair
              </button>
            </>
          ) : (
            <div className="pt-2">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
