import i18n from '../i18n'

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

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function apiErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail !== 'string') return JSON.stringify(detail ?? fallback)
  const translated = i18n.t(`apiErrors.${detail}`, { ns: 'common', defaultValue: '' })
  return translated || detail
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!res.ok) throw new Error('refresh_failed')
  const data = await res.json()
  setToken(data.access_token)
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
    throw new ApiError(401, detail)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = apiErrorDetail(body.detail, 'Request failed')
    throw new ApiError(res.status, detail)
  }

  return res.json() as Promise<T>
}

const PUBLIC_AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/password/reset',
  '/auth/password/reset/confirm',
  '/auth/confirm/resend',
])

function buildHeaders(isJson = true, path?: string): { headers: HeadersInit; hadAuth: boolean } {
  const h: Record<string, string> = {}
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
  const h: Record<string, string> = {}
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
