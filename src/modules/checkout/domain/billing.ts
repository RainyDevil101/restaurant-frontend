import type { ItemKind, Table } from '@/shared/types';

export interface TableSummary {
  table: Table;
  total: number;
  hasNewOrder: boolean;
}

export interface BillLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  kind?: ItemKind;
}

export interface PaymentBillLine {
  productId: string;
  productName: string;
  quantity: number;
  subtotal: number;
  kind?: ItemKind;
}
