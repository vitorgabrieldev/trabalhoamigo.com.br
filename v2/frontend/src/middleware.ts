import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GUEST_ONLY = ['/', '/login', '/register']

const PROTECTED_PATHS = [
  '/dashboard',
  '/proposals',
  '/contracts',
  '/conversations',
  '/settings',
  '/calendar',
  '/services/new',
]

function isProtected(pathname: string): boolean {
  if (pathname === '/services' || (pathname.match(/^\/services\/[^/]+$/) && !pathname.includes('/edit'))) {
    return false
  }
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Logged in users visiting guest-only pages → redirect to dashboard
  if (token && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Unauthenticated users visiting protected pages → redirect to login
  if (!token && isProtected(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/services/new',
    '/services/:uuid/edit',
    '/proposals/:path*',
    '/contracts/:path*',
    '/conversations/:path*',
    '/settings/:path*',
    '/calendar/:path*',
  ],
}
