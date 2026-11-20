import i18n, { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '../i18n'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const TOKEN_KEY = 'quoly_token'
const REFRESH_KEY = 'quoly_refresh'
const TOKEN_EXP_KEY = 'quoly_token_exp'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token)
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(TOKEN_EXP_KEY)
}

export function setTokenExpiry(expiresIn: number): void {
  localStorage.setItem(TOKEN_EXP_KEY, String(Date.now() + expiresIn * 1000))
}

export function tokenExpiresWithin(ms: number): boolean {
  const exp = localStorage.getItem(TOKEN_EXP_KEY)
  if (!exp) return false
  return parseInt(exp, 10) - Date.now() < ms
}

export class ApiError extends Error {
  status: number
  detail: string
  /** Raw backend error code (`detail` may already be translated for display). */
  code?: string
  /** Extra fields of the error body besides `detail` (e.g. `sent`, `total`, `failed_to` on a send failure). */
  extra: Record<string, unknown>

  constructor(status: number, detail: string, code?: string, extra: Record<string, unknown> = {}) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.code = code
    this.extra = extra
  }
}

/** Progress of a send that failed (`send_partially_failed` / `send_failed`), when the backend reports it. */
export interface SendFailureProgress {
  sent: number
  total: number
  failedTo: string | null
}

export function sendFailureProgress(error: unknown): SendFailureProgress | null {
  if (!(error instanceof ApiError)) return null
  const { sent, total, failed_to: failedTo } = error.extra
  if (typeof sent !== 'number' || typeof total !== 'number') return null
  return { sent, total, failedTo: typeof failedTo === 'string' && failedTo ? failedTo : null }
}

function errorExtra(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {}
  const rest: Record<string, unknown> = { ...(body as Record<string, unknown>) }
  delete rest.detail
  return rest
}

function apiErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail !== 'string') return JSON.stringify(detail ?? fallback)
  const translated = i18n.t(`apiErrors.${detail}`, { ns: 'common', defaultValue: '' })
  return translated || detail
}

/**
 * Active UI language as a bare primary tag (`es` | `en`). Read on every call so a
 * language switch applies to the very next request without a reload. The
 * backend uses it (via `Accept-Language`) for buyer-facing chat output.
 */
function uiLanguage(): Locale {
  const lng = (i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LOCALE).slice(0, 2)
  return (SUPPORTED_LOCALES as readonly string[]).includes(lng) ? (lng as Locale) : DEFAULT_LOCALE
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch {
    throw new ApiError(0, 'network_error')
  }
}

// Serializes concurrent refresh attempts so only one POST /auth/refresh fires.
let _refreshPromise: Promise<void> | null = null

async function _doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('no_refresh_token')
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': uiLanguage() },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  // 401 `invalid_refresh_token` (revoked, expired or already rotated) ends the
  // session: the caller clears the stored tokens and sends the user to /login.
  if (!res.ok) throw new Error('refresh_failed')
  const data = await res.json()
  setToken(data.access_token)
  // Refresh tokens rotate on every use: the old one is revoked, so the new one
  // must always replace it.
  if (data.refresh_token) setRefreshToken(data.refresh_token)
  if (data.expires_in) setTokenExpiry(data.expires_in)
}

function _refreshOnce(): Promise<void> {
  if (!_refreshPromise) {
    _refreshPromise = _doRefresh().finally(() => {
      _refreshPromise = null
    })
  }
  return _refreshPromise
}

/** Call on app mount: silently refreshes if the access token expires within 5 minutes. */
export async function ensureFreshToken(): Promise<void> {
  if (getToken() && getRefreshToken() && tokenExpiresWithin(5 * 60 * 1000)) {
    try {
      await _refreshOnce()
    } catch {
      // Silently ignore — the next real request will handle the 401.
    }
  }
}

