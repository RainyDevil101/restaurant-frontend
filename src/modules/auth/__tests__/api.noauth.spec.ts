import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Role } from '@/shared/types'
import { saveSession } from '@/shared/session'
import { requestLogin } from '../api'

const loginResponse = {
  accessToken: 'jwt-token',
  tokenType: 'Bearer',
  user: {
    id: 'u1',
    name: 'Ana',
    email: 'ana@subito.mx',
    role: Role.MESERO,
    active: true,
    isOwner: false,
  },
}

describe('requestLogin — no-auth path (real client + fetch)', () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

  beforeEach(() => {
    localStorage.clear()
    fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not attach the Authorization bearer even when a session exists', async () => {
    saveSession({ token: 'persisted-token', user: loginResponse.user })
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(loginResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await requestLogin('ana@subito.mx', '1234')

    expect(result).toEqual(loginResponse)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toContain('/auth/login')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ email: 'ana@subito.mx', credential: '1234' }))
    const headers = (init?.headers ?? {}) as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
  })
})
