import { api } from './client';
import { ENDPOINTS } from './endpoints';
import { buildQuery } from './query';
import { DEFAULT_PAPER_WIDTH } from '@/shared/types';
import type { OrderStatus, ItemKind } from '@/shared/types';

export interface ApiOrderItem {
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  kind?: ItemKind;
}

export interface ApiOrder {
  id: string;
  tableId: string;
  createdBy: string;
  createdAt: string;
  status: OrderStatus;
  items: ApiOrderItem[];
  total: number;
  paid: boolean;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface CancelOrderInput {
  reason: string;
  adminEmail: string;
  adminCredential: string;
}

export interface OrderItemInput {
  productId?: string;
  menuId?: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderInput {
  tableId: string;
  items: OrderItemInput[];
}

export function listOrders(tableId?: string): Promise<ApiOrder[]> {
  return api.get<ApiOrder[]>(`${ENDPOINTS.orders.root}${buildQuery({ tableId })}`);
}

export function listOrdersByTable(tableId: string): Promise<ApiOrder[]> {
  return api.get<ApiOrder[]>(ENDPOINTS.orders.byTable(tableId));
}

export function createOrder(input: CreateOrderInput): Promise<ApiOrder> {
  return api.post<ApiOrder>(ENDPOINTS.orders.root, input);
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<ApiOrder> {
  return api.patch<ApiOrder>(ENDPOINTS.orders.status(id), { status });
}

export function cancelOrder(id: string, body: CancelOrderInput): Promise<ApiOrder> {
  return api.postKeepingSession<ApiOrder>(ENDPOINTS.orders.cancel(id), body);
}

export interface ComandaDto {
  areaId: string | null;
  areaName: string;
  preview: string;
  escposBase64: string;
}

export function getComandasByTable(
  tableId: string,
  width: number = DEFAULT_PAPER_WIDTH,
): Promise<ComandaDto[]> {
  return api.get<ComandaDto[]>(
    `${ENDPOINTS.orders.comandasByTable(tableId)}${buildQuery({ width })}`,
  );
}
