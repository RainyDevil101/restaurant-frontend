export const TABLE_STATUS = {
  FREE: 'libre',
  OCCUPIED: 'ocupada',
  PENDING_PAYMENT: 'por_cobrar',
} as const;

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

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
