import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { saveSession, clearSession } from '@/shared/session'
import { Role } from '@/shared/types'

// socket.ts derives the origin from VITE_API_URL (minus a trailing /api), so we
// read the same env value here rather than stubbing it after import.
const ORIGIN = (import.meta.env.VITE_API_URL as string).replace(/\/api\/?$/, '')
const ORDERS_URL = `${ORIGIN}/orders`

const fakeSocket = { id: 'socket-1' } as unknown as import('socket.io-client').Socket

const { io } = vi.hoisted(() => ({
  io: vi.fn<typeof import('socket.io-client').io>(() => fakeSocket),
}))

vi.mock('socket.io-client', () => ({ io }))

import { connectOrdersSocket } from '../socket'

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

describe('connectOrdersSocket', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearSession()
  })

  it('connects to the /orders namespace on the origin (VITE_API_URL minus /api)', () => {
    connectOrdersSocket()
    expect(io).toHaveBeenCalledWith(ORDERS_URL, expect.any(Object))
  })

  it('uses the websocket transport', () => {
    connectOrdersSocket()
    const [, opts] = io.mock.calls[0]!
    expect(opts!.transports).toEqual(['websocket'])
  })

  it('passes the session token in the handshake auth', () => {
    saveSession(session)
    connectOrdersSocket()
    const [, opts] = io.mock.calls[0]!
    expect(opts!.auth).toEqual({ token: 'jwt-token' })
  })

  it('passes an empty auth object when there is no session token', () => {
    connectOrdersSocket()
    const [, opts] = io.mock.calls[0]!
    expect(opts!.auth).toEqual({})
  })

  it('returns the socket created by io()', () => {
    const socket = connectOrdersSocket()
    expect(socket).toBe(fakeSocket)
  })
})
