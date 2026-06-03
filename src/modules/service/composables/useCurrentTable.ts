import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { listTables } from '@/shared/api/venue'
import { ApiRequestError } from '@/shared/api/client'
import type { Table } from '@/shared/types'

export function useCurrentTable() {
  const route = useRoute()
  const tables = ref<Table[]>([])
  const loading = ref(false)
  const error = ref('')

  const tableId = computed(() => {
    const raw = route.params['id']
    return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '')
  })

  const table = computed(() => tables.value.find((t) => t.id === tableId.value) ?? null)

  async function load() {
    loading.value = true
    error.value = ''
    try {
      tables.value = await listTables()
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudo cargar la mesa.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { table, tableId, loading, error, reload: load }
}
