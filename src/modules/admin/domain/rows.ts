import type { Area, Category, Menu, Product, Table, PaymentMethod } from '@/shared/types';
import type { ApiPaymentItem } from '@/shared/api/billing';

export interface ProductRow extends Product {
  categoryName: string;
}

export interface CategoryRow extends Category {
  productCount: number;
  areaName: string;
}

export interface MenuRow extends Menu {
  productCount: number;
}

export interface AreaRow extends Area {
  categoryCount: number;
}

export type TableRow = Table;

export interface PaymentRow {
  id: string;
  tableName: string;
  tableId: string;
  method: PaymentMethod;
  amount: number;
  change: number;
  paidAt: string;
  items: ApiPaymentItem[];
  waiterNames: string[];
}
