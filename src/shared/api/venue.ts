import { api } from './client';
import type { Area, Table, TableStatus } from '@/shared/types';

export type AreaInput = Omit<Area, 'id'>;
export type TableInput = Omit<Table, 'id' | 'status'>;

export function listAreas(): Promise<Area[]> {
  return api.get<Area[]>('/areas');
}

export function createArea(input: AreaInput): Promise<Area> {
  return api.post<Area>('/areas', input);
}

export function updateArea(id: string, input: Partial<AreaInput>): Promise<Area> {
  return api.patch<Area>(`/areas/${id}`, input);
}

export function deleteArea(id: string): Promise<void> {
  return api.delete<void>(`/areas/${id}`);
}

export function listTables(): Promise<Table[]> {
  return api.get<Table[]>('/tables');
}

export function createTable(input: TableInput): Promise<Table> {
  return api.post<Table>('/tables', input);
}

export function updateTable(id: string, input: Partial<TableInput>): Promise<Table> {
  return api.patch<Table>(`/tables/${id}`, input);
}

export function deleteTable(id: string): Promise<void> {
  return api.delete<void>(`/tables/${id}`);
}

export function updateTableStatus(id: string, status: TableStatus): Promise<Table> {
  return api.patch<Table>(`/tables/${id}/status`, { status });
}
