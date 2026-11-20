import { del, get, patch, post, postFormData, put } from './client'
import type { TokenResponse, UserProfile } from '../types/auth'

export function register(email: string, password: string): Promise<TokenResponse> {
  return post<TokenResponse>('/auth/register', { email, password })
}

/** Confirms a new account with the 6-digit code sent by email; returns a full session. */
export function confirmEmail(email: string, code: string): Promise<TokenResponse> {
  return post<TokenResponse>('/auth/confirm', { email, code })
}

export function resendConfirmation(email: string): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/confirm/resend', { email })
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return post<TokenResponse>('/auth/login', { email, password })
}

/** Revokes the refresh tokens server-side. Callers clear the local session regardless of the outcome. */
export function logout(): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/logout')
}

export function requestPasswordReset(email: string): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/password/reset', { email })
}

export function confirmPasswordReset(email: string, code: string, newPassword: string): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/password/reset/confirm', {
    email,
    code,
    new_password: newPassword,
  })
}

export function getMe(): Promise<UserProfile> {
  return get<UserProfile>('/auth/me')
}

type UpdateMePayload = Partial<
  Pick<UserProfile, 'default_email_locale' | 'default_send_channel' | 'first_name' | 'last_name' | 'account_type' | 'company_name'>
>

export function updateMe(data: UpdateMePayload): Promise<UserProfile> {
  return patch<UserProfile>('/auth/me', data)
}

export function getGoogleConnectUrl(): Promise<{ authorize_url: string }> {
  return get<{ authorize_url: string }>('/auth/google/connect')
}

export function disconnectGoogle(): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/google/disconnect')
}

export function getOutlookConnectUrl(): Promise<{ authorize_url: string }> {
  return get<{ authorize_url: string }>('/auth/outlook/connect')
}

export function disconnectOutlook(): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/outlook/disconnect')
}

export function uploadAvatar(blob: Blob): Promise<UserProfile> {
  const form = new FormData()
  form.append('file', blob, blob.type === 'image/jpeg' ? 'avatar.jpg' : 'avatar.webp')
  return postFormData<UserProfile>('/auth/me/avatar', form)
}

export function deleteAvatar(): Promise<UserProfile> {
  return del<UserProfile>('/auth/me/avatar')
}

export function changePassword(currentPassword: string, newPassword: string): Promise<{ status: string }> {
  return put<{ status: string }>('/auth/password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

/** Starts an email change: the backend sends a 6-digit code to the NEW address. */
export function requestEmailChange(newEmail: string): Promise<{ status: string }> {
  return put<{ status: string }>('/auth/email', { new_email: newEmail })
}

export function confirmEmailChange(code: string): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/email/confirm', { code })
}
