import type { BadgeTone } from '@/shared/components/Badge.vue';
import {
  TABLE_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
  ITEM_KIND,
  PRINTER_CONNECTION,
  Role,
} from '@/shared/types';
import type {
  TableStatus,
  OrderStatus,
  PaymentMethod,
  ItemKind,
  PrinterConnection,
} from '@/shared/types';

export interface BadgeLabel {
  label: string;
  tone: BadgeTone;
}

export const TABLE_STATUS_LABEL: Record<TableStatus, BadgeLabel> = {
  [TABLE_STATUS.FREE]: { label: 'Libre', tone: 'green' },
  [TABLE_STATUS.OCCUPIED]: { label: 'Ocupada', tone: 'blue' },
  [TABLE_STATUS.PENDING_PAYMENT]: { label: 'Por cobrar', tone: 'amber' },
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, BadgeLabel> = {
  [ORDER_STATUS.PENDING]: { label: 'Pendiente', tone: 'amber' },
  [ORDER_STATUS.IN_PROGRESS]: { label: 'En proceso', tone: 'blue' },
  [ORDER_STATUS.READY]: { label: 'Listo', tone: 'green' },
  [ORDER_STATUS.DELIVERED]: { label: 'Entregado', tone: 'gray' },
  [ORDER_STATUS.CANCELLED]: { label: 'Cancelado', tone: 'red' },
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, BadgeLabel> = {
  [PAYMENT_METHOD.CASH]: { label: 'Efectivo', tone: 'green' },
  [PAYMENT_METHOD.CARD]: { label: 'Tarjeta', tone: 'blue' },
};

export const ROLE_LABEL: Record<Role, BadgeLabel> = {
  [Role.MESERO]: { label: 'Servicio', tone: 'blue' },
  [Role.CAJERO]: { label: 'Caja', tone: 'purple' },
  [Role.ADMIN]: { label: 'Administración', tone: 'gray' },
};

export const ITEM_KIND_LABEL: Record<ItemKind, BadgeLabel> = {
  [ITEM_KIND.PRODUCT]: { label: 'Producto', tone: 'gray' },
  [ITEM_KIND.COMBO]: { label: 'Combo', tone: 'teal' },
};

export const PRINTER_CONNECTION_LABEL: Record<PrinterConnection, string> = {
  [PRINTER_CONNECTION.USB]: 'USB',
  [PRINTER_CONNECTION.BLUETOOTH]: 'Bluetooth',
};
