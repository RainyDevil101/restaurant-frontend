import { ref, computed, onMounted } from 'vue'
import {
  listTables,
  listAreas,
  createTable as apiCreateTable,
  updateTable as apiUpdateTable,
  deleteTable as apiDeleteTable,
  type TableInput,
} from '@/shared/api/venue'
import { ApiRequestError } from '@/shared/api/client'
import type { Area, Table } from '@/shared/types'

export function useAdminTables() {
  const search = ref('')
  const items = ref<Table[]>([])
  const areas = ref<Area[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [tbls, ars] = await Promise.all([listTables(), listAreas()])
      items.value = tbls
      areas.value = ars
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudieron cargar las mesas.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const tables = computed(() => {
    const q = search.value.trim().toLowerCase()
    return items.value
      .map((t) => ({
        ...t,
        areaName: areas.value.find((a) => a.id === t.areaId)?.name ?? '—',
      }))
      .filter((t) => !q || t.name.toLowerCase().includes(q))
  })

  async function createTable(input: TableInput) {
    await apiCreateTable(input)
    await load()
  }

  async function updateTable(id: string, input: Partial<TableInput>) {
    await apiUpdateTable(id, input)
    await load()
  }

  async function removeTable(id: string) {
    await apiDeleteTable(id)
    await load()
  }

  return {
    tables,
    areas,
    search,
    loading,
    error,
    reload: load,
    createTable,
    updateTable,
    removeTable,
  }
}
