import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Track if we're currently refreshing to avoid loops
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

// Response interceptor: handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        isRefreshing = false
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        const { access_token, refresh_token } = res.data
        setTokens(access_token, refresh_token)
        onRefreshed(access_token)
        isRefreshing = false

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }
        return api(originalRequest)
      } catch {
        isRefreshing = false
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string, totp_code?: string) =>
    api.post('/auth/login', { email, password, ...(totp_code ? { totp_code } : {}) }),

  register: (data: {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
    role: 'provider' | 'contractor'
    cpf?: string
    phone?: string
    address?: object
  }) => api.post('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),

  getSessions: () => api.get('/auth/sessions'),

  revokeSession: (uuid: string) => api.delete(`/auth/sessions/${uuid}`),

  revokeAllSessions: () => api.delete('/auth/sessions'),

  setupTotp: () => api.post('/auth/totp/setup'),

  confirmTotp: (code: string) => api.post('/auth/totp/confirm', { code }),

  disableTotp: (code: string) => api.post('/auth/totp/disable', { code }),
}

// ─── Me ────────────────────────────────────────────────────────────────────

export const meApi = {
  getProfile: () => api.get('/me'),

  updateProfile: (data: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    whatsapp?: string
    avatar_url?: string
  }) => api.patch('/me', data),

  updateAddress: (data: {
    zip_code: string
    street: string
    neighborhood: string
    number: string
    complement?: string
    city: string
    state: string
  }) => api.put('/me/address', data),

  stripeOnboarding: () => api.post('/me/stripe/onboarding'),

  stripeStatus: () => api.get('/me/stripe/status'),

  getCalendar: (year: number, month: number) =>
    api.get('/me/calendar', { params: { year, month } }),
}

// ─── Categories ─────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => api.get('/categories'),
}

// ─── Services ───────────────────────────────────────────────────────────────

export const servicesApi = {
  list: (params?: {
    'filter[search]'?: string
    'filter[category_uuid]'?: string
    sort?: string
    page?: number
  }) => api.get('/services', { params }),

  get: (uuid: string) => api.get(`/services/${uuid}`),

  getReviews: (uuid: string, page?: number) =>
    api.get(`/services/${uuid}/reviews`, { params: { page } }),

  listMy: () => api.get('/services/my'),

  checkCommunityAvailability: () => api.get('/services/community/availability'),

  create: (data: {
    title: string
    description: string
    category_uuid: string
    base_price?: number
    accepts_offer: boolean
    is_community: boolean
    image_url?: string
  }) => api.post('/services', data),

  update: (uuid: string, data: Partial<{
    title: string
    description: string
    category_uuid: string
    base_price: number
    accepts_offer: boolean
    is_community: boolean
    image_url: string
    status: string
  }>) => api.patch(`/services/${uuid}`, data),

  delete: (uuid: string) => api.delete(`/services/${uuid}`),
}

// ─── Users ──────────────────────────────────────────────────────────────────

export const usersApi = {
  getPublicProfile: (uuid: string) => api.get(`/users/${uuid}`),

  getMonthSchedule: (providerUuid: string, year: number, month: number) =>
    api.get(`/schedule/${providerUuid}/month`, { params: { year, month } }),

  getWeekSchedule: (providerUuid: string, date: string) =>
    api.get(`/schedule/${providerUuid}/week`, { params: { date } }),
}

// ─── Proposals ──────────────────────────────────────────────────────────────

export const proposalsApi = {
  listSent: () => api.get('/proposals/sent'),

  listReceived: () => api.get('/proposals/received'),

  get: (uuid: string) => api.get(`/proposals/${uuid}`),

  create: (
    serviceUuid: string,
    data: {
      offered_price: number
      description?: string
      schedule_type: 'specific_slots' | 'any_time_on_day' | 'to_be_arranged'
      any_time_date?: string
      slots?: Array<{
        date: string
        time_type: 'specific_time' | 'all_day'
        start_time?: string
        end_time?: string
      }>
    },
  ) => api.post(`/proposals/services/${serviceUuid}`, data),

  accept: (uuid: string, slot_uuid?: string) =>
    api.post(`/proposals/${uuid}/accept`, slot_uuid ? { slot_uuid } : {}),

  reject: (uuid: string) => api.post(`/proposals/${uuid}/reject`),

  cancel: (uuid: string) => api.post(`/proposals/${uuid}/cancel`),

  confirmSchedule: (uuid: string) => api.post(`/proposals/${uuid}/confirm-schedule`),
}

// ─── Contracts ───────────────────────────────────────────────────────────────

export const contractsApi = {
  list: (status?: string) => api.get('/contracts', { params: status ? { 'filter[status]': status } : {} }),

  get: (uuid: string) => api.get(`/contracts/${uuid}`),

  providerComplete: (uuid: string) => api.post(`/contracts/${uuid}/provider-complete`),

  contractorConfirm: (uuid: string) => api.post(`/contracts/${uuid}/contractor-confirm`),

  dispute: (uuid: string, reason: string) =>
    api.post(`/contracts/${uuid}/dispute`, { reason }),

  review: (uuid: string, stars: number, comment?: string) =>
    api.post(`/contracts/${uuid}/reviews`, { stars, ...(comment ? { comment } : {}) }),
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export const messagingApi = {
  listConversations: () => api.get('/conversations'),

  getMessages: (uuid: string) => api.get(`/conversations/${uuid}/messages`),

  sendMessage: (uuid: string, body: string) =>
    api.post(`/conversations/${uuid}/messages`, { body }),
}
