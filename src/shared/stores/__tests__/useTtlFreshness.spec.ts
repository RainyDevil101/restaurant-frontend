import { describe, it, expect, vi } from 'vitest'
import { useTtlFreshness, type TtlFreshnessHandle } from '../useTtlFreshness'

function makeHandle(overrides: Partial<TtlFreshnessHandle> = {}): TtlFreshnessHandle {
  return {
    isStale: false,
    touch: vi.fn<() => void>(),
    ensureLoaded: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    refresh: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    invalidate: vi.fn<() => void>(),
    ...overrides,
  }
}

describe('useTtlFreshness', () => {
  it('loadAll ensures every store is loaded', async () => {
    const a = makeHandle()
    const b = makeHandle()
    const { loadAll } = useTtlFreshness([a, b])
    await loadAll()
    expect(a.ensureLoaded).toHaveBeenCalledTimes(1)
    expect(b.ensureLoaded).toHaveBeenCalledTimes(1)
  })

  it('refreshStale touches all stores but only refreshes the stale ones', async () => {
    const fresh = makeHandle({ isStale: false })
    const stale = makeHandle({ isStale: true })
    const { refreshStale } = useTtlFreshness([fresh, stale])
    await refreshStale()
    expect(fresh.touch).toHaveBeenCalledTimes(1)
    expect(stale.touch).toHaveBeenCalledTimes(1)
    expect(fresh.refresh).not.toHaveBeenCalled()
    expect(stale.refresh).toHaveBeenCalledTimes(1)
  })

  it('invalidateAndRefresh invalidates and refreshes all stores by default', async () => {
    const a = makeHandle()
    const b = makeHandle()
    const { invalidateAndRefresh } = useTtlFreshness([a, b])
    await invalidateAndRefresh()
    expect(a.invalidate).toHaveBeenCalledTimes(1)
    expect(b.invalidate).toHaveBeenCalledTimes(1)
    expect(a.refresh).toHaveBeenCalledTimes(1)
    expect(b.refresh).toHaveBeenCalledTimes(1)
  })

  it('invalidateAndRefresh targets only the passed stores when given', async () => {
    const a = makeHandle()
    const b = makeHandle()
    const { invalidateAndRefresh } = useTtlFreshness([a, b])
    await invalidateAndRefresh(a)
    expect(a.invalidate).toHaveBeenCalledTimes(1)
    expect(a.refresh).toHaveBeenCalledTimes(1)
    expect(b.invalidate).not.toHaveBeenCalled()
    expect(b.refresh).not.toHaveBeenCalled()
  })
})
