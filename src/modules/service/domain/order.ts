import { ITEM_KIND, type ItemKind, type Product, type Menu } from '@/shared/types';

export const ORDER_ENTRY_KIND = ITEM_KIND;
export type OrderEntryKind = ItemKind;

export interface ProductEntry {
  kind: typeof ITEM_KIND.PRODUCT;
  product: Product;
  quantity: number;
}

export interface ComboEntry {
  kind: typeof ITEM_KIND.COMBO;
  menu: Menu;
  quantity: number;
}

export type OrderEntry = ProductEntry | ComboEntry;
