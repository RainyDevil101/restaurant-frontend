import type { Order } from '@/shared/types'
import { ORDER_STATUS } from '@/shared/types'
import { mockProducts } from './products'

const prod = (id: string) => {
  const found = mockProducts.find((p) => p.id === id)
  if (!found) throw new Error(`Mock product ${id} not found`)
  return found
}

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    tableId: 'table-2',
    status: ORDER_STATUS.IN_PROGRESS,
    createdAt: '2026-06-01T12:10:00Z',
    createdBy: 'user-1',
    items: [
      { id: 'item-1', product: prod('prod-1'), quantity: 1, notes: 'Sin chile' },
      { id: 'item-2', product: prod('prod-4'), quantity: 2 },
      { id: 'item-3', product: prod('prod-10'), quantity: 2 },
    ],
  },
  {
    id: 'order-2',
    tableId: 'table-3',
    status: ORDER_STATUS.DELIVERED,
    createdAt: '2026-06-01T11:30:00Z',
    createdBy: 'user-1',
    items: [
      { id: 'item-4', product: prod('prod-2'), quantity: 3 },
      { id: 'item-5', product: prod('prod-6'), quantity: 3 },
      { id: 'item-6', product: prod('prod-8'), quantity: 3 },
    ],
  },
  {
    id: 'order-3',
    tableId: 'table-4',
    status: ORDER_STATUS.DELIVERED,
    createdAt: '2026-06-01T12:00:00Z',
    createdBy: 'user-1',
    items: [
      { id: 'item-7', product: prod('prod-5'), quantity: 2 },
      { id: 'item-8', product: prod('prod-9'), quantity: 2 },
      { id: 'item-9', product: prod('prod-12'), quantity: 2 },
    ],
  },
  {
    id: 'order-4',
    tableId: 'table-5',
    status: ORDER_STATUS.PENDING,
    createdAt: '2026-06-01T12:20:00Z',
    createdBy: 'user-1',
    items: [
      { id: 'item-10', product: prod('prod-3'), quantity: 1 },
      { id: 'item-11', product: prod('prod-11'), quantity: 2 },
    ],
  },
  {
    id: 'order-5',
    tableId: 'table-6',
    status: ORDER_STATUS.IN_PROGRESS,
    createdAt: '2026-06-01T12:15:00Z',
    createdBy: 'user-1',
    items: [
      { id: 'item-12', product: prod('prod-4'), quantity: 1 },
      { id: 'item-13', product: prod('prod-6'), quantity: 1 },
      { id: 'item-14', product: prod('prod-10'), quantity: 2 },
    ],
  },
  {
    id: 'order-6',
    tableId: 'table-8',
    status: ORDER_STATUS.DELIVERED,
    createdAt: '2026-06-01T11:45:00Z',
    createdBy: 'user-1',
    items: [
      { id: 'item-15', product: prod('prod-5'), quantity: 4 },
      { id: 'item-16', product: prod('prod-8'), quantity: 4 },
      { id: 'item-17', product: prod('prod-13'), quantity: 2 },
    ],
  },
]
