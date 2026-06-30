import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { Area, Table, TableStatus } from '@/shared/types';

export type AreaInput = Omit<Area, 'id'>;
export type TableInput = Omit<Table, 'id' | 'status'>;

export function listAreas(): Promise<Area[]> {
  return api.get<Area[]>(ENDPOINTS.areas.root);
}

export function createArea(input: AreaInput): Promise<Area> {
  return api.post<Area>(ENDPOINTS.areas.root, input);
}

export function updateArea(id: string, input: Partial<AreaInput>): Promise<Area> {
  return api.patch<Area>(ENDPOINTS.areas.byId(id), input);
}

export function deleteArea(id: string): Promise<void> {
  return api.delete<void>(ENDPOINTS.areas.byId(id));
}

export function listTables(): Promise<Table[]> {
  return api.get<Table[]>(ENDPOINTS.tables.root);
}

export function createTable(input: TableInput): Promise<Table> {
  return api.post<Table>(ENDPOINTS.tables.root, input);
}

export function updateTable(id: string, input: Partial<TableInput>): Promise<Table> {
  return api.patch<Table>(ENDPOINTS.tables.byId(id), input);
}

export function deleteTable(id: string): Promise<void> {
  return api.delete<void>(ENDPOINTS.tables.byId(id));
}

export function updateTableStatus(id: string, status: TableStatus): Promise<Table> {
  return api.patch<Table>(ENDPOINTS.tables.status(id), { status });
}
