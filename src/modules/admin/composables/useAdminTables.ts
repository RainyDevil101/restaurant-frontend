import { computed } from 'vue'
import {
  createTable as apiCreateTable,
  updateTable as apiUpdateTable,
  deleteTable as apiDeleteTable,
  type TableInput,
} from '@/shared/api/venue'
import { useTablesStore, useAreasStore } from '@/shared/stores/venueStores'
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness'
import { useDataTable } from '@/shared/stores/useDataTable'
import { PRODUCTS_PER_PAGE } from '../constants'
import type { Area, Table } from '@/shared/types'

export interface TableRow extends Table {
  areaName: string
}

export function useAdminTables() {
  const tablesStore = useTablesStore()
  const areasStore = useAreasStore()
  const { invalidateAndRefresh } = useTtlFreshness([tablesStore, areasStore])

  const loading = computed(() => tablesStore.loading || areasStore.loading)
  const error = computed(() => tablesStore.error ?? areasStore.error ?? '')
  const areas = computed<Area[]>(() => areasStore.items)

  const tableRows = computed<TableRow[]>(() =>
    tablesStore.items.map((table) => ({
      ...table,
      areaName: areasStore.byId(table.areaId)?.name ?? '—',
    })),
  )

  const table = useDataTable<TableRow>(tableRows, {
    sortBy: 'name',
    pageSize: PRODUCTS_PER_PAGE,
    sortAccessors: {
      name: (row) => row.name,
      areaName: (row) => row.areaName,
      capacity: (row) => row.capacity,
      status: (row) => row.status,
    },
    searchAccessor: (row) => row.name,
  })

  async function createTable(input: TableInput) {
    await apiCreateTable(input)
    await invalidateAndRefresh(tablesStore)
  }

  async function updateTable(id: string, input: Partial<TableInput>) {
    await apiUpdateTable(id, input)
    await invalidateAndRefresh(tablesStore)
  }

  async function removeTable(id: string) {
    await apiDeleteTable(id)
    await invalidateAndRefresh(tablesStore)
  }

  return {
    tables: table.rows,
    areas,
    search: table.search,
    loading,
    error,
    page: table.page,
    pageSize: table.pageSize,
    totalPages: table.totalPages,
    fillerCount: table.fillerCount,
    sortBy: table.sortBy,
    sortDir: table.sortDir,
    toggleSort: table.toggleSort,
    setPage: table.setPage,
    reload: () => invalidateAndRefresh(tablesStore, areasStore),
    createTable,
    updateTable,
    removeTable,
  }
}
