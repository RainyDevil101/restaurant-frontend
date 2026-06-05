import { ref, onMounted } from 'vue'
import { listTables, listAreas } from '@/shared/api/venue'
import { ApiRequestError } from '@/shared/api/client'
import type { Table } from '@/shared/types'

export interface TableWithArea extends Table {
  areaName: string
}

export function useTables() {
  const tables = ref<TableWithArea[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [rawTables, areas] = await Promise.all([listTables(), listAreas()])
      const areaNameById = new Map(areas.map((a) => [a.id, a.name]))
      tables.value = rawTables.map((t) => ({
        ...t,
        areaName: areaNameById.get(t.areaId) ?? '',
      }))
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar las mesas.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { tables, loading, error, reload: load }
}
