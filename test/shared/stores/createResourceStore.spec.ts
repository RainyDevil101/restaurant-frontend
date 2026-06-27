import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createResourceStore, DEFAULT_TTL_MS } from '@/shared/stores/createResourceStore';

interface Item {
  id: string;
  name: string;
}

const seed: Item[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
];

describe('createResourceStore freshness', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts stale before any fetch', () => {
    const store = createResourceStore<Item>(() => Promise.resolve(seed));
    expect(store.isStale.value).toBe(true);
    expect(store.lastFetchedAt.value).toBeNull();
  });

  it('is fresh right after refresh and stale after TTL elapses', async () => {
    const store = createResourceStore<Item>(() => Promise.resolve(seed));
    await store.refresh();
    expect(store.isStale.value).toBe(false);
    vi.advanceTimersByTime(DEFAULT_TTL_MS + 1);
    store.touch();
    expect(store.isStale.value).toBe(true);
  });

  it('respects a custom ttlMs', async () => {
    const store = createResourceStore<Item>(() => Promise.resolve(seed), { ttlMs: 1000 });
    await store.refresh();
    vi.advanceTimersByTime(999);
    store.touch();
    expect(store.isStale.value).toBe(false);
    vi.advanceTimersByTime(2);
    store.touch();
    expect(store.isStale.value).toBe(true);
  });

  it('invalidate marks the store stale', async () => {
    const store = createResourceStore<Item>(() => Promise.resolve(seed));
    await store.refresh();
    expect(store.isStale.value).toBe(false);
    store.invalidate();
    expect(store.isStale.value).toBe(true);
  });
});

describe('createResourceStore ensureLoaded', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches when empty', async () => {
    const fetcher = vi.fn<() => Promise<Item[]>>(() => Promise.resolve(seed));
    const store = createResourceStore<Item>(fetcher);
    await store.ensureLoaded();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(store.items.value).toHaveLength(2);
  });

  it('skips refetch when fresh', async () => {
    const fetcher = vi.fn<() => Promise<Item[]>>(() => Promise.resolve(seed));
    const store = createResourceStore<Item>(fetcher);
    await store.ensureLoaded();
    await store.ensureLoaded();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('refetches when stale', async () => {
    const fetcher = vi.fn<() => Promise<Item[]>>(() => Promise.resolve(seed));
    const store = createResourceStore<Item>(fetcher);
    await store.ensureLoaded();
    vi.advanceTimersByTime(DEFAULT_TTL_MS + 1);
    await store.ensureLoaded();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('byId resolves entities after load', async () => {
    const store = createResourceStore<Item>(() => Promise.resolve(seed));
    await store.refresh();
    expect(store.byId('b')?.name).toBe('Beta');
    expect(store.byId('missing')).toBeUndefined();
  });
});
