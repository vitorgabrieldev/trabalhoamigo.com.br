export type UserRole = 'provider' | 'contractor' | 'admin'
export type BankAccountType = 'checking' | 'savings'

export interface ProviderBankDetails {
  bank_holder_name: string
  bank_holder_document: string
  bank_name: string
  bank_code: string
  bank_agency: string
  bank_agency_digit?: string
  bank_account_number: string
  bank_account_digit?: string
  bank_account_type: BankAccountType
  bank_pix_key?: string
}

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
  payout_details_completed?: boolean
  bank_details?: ProviderBankDetails
  totp_enabled: boolean
  needs_onboarding?: boolean
  email_verified_at?: string | null
  google_linked?: boolean
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

export interface ServiceProvider {
  uuid: string
  first_name: string
  last_name: string
  avatar_url?: string
  stripe_ready?: boolean
  created_at?: string
  address?: Address
  average_rating?: number
  reviews_count?: number
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
  provider: ServiceProvider
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
  is_selected?: boolean
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
  | 'payment_held'
  | 'cancelled'

export interface ContractProposal {
  uuid: string
  description?: string
  offered_price: number
  schedule_type: ScheduleType
  provider_terms_accepted_at?: string
  slots: ProposalSlot[]
}

export interface ContractPayment {
  uuid: string
  amount: number
  status: string
  paid_at?: string
}

export interface ContractParty {
  uuid: string
  first_name: string
  last_name: string
  name: string
  avatar_url?: string
  email?: string
}

export interface ContractDispute {
  uuid: string
  status: string
  reason?: string
}

export interface Contract {
  uuid: string
  status: ContractStatus
  price: { amount: number; currency: string }
  agreed_price?: number
  provider_amount?: number
  scheduled_at?: string
  auto_release_at?: string
  provider_completed_at?: string
  contractor_confirmed_at?: string
  transferred_at?: string
  can_review?: boolean
  can_dispute?: boolean
  proposal?: ContractProposal
  service?: { uuid: string; title: string; category?: { uuid: string; name: string } }
  payment?: ContractPayment
  dispute?: ContractDispute
  provider: ContractParty
  contractor: ContractParty
  created_at: string
}

export interface Review {
  uuid: string
  stars: number
  comment?: string
  reviewer: User
  created_at: string
}

export interface MessageMedia {
  url: string
  type: 'image' | 'video' | 'document'
  name?: string
}

export interface Message {
  uuid: string
  body?: string
  sender: {
    uuid: string
    first_name: string
    last_name: string
    avatar_url?: string
    is_me: boolean
  }
  media?: MessageMedia[]
  read_at?: string
  created_at: string
}

export interface Conversation {
  uuid: string
  proposal_uuid: string
  proposal_status?: string
  service_title?: string
  service_uuid?: string
  other_party: Pick<User, 'uuid' | 'first_name' | 'last_name' | 'avatar_url'>
  unread_count: number
  last_message_at?: string
  last_message?: { body?: string; media?: MessageMedia[] }
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
  payout_details_completed: boolean
  message: string
  bank_details?: ProviderBankDetails
}

export interface CommunityAvailability {
  available: boolean
  user_count: number
  user_limit: number
  reason?: string
}

export interface Session {
  uuid: string
  device_name?: string
  device_type?: 'browser' | 'mobile' | 'tablet' | 'desktop' | string
  ip_address?: string
  last_active_at?: string
  is_current: boolean
}
