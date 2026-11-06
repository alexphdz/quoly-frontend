export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number | null
  refresh_token: string | null
}

export interface UserProfile {
  id: string
  email: string
  google_connected: boolean
  outlook_connected: boolean
  default_email_locale: 'en' | 'es'
  default_send_channel?: 'google' | 'outlook' | null
  avatar_url: string | null
  first_name: string | null
  last_name: string | null
  account_type: 'personal' | 'organization'
  company_name: string | null
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}
