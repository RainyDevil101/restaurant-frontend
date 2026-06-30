import type { Product } from './product';

export const ORDER_STATUS = {
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_proceso',
  READY: 'listo',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  createdBy: string;
}
