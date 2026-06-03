import { ref, computed, onMounted } from 'vue'
import {
  listAreas,
  listTables,
  createArea as apiCreateArea,
  updateArea as apiUpdateArea,
  deleteArea as apiDeleteArea,
  type AreaInput,
} from '@/shared/api/venue'
import { ApiRequestError } from '@/shared/api/client'
import type { Area, Table } from '@/shared/types'

export function useAreas() {
  const items = ref<Area[]>([])
  const tables = ref<Table[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [areas, tbls] = await Promise.all([listAreas(), listTables()])
      items.value = areas
      tables.value = tbls
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudieron cargar las áreas.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const areas = computed(() =>
    items.value.map((a) => ({
      ...a,
      tableCount: tables.value.filter((t) => t.areaId === a.id).length,
    })),
  )

  async function createArea(input: AreaInput) {
    await apiCreateArea(input)
    await load()
  }

  async function updateArea(id: string, input: Partial<AreaInput>) {
    await apiUpdateArea(id, input)
    await load()
  }

  async function removeArea(id: string) {
    await apiDeleteArea(id)
    await load()
  }

  return { areas, loading, error, reload: load, createArea, updateArea, removeArea }
}
