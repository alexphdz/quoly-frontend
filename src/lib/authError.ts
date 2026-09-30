import type { TFunction } from 'i18next'
import { ApiError, BASE_URL } from '../api/client'

/** Maps login/register API failures to user-facing copy (i18n). */
export function authErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    if (error.detail === 'network_error') {
      return t('apiErrors.network_error', { baseUrl: BASE_URL })
    }
    const key = `apiErrors.${error.detail}` as const
    const translated = t(key, { defaultValue: '' })
    if (translated) return translated
    return error.detail
  }
  return t('auth.connectError')
}
