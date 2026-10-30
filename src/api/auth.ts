import { del, get, patch, post, postFormData, put } from './client'
import type { TokenResponse, UserProfile } from '../types/auth'

export function register(email: string, password: string): Promise<TokenResponse> {
  return post<TokenResponse>('/auth/register', { email, password })
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return post<TokenResponse>('/auth/login', { email, password })
}

export function requestPasswordReset(email: string): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/password/reset', { email })
}

export function confirmPasswordReset(accessToken: string, newPassword: string): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/password/reset/confirm', {
    access_token: accessToken,
    new_password: newPassword,
  })
}

export function resendConfirmation(email: string): Promise<{ status: string }> {
  return post<{ status: string }>('/auth/confirm/resend', { email })
}

export function getMe(): Promise<UserProfile> {
  return get<UserProfile>('/auth/me')
}

export function updateMe(data: Pick<UserProfile, 'default_email_locale'>): Promise<UserProfile> {
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
