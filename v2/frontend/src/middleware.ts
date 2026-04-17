import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/services/new',
  '/services/',
  '/proposals',
  '/contracts',
  '/conversations',
  '/settings',
  '/calendar',
]

function isProtected(pathname: string): boolean {
  // Allow public services listing and detail (not dashboard services)
  if (pathname === '/services' || pathname.match(/^\/services\/[^/]+$/) && !pathname.includes('/edit')) {
    return false
  }
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isProtected(pathname)) {
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
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
