import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  // Also store in cookie for middleware
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1, sameSite: 'lax' })
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove('needs_onboarding')
}

export function setNeedsOnboarding(value: boolean): void {
  if (value) {
    Cookies.set('needs_onboarding', '1', { expires: 1, sameSite: 'lax' })
  } else {
    Cookies.remove('needs_onboarding')
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1]))
    const exp = payload.exp
    if (!exp) return false
    return Date.now() >= exp * 1000
  } catch {
    return true
  }
}
