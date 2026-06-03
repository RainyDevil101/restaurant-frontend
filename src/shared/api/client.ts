import { getToken } from '@/shared/session'

const BASE_URL = import.meta.env.VITE_API_URL

export interface ApiErrorBody {
  statusCode: number
  error: string
  message: string | string[]
}

export class ApiRequestError extends Error {
  readonly statusCode: number
  readonly body: ApiErrorBody | null

  constructor(message: string, statusCode: number, body: ApiErrorBody | null) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.body = body
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

function messageFrom(body: ApiErrorBody | null, status: number): string {
  if (!body) return `Error ${status}`
  return Array.isArray(body.message) ? body.message.join(', ') : body.message
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return undefined as T

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | null
    throw new ApiRequestError(messageFrom(errorBody, response.status), response.status, errorBody)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'PATCH', body, auth }),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: 'DELETE', auth }),
}