async function handleResponse<T>(
  res: Response,
  hadAuth: boolean,
  retry: () => Promise<T>,
): Promise<T> {
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}))
    const detail = apiErrorDetail(body.detail, 'Unauthorized')
    if (hadAuth) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          await _refreshOnce()
          return retry()
        } catch {
          clearToken()
          clearRefreshToken()
          window.location.href = '/login'
        }
      } else {
        clearToken()
        window.location.href = '/login'
      }
    }
    // Unauthenticated 401s (login: invalid_credentials, email_not_confirmed,
    // account_locked) keep the raw code so pages can branch on it.
    throw new ApiError(401, detail, typeof body.detail === 'string' ? body.detail : undefined, errorExtra(body))
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = apiErrorDetail(body.detail, 'Request failed')
    throw new ApiError(res.status, detail, typeof body.detail === 'string' ? body.detail : undefined, errorExtra(body))
  }

  return res.json() as Promise<T>
}

// Never send a (possibly stale) bearer token on these: a 401 there must read as
// a login/code error, not as an expired session.
const PUBLIC_AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/confirm',
  '/auth/confirm/resend',
  '/auth/password/reset',
  '/auth/password/reset/confirm',
])

function buildHeaders(isJson = true, path?: string): { headers: HeadersInit; hadAuth: boolean } {
  const h: Record<string, string> = { 'Accept-Language': uiLanguage() }
  const token = getToken()
  const attachToken = !!token && !(path && PUBLIC_AUTH_PATHS.has(path))
  if (attachToken) h['Authorization'] = `Bearer ${token}`
  if (isJson) h['Content-Type'] = 'application/json'
  return { headers: h, hadAuth: attachToken }
}

export async function get<T>(path: string): Promise<T> {
  const { headers, hadAuth } = buildHeaders()
  const res = await apiFetch(`${BASE_URL}${path}`, { headers })
  return handleResponse<T>(res, hadAuth, () => get<T>(path))
}

export async function getBlob(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const { headers, hadAuth } = buildHeaders(false)
  const res = await apiFetch(`${BASE_URL}${path}`, { headers })
  if (res.status === 401) {
    if (hadAuth) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          await _refreshOnce()
          return getBlob(path)
        } catch {
          clearToken()
          clearRefreshToken()
          window.location.href = '/login'
        }
      } else {
        clearToken()
        window.location.href = '/login'
      }
    }
    const body = await res.json().catch(() => ({}))
    throw new ApiError(401, apiErrorDetail(body.detail, 'Unauthorized'))
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, apiErrorDetail(body.detail, 'Request failed'))
  }
  const disposition = res.headers.get('Content-Disposition')
  const match = disposition?.match(/filename="?([^"]+)"?/)
  return { blob: await res.blob(), filename: match ? match[1] : null }
}

export async function post<T>(path: string, body?: unknown, opts?: { signal?: AbortSignal }): Promise<T> {
  const { headers, hadAuth } = buildHeaders(true, path)
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: opts?.signal,
  })
  return handleResponse<T>(res, hadAuth, () => post<T>(path, body, opts))
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const { headers, hadAuth } = buildHeaders()
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res, hadAuth, () => patch<T>(path, body))
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const { headers, hadAuth } = buildHeaders()
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res, hadAuth, () => put<T>(path, body))
}

export async function del<T = void>(path: string): Promise<T> {
  const { headers, hadAuth } = buildHeaders()
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers,
  })
  if (res.status === 401) {
    if (hadAuth) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          await _refreshOnce()
          return del<T>(path)
        } catch {
          clearToken()
          clearRefreshToken()
          window.location.href = '/login'
        }
      } else {
        clearToken()
        window.location.href = '/login'
      }
    }
    const body = await res.json().catch(() => ({}))
    throw new ApiError(401, apiErrorDetail(body.detail, 'Unauthorized'))
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = apiErrorDetail(body.detail, 'Delete failed')
    throw new ApiError(res.status, detail)
  }
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const h: Record<string, string> = { 'Accept-Language': uiLanguage() }
  const token = getToken()
  const hadAuth = !!token
  if (token) h['Authorization'] = `Bearer ${token}`
  // No Content-Type — browser sets it with boundary for multipart

  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: h,
    body: formData,
  })
  return handleResponse<T>(res, hadAuth, () => postFormData<T>(path, formData))
}
