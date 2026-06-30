import { api } from './client';
import { ENDPOINTS } from './endpoints';
import { buildQuery } from './query';
import { DEFAULT_PAPER_WIDTH } from '@/shared/types';
import type { ComandaDto } from './orders';
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
  return api.get<Bill>(ENDPOINTS.billing.table(tableId));
}

export function consolidateBill(tableId: string): Promise<Bill> {
  return api.post<Bill>(ENDPOINTS.billing.consolidate(tableId));
}

export function payBill(tableId: string, input: ProcessPaymentInput): Promise<ApiPayment> {
  return api.post<ApiPayment>(ENDPOINTS.billing.payment(tableId), input);
}

export function listPayments(): Promise<ApiPayment[]> {
  return api.get<ApiPayment[]>(ENDPOINTS.billing.payments);
}

export interface PrecheckDto {
  preview: string;
  escposBase64: string;
  paperWidth: number;
}

export function getPrecheck(
  tableId: string,
  width: number = DEFAULT_PAPER_WIDTH,
): Promise<PrecheckDto> {
  return api.get<PrecheckDto>(`${ENDPOINTS.billing.precheck(tableId)}${buildQuery({ width })}`);
}

export function getPaymentReceipt(
  paymentId: string,
  width: number = DEFAULT_PAPER_WIDTH,
): Promise<PrecheckDto> {
  return api.get<PrecheckDto>(
    `${ENDPOINTS.billing.paymentReceipt(paymentId)}${buildQuery({ width })}`,
  );
}

export function getPaymentComanda(
  paymentId: string,
  width: number = DEFAULT_PAPER_WIDTH,
): Promise<ComandaDto[]> {
  return api.get<ComandaDto[]>(
    `${ENDPOINTS.billing.paymentComanda(paymentId)}${buildQuery({ width })}`,
  );
}
