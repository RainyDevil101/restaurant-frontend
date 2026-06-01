import { computed } from 'vue'
import { mockAreas, mockTables } from '@/shared/mocks'

export function useAreas() {
  const areas = computed(() =>
    mockAreas.map((a) => ({
      ...a,
      tableCount: mockTables.filter((t) => t.areaId === a.id).length,
    })),
  )
  return { areas }
}
