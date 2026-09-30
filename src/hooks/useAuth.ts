import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { getToken, setToken, clearToken } from '../api/client'
import type { UserProfile } from '../types/auth'

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

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setToken(data.access_token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/')
    },
  })

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password),
    onSuccess: (data) => {
      setToken(data.access_token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/')
    },
  })

  const logout = () => {
    clearToken()
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
  })

  return {
    user,
    userLoading,
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    logout,
    connectGoogle: connectGoogleMutation,
    disconnectGoogle: disconnectGoogleMutation,
    connectOutlook: connectOutlookMutation,
    disconnectOutlook: disconnectOutlookMutation,
    changePassword: changePasswordMutation,
    updateProfile: updateProfileMutation,
  }
}
