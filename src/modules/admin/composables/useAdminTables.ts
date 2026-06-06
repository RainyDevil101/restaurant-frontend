import { computed } from 'vue'
import {
  createTable as apiCreateTable,
  updateTable as apiUpdateTable,
  deleteTable as apiDeleteTable,
  type TableInput,
} from '@/shared/api/venue'
import { useTablesStore } from '@/shared/stores/venueStores'
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness'
import type { Table } from '@/shared/types'

export type TableRow = Table

export function useAdminTables() {
  const tablesStore = useTablesStore()
  const { invalidateAndRefresh } = useTtlFreshness([tablesStore])

  const loading = computed(() => tablesStore.loading)
  const error = computed(() => tablesStore.error ?? '')

  const tableRows = computed<TableRow[]>(() => tablesStore.items)

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
    loading,
    error,
    reload: () => invalidateAndRefresh(tablesStore),
    createTable,
    updateTable,
    removeTable,
  }
}
