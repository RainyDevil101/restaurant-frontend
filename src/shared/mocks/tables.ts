import type { Table } from '@/shared/types'
import { TABLE_STATUS } from '@/shared/types'

export const mockTables: Table[] = [
  { id: 'table-1', name: 'Mesa 1', capacity: 2, status: TABLE_STATUS.FREE,            areaId: 'area-1' },
  { id: 'table-2', name: 'Mesa 2', capacity: 4, status: TABLE_STATUS.OCCUPIED,        areaId: 'area-1' },
  { id: 'table-3', name: 'Mesa 3', capacity: 8, status: TABLE_STATUS.PENDING_PAYMENT, areaId: 'area-1' },
  { id: 'table-4', name: 'Mesa 4', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT, areaId: 'area-1' },
  { id: 'table-5', name: 'Mesa 5', capacity: 2, status: TABLE_STATUS.OCCUPIED,        areaId: 'area-2' },
  { id: 'table-6', name: 'Mesa 6', capacity: 4, status: TABLE_STATUS.OCCUPIED,        areaId: 'area-2' },
  { id: 'table-7', name: 'Mesa 7', capacity: 2, status: TABLE_STATUS.FREE,            areaId: 'area-2' },
  { id: 'table-8', name: 'Mesa 8', capacity: 4, status: TABLE_STATUS.PENDING_PAYMENT, areaId: 'area-2' },
]
