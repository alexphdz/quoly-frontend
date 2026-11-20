import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import {
  getToken, setToken, clearToken,
  setRefreshToken, clearRefreshToken, setTokenExpiry,
} from '../api/client'
import type { TokenResponse, UserProfile } from '../types/auth'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const isAuthenticated = !!getToken()

  const { data: user, isLoading: userLoading } = useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    retry: false,
  })

  const storeSession = (data: TokenResponse) => {
    setToken(data.access_token)
    if (data.refresh_token) setRefreshToken(data.refresh_token)
    if (data.expires_in) setTokenExpiry(data.expires_in)
    queryClient.invalidateQueries({ queryKey: ['me'] })
  }

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      storeSession(data)
      navigate('/')
    },
  })

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password),
    onSuccess: (data, { email }) => {
      // Signup returns no session until the email is confirmed with the code
      // sent to it: go to the confirmation screen instead of faking a session
      // with an empty token.
      if (data.access_token) {
        storeSession(data)
        navigate('/')
      } else {
        navigate('/confirm-email', { state: { email } })
      }
    },
  })

  const confirmEmailMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.confirmEmail(email, code),
    onSuccess: (data) => {
      storeSession(data)
      navigate('/')
    },
  })

  const requestPasswordResetMutation = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  })

  const confirmPasswordResetMutation = useMutation({
    mutationFn: ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) =>
      authApi.confirmPasswordReset(email, code, newPassword),
  })

  const resendConfirmationMutation = useMutation({
    mutationFn: (email: string) => authApi.resendConfirmation(email),
  })

  // Best-effort server-side revocation of the refresh tokens; the local
  // session is cleared whether or not the call succeeds.
  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Already signed out server-side, offline, or the token expired: nothing to do.
    }
    clearToken()
    clearRefreshToken()
    queryClient.clear()
    navigate('/login')
  }

  const connectGoogleMutation = useMutation({
    mutationFn: authApi.getGoogleConnectUrl,
    onSuccess: (data) => {
      window.location.href = data.authorize_url
    },
  })

  const disconnectGoogleMutation = useMutation({
    mutationFn: authApi.disconnectGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const connectOutlookMutation = useMutation({
    mutationFn: authApi.getOutlookConnectUrl,
    onSuccess: (data) => {
      window.location.href = data.authorize_url
    },
  })

  const disconnectOutlookMutation = useMutation({
    mutationFn: authApi.disconnectOutlook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateMe,
    // Write the returned profile straight into the cache (like the avatar
    // mutations) so callers that navigate right after saving — e.g. the
    // onboarding gate, which redirects while user.first_name is empty — see the
    // fresh value immediately instead of a stale one from a pending refetch.
    onSuccess: (profile) => {
      queryClient.setQueryData(['me'], profile)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
  })

  const requestEmailChangeMutation = useMutation({
    mutationFn: (newEmail: string) => authApi.requestEmailChange(newEmail),
  })

  const confirmEmailChangeMutation = useMutation({
    mutationFn: (code: string) => authApi.confirmEmailChange(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (blob: Blob) => authApi.uploadAvatar(blob),
    onSuccess: (profile) => {
      queryClient.setQueryData(['me'], profile)
    },
  })

  const removeAvatarMutation = useMutation({
    mutationFn: authApi.deleteAvatar,
    onSuccess: (profile) => {
      queryClient.setQueryData(['me'], profile)
    },
  })

  return {
    user,
    userLoading,
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    confirmEmail: confirmEmailMutation,
    requestPasswordReset: requestPasswordResetMutation,
    confirmPasswordReset: confirmPasswordResetMutation,
    resendConfirmation: resendConfirmationMutation,
    logout,
    connectGoogle: connectGoogleMutation,
    disconnectGoogle: disconnectGoogleMutation,
    connectOutlook: connectOutlookMutation,
    disconnectOutlook: disconnectOutlookMutation,
    changePassword: changePasswordMutation,
    requestEmailChange: requestEmailChangeMutation,
    confirmEmailChange: confirmEmailChangeMutation,
    updateProfile: updateProfileMutation,
    uploadAvatar: uploadAvatarMutation,
    removeAvatar: removeAvatarMutation,
  }
}
