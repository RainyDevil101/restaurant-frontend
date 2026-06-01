import { ref, computed } from 'vue'
import { mockTables, mockAreas } from '@/shared/mocks'

export function useAdminTables() {
  const search = ref('')
  const tables = computed(() => {
    const q = search.value.trim().toLowerCase()
    return mockTables
      .map((t) => ({
        ...t,
        areaName: mockAreas.find((a) => a.id === t.areaId)?.name ?? '—',
      }))
      .filter((t) => !q || t.name.toLowerCase().includes(q))
  })
  return { tables, search }
}
