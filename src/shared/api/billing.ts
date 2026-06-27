import { api } from './client';
import type { Bill, PaymentMethod, ItemKind } from '@/shared/types';

export interface ProcessPaymentInput {
  method: PaymentMethod;
  amount: number;
}

export interface ApiPaymentItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  kind?: ItemKind;
}

export interface ApiPayment {
  id: string;
  billId: string;
  tableId: string;
  amount: number;
  method: PaymentMethod;
  change: number;
  paidAt: string;
  items: ApiPaymentItem[];
  waiterIds: string[];
}

export function getBill(tableId: string): Promise<Bill> {
  return api.get<Bill>(`/billing/table/${tableId}`);
}

export function consolidateBill(tableId: string): Promise<Bill> {
  return api.post<Bill>(`/billing/table/${tableId}/consolidate`);
}

export function payBill(tableId: string, input: ProcessPaymentInput): Promise<ApiPayment> {
  return api.post<ApiPayment>(`/billing/table/${tableId}/payment`, input);
}

export function listPayments(): Promise<ApiPayment[]> {
  return api.get<ApiPayment[]>('/billing/payments');
}

export interface PrecheckDto {
  preview: string;
  escposBase64: string;
  paperWidth: number;
}

export function getPrecheck(tableId: string, width = 80): Promise<PrecheckDto> {
  return api.get<PrecheckDto>(
    `/billing/table/${encodeURIComponent(tableId)}/precheck?width=${width}`,
  );
}
