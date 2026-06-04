import { computed } from 'vue'
import {
  createArea as apiCreateArea,
  updateArea as apiUpdateArea,
  deleteArea as apiDeleteArea,
  type AreaInput,
} from '@/shared/api/venue'
import { useAreasStore, useTablesStore } from '@/shared/stores/venueStores'
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness'
import { useDataTable } from '@/shared/stores/useDataTable'
import { PRODUCTS_PER_PAGE } from '../constants'
import type { Area } from '@/shared/types'

export interface AreaRow extends Area {
  tableCount: number
}

export function useAreas() {
  const areasStore = useAreasStore()
  const tablesStore = useTablesStore()
  const { invalidateAndRefresh } = useTtlFreshness([areasStore, tablesStore])

  const loading = computed(() => areasStore.loading || tablesStore.loading)
  const error = computed(() => areasStore.error ?? tablesStore.error ?? '')

  const areaRows = computed<AreaRow[]>(() =>
    areasStore.items.map((area) => ({
      ...area,
      tableCount: tablesStore.items.filter((table) => table.areaId === area.id).length,
    })),
  )

  const table = useDataTable<AreaRow>(areaRows, {
    sortBy: 'name',
    pageSize: PRODUCTS_PER_PAGE,
    sortAccessors: {
      name: (row) => row.name,
      tableCount: (row) => row.tableCount,
    },
    searchAccessor: (row) => row.name,
  })

  async function createArea(input: AreaInput) {
    await apiCreateArea(input)
    await invalidateAndRefresh(areasStore)
  }

  async function updateArea(id: string, input: Partial<AreaInput>) {
    await apiUpdateArea(id, input)
    await invalidateAndRefresh(areasStore)
  }

  async function removeArea(id: string) {
    await apiDeleteArea(id)
    await invalidateAndRefresh(areasStore)
  }

  return {
    areas: table.rows,
    loading,
    error,
    page: table.page,
    pageSize: table.pageSize,
    totalPages: table.totalPages,
    sortBy: table.sortBy,
    sortDir: table.sortDir,
    toggleSort: table.toggleSort,
    setPage: table.setPage,
    reload: () => invalidateAndRefresh(areasStore, tablesStore),
    createArea,
    updateArea,
    removeArea,
  }
}
