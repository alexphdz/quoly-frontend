import { useCallback } from 'react'

export function useNotifications() {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported'
    if (Notification.permission !== 'default') return Notification.permission
    return Notification.requestPermission()
  }, [])

  const notify = useCallback((title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification(title, { body })
  }, [])

  return { requestPermission, notify }
}
