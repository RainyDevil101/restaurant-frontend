import type { Product } from './product'

export type OrderStatus = 'pendiente' | 'en_proceso' | 'listo' | 'entregado' | 'cancelado'

export const ORDER_STATUS = {
  PENDING: 'pendiente' as OrderStatus,
  IN_PROGRESS: 'en_proceso' as OrderStatus,
  READY: 'listo' as OrderStatus,
  DELIVERED: 'entregado' as OrderStatus,
  CANCELLED: 'cancelado' as OrderStatus,
} as const

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  tableId: string
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
  createdBy: string
}
