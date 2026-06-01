import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mockTables } from '@/shared/mocks'

export function useCurrentTable() {
  const route = useRoute()

  const table = computed(() => {
    const raw = route.params['id']
    const id = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '')
    return mockTables.find((t) => t.id === id) ?? null
  })

  return { table }
}
