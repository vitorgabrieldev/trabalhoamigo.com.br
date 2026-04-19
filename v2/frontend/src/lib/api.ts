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
    cpf?: string
    phone?: string
    address?: object
  }) => api.post('/auth/register', data),

  completeOnboarding: (role: 'provider' | 'contractor') =>
    api.post('/auth/onboarding', { role }),

  logout: () => api.post('/auth/logout'),

  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),

  getSessions: () => api.get('/auth/sessions'),

  renameSession: (uuid: string, device_name: string) =>
    api.patch(`/auth/sessions/${uuid}`, { device_name }),

  revokeSession: (uuid: string) => api.delete(`/auth/sessions/${uuid}`),

  revokeAllSessions: () => api.delete('/auth/sessions'),

  verifyGoogleTotp: (temp_token: string, code: string) =>
    api.post('/auth/google/verify-totp', { temp_token, code }),

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

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  deleteAccount: () => api.delete('/me'),

  stripeOnboarding: (data: {
    bank_holder_name: string
    bank_holder_document: string
    bank_name: string
    bank_code: string
    bank_agency: string
    bank_agency_digit?: string
    bank_account_number: string
    bank_account_digit?: string
    bank_account_type: 'checking' | 'savings'
    bank_pix_key?: string
  }) => api.post('/me/stripe/onboarding', data),

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
    'filter[provider_uuid]'?: string
    'filter[exclude_uuid]'?: string
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
    images?: File[]
  }) => {
    const form = new FormData()
    form.append('title', data.title)
    form.append('description', data.description)
    form.append('category_uuid', data.category_uuid)
    if (data.base_price !== undefined) {
      form.append('base_price', data.base_price.toString())
    }
    form.append('accepts_offer', data.accepts_offer ? '1' : '0')
    form.append('is_community', data.is_community ? '1' : '0')
    if (data.image_url) {
      form.append('image_url', data.image_url)
    }
    for (const file of data.images ?? []) {
      form.append('images[]', file)
    }

    return api.post('/services', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  update: (uuid: string, data: Partial<{
    title: string
    description: string
    category_uuid: string
    base_price: number
    accepts_offer: boolean
    is_community: boolean
    image_url: string
    images: File[]
    status: string
  }>) => {
    if (!data.images || data.images.length === 0) {
      return api.patch(`/services/${uuid}`, data)
    }

    const form = new FormData()
    if (data.title !== undefined) {
      form.append('title', data.title)
    }
    if (data.description !== undefined) {
      form.append('description', data.description)
    }
    if (data.category_uuid !== undefined) {
      form.append('category_uuid', data.category_uuid)
    }
    if (data.base_price !== undefined) {
      form.append('base_price', data.base_price.toString())
    }
    if (data.accepts_offer !== undefined) {
      form.append('accepts_offer', data.accepts_offer ? '1' : '0')
    }
    if (data.is_community !== undefined) {
      form.append('is_community', data.is_community ? '1' : '0')
    }
    if (data.image_url !== undefined) {
      form.append('image_url', data.image_url)
    }
    if (data.status !== undefined) {
      form.append('status', data.status)
    }
    form.append('_method', 'PATCH')
    for (const file of data.images) {
      form.append('images[]', file)
    }

    return api.post(`/services/${uuid}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

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
      any_time_dates?: string[]
      slots?: Array<{
        date: string
        time_type: 'specific_time' | 'all_day'
        start_time?: string
        end_time?: string
      }>
    },
  ) => api.post(`/proposals/services/${serviceUuid}`, data),

  accept: (uuid: string, slot_uuid?: string) =>
    api.post(`/proposals/${uuid}/accept`, { terms_accepted: true, ...(slot_uuid ? { slot_uuid } : {}) }),

  reject: (uuid: string) => api.post(`/proposals/${uuid}/reject`),

  cancel: (uuid: string) => api.post(`/proposals/${uuid}/cancel`),

  confirmSchedule: (uuid: string) => api.post(`/proposals/${uuid}/confirm-schedule`),

  getCheckout: (uuid: string) =>
    api.get<{ url: string }>(`/proposals/${uuid}/checkout`),

  pay: (uuid: string, session_id: string) =>
    api.post(`/proposals/${uuid}/pay`, { session_id }),
}

// ─── Contracts ───────────────────────────────────────────────────────────────

export const contractsApi = {
  list: (status?: string) => api.get('/contracts', { params: status ? { 'filter[status]': status } : {} }),

  get: (uuid: string) => api.get(`/contracts/${uuid}`),

  providerComplete: (uuid: string, completionNote: string) =>
    api.post(`/contracts/${uuid}/provider-complete`, { completion_note: completionNote }),

  contractorConfirm: (uuid: string, completionNote: string) =>
    api.post(`/contracts/${uuid}/contractor-confirm`, { completion_note: completionNote }),

  dispute: (uuid: string, reason: string) =>
    api.post(`/contracts/${uuid}/dispute`, { reason }),

  review: (uuid: string, stars: number, comment?: string) =>
    api.post(`/contracts/${uuid}/reviews`, { stars, ...(comment ? { comment } : {}) }),
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export const messagingApi = {
  listConversations: () => api.get('/conversations'),

  getMessages: (uuid: string) => api.get(`/conversations/${uuid}/messages`),

  sendMessage: (uuid: string, body: string, files?: File[]) => {
    if (files && files.length > 0) {
      const form = new FormData()
      if (body) form.append('body', body)
      for (const file of files) form.append('files[]', file)
      return api.post(`/conversations/${uuid}/messages`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.post(`/conversations/${uuid}/messages`, { body })
  },
}
