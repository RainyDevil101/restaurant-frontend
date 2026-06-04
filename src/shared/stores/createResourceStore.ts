import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { ApiRequestError } from '@/shared/api/client'

export const DEFAULT_TTL_MS = 5 * 60 * 1000

interface ResourceEntity {
  id: string
}

export interface ResourceStoreOptions {
  ttlMs?: number
  errorMessage?: string
}

export interface ResourceStore<T> {
  items: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  lastFetchedAt: Ref<number | null>
  isStale: ComputedRef<boolean>
  byId: (id: string) => T | undefined
  touch: () => void
  ensureLoaded: () => Promise<void>
  refresh: () => Promise<void>
  invalidate: () => void
}

export function createResourceStore<T extends ResourceEntity>(
  fetcher: () => Promise<T[]>,
  options: ResourceStoreOptions = {},
): ResourceStore<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
  const fallbackMessage = options.errorMessage ?? 'No se pudieron cargar los datos.'

  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref<number | null>(null)
  const tick = ref(0)

  const isStale = computed(() => {
    void tick.value
    if (lastFetchedAt.value === null) return true
    return Date.now() - lastFetchedAt.value > ttlMs
  })

  function touch(): void {
    tick.value += 1
  }

  const index = computed(() => {
    const map = new Map<string, T>()
    for (const item of items.value) map.set(item.id, item)
    return map
  })

  function byId(id: string): T | undefined {
    return index.value.get(id)
  }

  async function refresh(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await fetcher()
      lastFetchedAt.value = Date.now()
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : fallbackMessage
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded(): Promise<void> {
    if (loading.value) return
    touch()
    if (items.value.length > 0 && !isStale.value) return
    await refresh()
  }

  function invalidate(): void {
    lastFetchedAt.value = null
  }

  return {
    items,
    loading,
    error,
    lastFetchedAt,
    isStale,
    byId,
    touch,
    ensureLoaded,
    refresh,
    invalidate,
  }
}
