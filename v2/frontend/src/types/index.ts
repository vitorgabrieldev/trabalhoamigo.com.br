export type UserRole = 'provider' | 'contractor' | 'admin'

export interface User {
  uuid: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  avatar_url?: string
  phone?: string
  whatsapp?: string
  cpf?: string
  stripe_onboarding_completed?: boolean
  totp_enabled: boolean
  created_at: string
  address?: Address
  average_rating?: number
  reviews_count?: number
}

export interface Address {
  zip_code: string
  street: string
  neighborhood: string
  number: string
  complement?: string
  city: string
  state: string
}

export interface Category {
  uuid: string
  name: string
  slug: string
  description?: string
  icon_url?: string
}

export interface Service {
  uuid: string
  title: string
  description: string
  base_price?: number
  accepts_offer: boolean
  is_community: boolean
  image_url?: string
  images?: string[]
  status: 'active' | 'inactive' | 'pending'
  average_rating?: number
  reviews_count?: number
  category: Category
  provider: User
  created_at: string
  updated_at: string
}

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type ScheduleType = 'specific_slots' | 'any_time_on_day' | 'to_be_arranged'
export type TimeType = 'specific_time' | 'all_day'

export interface ProposalSlot {
  uuid: string
  date: string
  time_type: TimeType
  start_time?: string
  end_time?: string
}

export interface Proposal {
  uuid: string
  status: ProposalStatus
  payment_status?: string
  schedule_type: ScheduleType
  offered_price?: number
  provider_amount?: number
  description?: string
  any_time_date?: string
  slots: ProposalSlot[]
  service: Service
  contractor: User
  provider: User
  created_at: string
  updated_at: string
}

export type ContractStatus =
  | 'active'
  | 'provider_completed'
  | 'contractor_confirmed'
  | 'auto_completed'
  | 'disputed'
  | 'cancelled'

export interface Contract {
  uuid: string
  status: ContractStatus
  price: number
  scheduled_at?: string
  auto_release_at?: string
  provider_completed_at?: string
  contractor_confirmed_at?: string
  dispute_reason?: string
  proposal: Proposal
  provider: User
  contractor: User
  created_at: string
  updated_at: string
}

export interface Review {
  uuid: string
  stars: number
  comment?: string
  reviewer: User
  created_at: string
}

export interface Message {
  uuid: string
  body: string
  sender: User
  read_at?: string
  created_at: string
}

export interface Conversation {
  uuid: string
  proposal_uuid: string
  other_party: User
  unread_count: number
  last_message_at?: string
  last_message?: Message
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first?: string
    last?: string
    prev?: string
    next?: string
  }
}

export interface CalendarEvent {
  date: string
  slots: ProposalSlot[]
  contracts: Contract[]
}

export interface StripeStatus {
  stripe_onboarding_completed: boolean
  message: string
}

export interface CommunityAvailability {
  available: boolean
  user_count: number
  user_limit: number
  reason?: string
}

export interface Session {
  uuid: string
  device?: string
  ip_address?: string
  last_active_at?: string
  is_current: boolean
}
