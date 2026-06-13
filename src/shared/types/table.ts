export type TableStatus = 'libre' | 'ocupada' | 'por_cobrar';

export const TABLE_STATUS = {
  FREE: 'libre' as TableStatus,
  OCCUPIED: 'ocupada' as TableStatus,
  PENDING_PAYMENT: 'por_cobrar' as TableStatus,
} as const;

export interface Area {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
}
