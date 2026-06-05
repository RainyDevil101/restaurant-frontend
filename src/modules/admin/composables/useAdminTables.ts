import { computed } from 'vue'
import {
  createTable as apiCreateTable,
  updateTable as apiUpdateTable,
  deleteTable as apiDeleteTable,
  type TableInput,
} from '@/shared/api/venue'
import { useTablesStore, useAreasStore } from '@/shared/stores/venueStores'
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness'
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
    tables: tableRows,
    areas,
    loading,
    error,
    reload: () => invalidateAndRefresh(tablesStore, areasStore),
    createTable,
    updateTable,
    removeTable,
  }
}
