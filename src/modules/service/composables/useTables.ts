import { ref } from 'vue'
import type { Table } from '@/shared/types'
import { mockTables } from '@/shared/mocks'

export function useTables() {
  const tables = ref<Table[]>(mockTables)
  return { tables }
}
