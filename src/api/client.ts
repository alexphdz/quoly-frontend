import i18n from '../i18n'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const TOKEN_KEY = 'quoly_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
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

async function handleResponse<T>(res: Response, hadAuth: boolean): Promise<T> {
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}))
    const detail = apiErrorDetail(body.detail, 'Unauthorized')
    // Expired/invalid session on protected calls → sign out. Login/register 401 stays on page.
    if (hadAuth) {
      clearToken()
      window.location.href = '/login'
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

const PUBLIC_AUTH_PATHS = new Set(['/auth/login', '/auth/register'])

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
  return handleResponse<T>(res, hadAuth)
}

export async function getBlob(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const { headers, hadAuth } = buildHeaders(false)
  const res = await apiFetch(`${BASE_URL}${path}`, { headers })
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}))
    const detail = apiErrorDetail(body.detail, 'Unauthorized')
    if (hadAuth) {
      clearToken()
      window.location.href = '/login'
    }
    throw new ApiError(401, detail)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, apiErrorDetail(body.detail, 'Request failed'))
  }
  const disposition = res.headers.get('Content-Disposition')
  const match = disposition?.match(/filename="?([^"]+)"?/)
  return { blob: await res.blob(), filename: match ? match[1] : null }
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const { headers, hadAuth } = buildHeaders(true, path)
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res, hadAuth)
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const { headers, hadAuth } = buildHeaders()
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res, hadAuth)
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const { headers, hadAuth } = buildHeaders()
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res, hadAuth)
}

export async function del<T = void>(path: string): Promise<T> {
  const { headers, hadAuth } = buildHeaders()
  const res = await apiFetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers,
  })
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}))
    const detail = apiErrorDetail(body.detail, 'Unauthorized')
    if (hadAuth) {
      clearToken()
      window.location.href = '/login'
    }
    throw new ApiError(401, detail)
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
  return handleResponse<T>(res, hadAuth)
}
