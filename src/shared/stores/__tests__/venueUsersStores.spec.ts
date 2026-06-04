import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createResourceStore, DEFAULT_TTL_MS } from '../createResourceStore'
import type { Area, Table } from '@/shared/types'
import type { User } from '@/modules/auth/store'
import { Role } from '@/shared/types'

const areas: Area[] = [
  { id: 'a1', name: 'Comedor' },
  { id: 'a2', name: 'Bar' },
]

const tables: Table[] = [
  { id: 't1', name: 'Mesa 1', capacity: 4, status: 'libre', areaId: 'a1' },
  { id: 't2', name: 'Mesa 2', capacity: 2, status: 'ocupada', areaId: 'a1' },
  { id: 't3', name: 'Barra 1', capacity: 1, status: 'por_cobrar', areaId: 'a2' },
]

const users: User[] = [
  { id: 'u1', name: 'Ana', email: 'ana@subito.mx', role: Role.MESERO, active: true },
  { id: 'u2', name: 'Carlos', email: 'carlos@subito.mx', role: Role.CAJERO, active: false },
]

describe('venue stores TTL freshness', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('areas store starts stale and becomes fresh after refresh', async () => {
    const store = createResourceStore<Area>(() => Promise.resolve(areas))
    expect(store.isStale.value).toBe(true)
    await store.refresh()
    expect(store.isStale.value).toBe(false)
  })

  it('tables store goes stale after TTL and invalidate', async () => {
    const store = createResourceStore<Table>(() => Promise.resolve(tables))
    await store.refresh()
    vi.advanceTimersByTime(DEFAULT_TTL_MS + 1)
    store.touch()
    expect(store.isStale.value).toBe(true)
    await store.refresh()
    store.invalidate()
    expect(store.isStale.value).toBe(true)
  })

  it('users store ensureLoaded fetches once when fresh', async () => {
    const fetcher = vi.fn<() => Promise<User[]>>(() => Promise.resolve(users))
    const store = createResourceStore<User>(fetcher)
    await store.ensureLoaded()
    await store.ensureLoaded()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})

describe('venue cross-store derivations', () => {
  it('resolves table-count per area from the tables list', async () => {
    const areasStore = createResourceStore<Area>(() => Promise.resolve(areas))
    const tablesStore = createResourceStore<Table>(() => Promise.resolve(tables))
    await Promise.all([areasStore.refresh(), tablesStore.refresh()])
    const countFor = (areaId: string) =>
      tablesStore.items.value.filter((table) => table.areaId === areaId).length
    expect(countFor('a1')).toBe(2)
    expect(countFor('a2')).toBe(1)
  })

  it('resolves area name for a table via byId', async () => {
    const areasStore = createResourceStore<Area>(() => Promise.resolve(areas))
    const tablesStore = createResourceStore<Table>(() => Promise.resolve(tables))
    await Promise.all([areasStore.refresh(), tablesStore.refresh()])
    const firstTable = tablesStore.items.value[0]
    expect(firstTable).toBeDefined()
    expect(areasStore.byId(firstTable!.areaId)?.name).toBe('Comedor')
  })
})
