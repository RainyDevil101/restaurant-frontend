import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { Area, Table } from '@/shared/types';
import type { User } from '@/modules/auth/store';
import { Role } from '@/shared/types';
import { useAreasStore, useTablesStore } from '@/shared/stores/venueStores';
import { useUsersStore } from '@/shared/stores/usersStore';

vi.mock('@/shared/api/venue', () => ({
  listAreas: vi.fn<typeof import('@/shared/api/venue').listAreas>(),
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
}));

vi.mock('@/shared/api/users', () => ({
  listUsers: vi.fn<typeof import('@/shared/api/users').listUsers>(),
}));

import { listAreas, listTables } from '@/shared/api/venue';
import { listUsers } from '@/shared/api/users';

const areas: Area[] = [
  { id: 'a1', name: 'Comedor' },
  { id: 'a2', name: 'Bar' },
];

const tables: Table[] = [
  { id: 't1', name: 'Mesa 1', capacity: 4, status: 'libre' },
  { id: 't2', name: 'Mesa 2', capacity: 2, status: 'ocupada' },
];

const users: User[] = [
  {
    id: 'u1',
    name: 'Ana',
    email: 'ana@subito.mx',
    role: Role.MESERO,
    active: true,
    isOwner: false,
  },
  {
    id: 'u2',
    name: 'Carlos',
    email: 'carlos@subito.mx',
    role: Role.CAJERO,
    active: false,
    isOwner: false,
  },
];

describe('venue + users store instances', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(listAreas).mockResolvedValue(areas);
    vi.mocked(listTables).mockResolvedValue(tables);
    vi.mocked(listUsers).mockResolvedValue(users);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('areas store loads via listAreas and resolves byId', async () => {
    const store = useAreasStore();
    await store.refresh();
    expect(listAreas).toHaveBeenCalledTimes(1);
    expect(store.items).toHaveLength(2);
    expect(store.byId('a2')?.name).toBe('Bar');
  });

  it('tables store loads via listTables and resolves byId', async () => {
    const store = useTablesStore();
    await store.refresh();
    expect(listTables).toHaveBeenCalledTimes(1);
    expect(store.byId('t2')?.status).toBe('ocupada');
  });

  it('users store loads via listUsers and resolves byId', async () => {
    const store = useUsersStore();
    await store.refresh();
    expect(listUsers).toHaveBeenCalledTimes(1);
    expect(store.byId('u1')?.role).toBe(Role.MESERO);
  });

  it('areas store surfaces its configured error message on failure', async () => {
    vi.mocked(listAreas).mockRejectedValueOnce(new Error('boom'));
    const store = useAreasStore();
    await store.refresh();
    expect(store.error).toBe('No se pudieron cargar las áreas.');
  });

  it('tables store surfaces its configured error message on failure', async () => {
    vi.mocked(listTables).mockRejectedValueOnce(new Error('boom'));
    const store = useTablesStore();
    await store.refresh();
    expect(store.error).toBe('No se pudieron cargar las mesas.');
  });

  it('users store surfaces its configured error message on failure', async () => {
    vi.mocked(listUsers).mockRejectedValueOnce(new Error('boom'));
    const store = useUsersStore();
    await store.refresh();
    expect(store.error).toBe('No se pudieron cargar los usuarios.');
  });
});
