import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createResourceStore, DEFAULT_TTL_MS } from '../createResourceStore';
import type { Area, Table } from '@/shared/types';
import type { User } from '@/modules/auth/store';
import { Role } from '@/shared/types';

const areas: Area[] = [
  { id: 'a1', name: 'Comedor' },
  { id: 'a2', name: 'Bar' },
];

const tables: Table[] = [
  { id: 't1', name: 'Mesa 1', capacity: 4, status: 'libre' },
  { id: 't2', name: 'Mesa 2', capacity: 2, status: 'ocupada' },
  { id: 't3', name: 'Barra 1', capacity: 1, status: 'por_cobrar' },
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

describe('venue stores TTL freshness', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('areas store starts stale and becomes fresh after refresh', async () => {
    const store = createResourceStore<Area>(() => Promise.resolve(areas));
    expect(store.isStale.value).toBe(true);
    await store.refresh();
    expect(store.isStale.value).toBe(false);
  });

  it('tables store goes stale after TTL and invalidate', async () => {
    const store = createResourceStore<Table>(() => Promise.resolve(tables));
    await store.refresh();
    vi.advanceTimersByTime(DEFAULT_TTL_MS + 1);
    store.touch();
    expect(store.isStale.value).toBe(true);
    await store.refresh();
    store.invalidate();
    expect(store.isStale.value).toBe(true);
  });

  it('users store ensureLoaded fetches once when fresh', async () => {
    const fetcher = vi.fn<() => Promise<User[]>>(() => Promise.resolve(users));
    const store = createResourceStore<User>(fetcher);
    await store.ensureLoaded();
    await store.ensureLoaded();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('venue cross-store derivations', () => {
  it('resolves area by id via byId', async () => {
    const areasStore = createResourceStore<Area>(() => Promise.resolve(areas));
    await areasStore.refresh();
    expect(areasStore.byId('a1')?.name).toBe('Comedor');
  });
});
