import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, ApiRequestError } from '../client'
import { saveSession } from '@/shared/session'
import { Role } from '@/shared/types'

// client.ts captures BASE_URL at module-load time, so we read the same env value
// here rather than stubbing it (a post-import stub would have no effect).
const BASE_URL = import.meta.env.VITE_API_URL

const session = {
  token: 'jwt-token',
  user: {
    id: 'u1',
    name: 'Ana',
    email: 'ana@subito.mx',
    role: Role.MESERO,
    active: true,
    isOwner: false,
  },
}

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: () => Promise.resolve(body),
  }
}

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('builds the URL from VITE_API_URL + path', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }) as unknown as Response)
    await api.get('/products')
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/products`, expect.any(Object))
  })

  it('attaches Authorization Bearer header when a session token exists', async () => {
    saveSession(session)
    vi.mocked(fetch).mockResolvedValue(jsonResponse([]) as unknown as Response)
    await api.get('/products')
    const [, opts] = vi.mocked(fetch).mock.calls[0]!
    expect((opts as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer jwt-token',
    })
  })

  it('omits the Authorization header when no token exists', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse([]) as unknown as Response)
    await api.get('/products')
    const [, opts] = vi.mocked(fetch).mock.calls[0]!
    expect((opts as RequestInit).headers).not.toHaveProperty('Authorization')
  })

  it('omits the Authorization header when auth is false even with a token', async () => {
    saveSession(session)
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ accessToken: 't' }) as unknown as Response)
    await api.post('/auth/login', { email: 'x' }, false)
    const [, opts] = vi.mocked(fetch).mock.calls[0]!
    expect((opts as RequestInit).headers).not.toHaveProperty('Authorization')
  })

  it('sets JSON content-type and serializes the body on POST', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: '1' }) as unknown as Response)
    await api.post('/products', { name: 'Taco' })
    const [, opts] = vi.mocked(fetch).mock.calls[0]!
    const init = opts as RequestInit
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' })
    expect(init.body).toBe(JSON.stringify({ name: 'Taco' }))
  })

  it('does not set content-type or body when there is no body', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse([]) as unknown as Response)
    await api.get('/products')
    const [, opts] = vi.mocked(fetch).mock.calls[0]!
    const init = opts as RequestInit
    expect(init.headers).not.toHaveProperty('Content-Type')
    expect(init.body).toBeUndefined()
  })

  it('parses and returns the JSON response body', async () => {
    const payload = [{ id: '1', name: 'Taco' }]
    vi.mocked(fetch).mockResolvedValue(jsonResponse(payload) as unknown as Response)
    const result = await api.get('/products')
    expect(result).toEqual(payload)
  })

  it('returns undefined on a 204 No Content response without parsing', async () => {
    const json = vi.fn<() => Promise<unknown>>()
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204, json } as unknown as Response)
    const result = await api.delete('/products/1')
    expect(result).toBeUndefined()
    expect(json).not.toHaveBeenCalled()
  })

  it('throws ApiRequestError with status and message on a non-2xx response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        { statusCode: 400, error: 'Bad Request', message: 'Invalid product' },
        { ok: false, status: 400 },
      ) as unknown as Response,
    )
    await expect(api.post('/products', {})).rejects.toMatchObject({
      name: 'ApiRequestError',
      statusCode: 400,
      message: 'Invalid product',
    })
  })

  it('joins array error messages into a single string', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        { statusCode: 400, error: 'Bad Request', message: ['name required', 'price required'] },
        { ok: false, status: 400 },
      ) as unknown as Response,
    )
    await expect(api.post('/products', {})).rejects.toThrow('name required, price required')
  })

  it('falls back to "Error <status>" when the error body cannot be parsed', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response)
    const err = (await api.get('/products').catch((e) => e)) as ApiRequestError
    expect(err).toBeInstanceOf(ApiRequestError)
    expect(err.statusCode).toBe(500)
    expect(err.message).toBe('Error 500')
    expect(err.body).toBeNull()
  })

  it('clears the session on a 401 for an authenticated request', async () => {
    saveSession(session)
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        { statusCode: 401, error: 'Unauthorized', message: 'Token expired' },
        { ok: false, status: 401 },
      ) as unknown as Response,
    )
    await expect(api.get('/products')).rejects.toBeInstanceOf(ApiRequestError)
    expect(localStorage.getItem('subito.session')).toBeNull()
  })

  it('keeps the session on 401 when using postKeepingSession', async () => {
    saveSession(session)
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        { statusCode: 401, error: 'Unauthorized', message: 'Bad credentials' },
        { ok: false, status: 401 },
      ) as unknown as Response,
    )
    await expect(api.postKeepingSession('/orders/1/cancel', {})).rejects.toBeInstanceOf(
      ApiRequestError,
    )
    expect(localStorage.getItem('subito.session')).not.toBeNull()
  })
})
