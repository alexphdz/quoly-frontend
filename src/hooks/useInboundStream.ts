import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BASE_URL, getToken } from '../api/client'
import * as inboundApi from '../api/inbound'
import type { InboundStreamEvent, UnreadCount } from '../types/inbound'
import { toast } from '../components/ui'
import { useNotifications } from './useNotifications'

export function useUnreadCount() {
  return useQuery<UnreadCount>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: inboundApi.getUnreadCount,
    refetchInterval: 60_000,
  })
}

export function useInboundStream() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('inbox')
  const { notify } = useNotifications()

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const url = `${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`
    const source = new EventSource(url)

    source.addEventListener('inbound_message', (event) => {
      const payload = JSON.parse(event.data) as InboundStreamEvent
      if (payload.rfq_id) {
        queryClient.invalidateQueries({ queryKey: ['inbound', payload.rfq_id] })
        queryClient.invalidateQueries({ queryKey: ['quotes', payload.rfq_id] })
        queryClient.invalidateQueries({ queryKey: ['rfq', payload.rfq_id] })
        queryClient.invalidateQueries({ queryKey: ['comparison', payload.rfq_id] })
      }
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })

      const title = t('notifications.newInboundTitle')
      const body = payload.subject || t('noSubject')
      toast(t('notifications.newInboundToast', { from: payload.from_email }), 'info')
      notify(title, body)
    })

    return () => source.close()
  }, [notify, queryClient, t])
}
