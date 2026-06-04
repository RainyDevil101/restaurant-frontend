import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

export type SortDir = 'asc' | 'desc'

export type SortAccessor<T> = (item: T) => string | number

export interface DataTableOptions<T> {
  sortBy: string
  sortDir?: SortDir
  pageSize: number
  search?: string
  sortAccessors: Record<string, SortAccessor<T>>
  searchAccessor?: (item: T) => string
}

export interface DataTable<T> {
  rows: ComputedRef<T[]>
  page: Ref<number>
  pageSize: Ref<number>
  search: Ref<string>
  totalItems: ComputedRef<number>
  totalPages: ComputedRef<number>
  fillerCount: ComputedRef<number>
  sortBy: Ref<string>
  sortDir: Ref<SortDir>
  toggleSort: (field: string) => void
  setPage: (n: number) => void
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' })
}

export function useDataTable<T>(source: Ref<T[]>, opts: DataTableOptions<T>): DataTable<T> {
  const sortBy = ref(opts.sortBy)
  const sortDir = ref<SortDir>(opts.sortDir ?? 'asc')
  const page = ref(1)
  const pageSize = ref(opts.pageSize)
  const search = ref(opts.search ?? '')

  const searchAccessor = opts.searchAccessor

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q || !searchAccessor) return source.value
    return source.value.filter((item) => searchAccessor(item).toLowerCase().includes(q))
  })

  const sorted = computed(() => {
    const accessor = opts.sortAccessors[sortBy.value]
    if (!accessor) return filtered.value
    const direction = sortDir.value === 'asc' ? 1 : -1
    return [...filtered.value].sort((a, b) => compareValues(accessor(a), accessor(b)) * direction)
  })

  const totalItems = computed(() => sorted.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))

  const rows = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return sorted.value.slice(start, start + pageSize.value)
  })

  const fillerCount = computed(() => Math.max(0, pageSize.value - rows.value.length))

  function setPage(n: number): void {
    const clamped = Math.min(Math.max(1, n), totalPages.value)
    page.value = clamped
  }

  function toggleSort(field: string): void {
    if (sortBy.value === field) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortDir.value = 'asc'
    }
  }

  watch(
    [sortBy, sortDir, search, pageSize],
    () => {
      page.value = 1
    },
    { flush: 'sync' },
  )

  watch(
    totalPages,
    (max) => {
      if (page.value > max) page.value = max
    },
    { flush: 'sync' },
  )

  return {
    rows,
    page,
    pageSize,
    search,
    totalItems,
    totalPages,
    fillerCount,
    sortBy,
    sortDir,
    toggleSort,
    setPage,
  }
}
