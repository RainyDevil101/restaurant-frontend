import { api } from './client'
import type { OrderStatus } from '@/shared/types'

export interface ApiOrderItem {
  itemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string
}

export interface ApiOrder {
  id: string
  tableId: string
  createdBy: string
  createdAt: string
  status: OrderStatus
  items: ApiOrderItem[]
  total: number
}

export interface OrderItemInput {
  productId: string
  quantity: number
  notes?: string
}

export interface CreateOrderInput {
  tableId: string
  items: OrderItemInput[]
}

export function listOrders(tableId?: string): Promise<ApiOrder[]> {
  const query = tableId ? `?tableId=${encodeURIComponent(tableId)}` : ''
  return api.get<ApiOrder[]>(`/orders${query}`)
}

export function listOrdersByTable(tableId: string): Promise<ApiOrder[]> {
  return api.get<ApiOrder[]>(`/orders/table/${tableId}`)
}

export function createOrder(input: CreateOrderInput): Promise<ApiOrder> {
  return api.post<ApiOrder>('/orders', input)
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<ApiOrder> {
  return api.patch<ApiOrder>(`/orders/${id}/status`, { status })
}
