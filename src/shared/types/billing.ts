import type { ItemKind } from './kind';

export const PAYMENT_METHOD = {
  CASH: 'efectivo',
  CARD: 'tarjeta',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export interface BillItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  kind?: ItemKind;
}

export interface Bill {
  id: string;
  tableId: string;
  items: BillItem[];
  total: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  tableId: string;
  amount: number;
  method: PaymentMethod;
  change: number;
  paidAt: string;
}
