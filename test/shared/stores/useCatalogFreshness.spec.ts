import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { Category, Product, Menu } from '@/shared/types';
import type { CatalogStampDto } from '@/shared/api/catalog';
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness';
import { useProductsStore, useCategoriesStore, useMenusStore } from '@/shared/stores/catalogStores';
import { DEFAULT_TTL_MS } from '@/shared/stores/createResourceStore';

vi.mock('@/shared/api/catalog', () => ({
  listProducts: vi.fn<typeof import('@/shared/api/catalog').listProducts>(),
  listCategories: vi.fn<typeof import('@/shared/api/catalog').listCategories>(),
  listMenus: vi.fn<typeof import('@/shared/api/catalog').listMenus>(),
  getCatalogStamp: vi.fn<typeof import('@/shared/api/catalog').getCatalogStamp>(),
}));

import { listProducts, listCategories, listMenus, getCatalogStamp } from '@/shared/api/catalog';

const products: Product[] = [
  { id: 'p1', name: 'Tacos', price: 90, categoryId: 'c1', available: true },
];
const categories: Category[] = [{ id: 'c1', name: 'Comida', areaId: 'a1' }];
const menus: Menu[] = [{ id: 'm1', name: 'Combo', items: [], active: true, price: 120 }];

function stamp(overrides: Partial<CatalogStampDto> = {}): CatalogStampDto {
  return {
    products: { count: 1, lastModified: '2026-06-03T00:00:00Z' },
    categories: { count: 1, lastModified: '2026-06-03T00:00:00Z' },
    menus: { count: 1, lastModified: '2026-06-03T00:00:00Z' },
    ...overrides,
  };
}

describe('useCatalogFreshness', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
    vi.mocked(listProducts).mockResolvedValue(products);
    vi.mocked(listCategories).mockResolvedValue(categories);
    vi.mocked(listMenus).mockResolvedValue(menus);
    vi.mocked(getCatalogStamp).mockResolvedValue(stamp());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('loadAll ensures all three catalog stores are populated', async () => {
    const { loadAll } = useCatalogFreshness();
    await loadAll();
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(listCategories).toHaveBeenCalledTimes(1);
    expect(listMenus).toHaveBeenCalledTimes(1);
    expect(useProductsStore().items).toHaveLength(1);
    expect(useCategoriesStore().items).toHaveLength(1);
    expect(useMenusStore().items).toHaveLength(1);
  });

  it('refreshStale only refetches stores that have gone stale', async () => {
    const { loadAll, refreshStale } = useCatalogFreshness();
    await loadAll();
    vi.clearAllMocks();
    vi.advanceTimersByTime(DEFAULT_TTL_MS + 1);
    await refreshStale();
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(listCategories).toHaveBeenCalledTimes(1);
    expect(listMenus).toHaveBeenCalledTimes(1);
  });

  it('refreshStale is a no-op while everything is still fresh', async () => {
    const { loadAll, refreshStale } = useCatalogFreshness();
    await loadAll();
    vi.clearAllMocks();
    await refreshStale();
    expect(listProducts).not.toHaveBeenCalled();
    expect(listCategories).not.toHaveBeenCalled();
    expect(listMenus).not.toHaveBeenCalled();
  });

  it('reconcileWithStamp refreshes only resources whose stamp changed', async () => {
    const { loadAll, reconcileWithStamp } = useCatalogFreshness();
    await loadAll();
    // First reconcile caches the stamp; nothing changed so far is unknown -> all changed once.
    vi.clearAllMocks();
    vi.mocked(getCatalogStamp).mockResolvedValue(stamp());
    await reconcileWithStamp();
    // first reconcile has no cached stamp -> treats all as changed
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(listCategories).toHaveBeenCalledTimes(1);
    expect(listMenus).toHaveBeenCalledTimes(1);

    // second reconcile with an identical stamp -> nothing refreshes
    vi.clearAllMocks();
    await reconcileWithStamp();
    expect(listProducts).not.toHaveBeenCalled();
    expect(listCategories).not.toHaveBeenCalled();
    expect(listMenus).not.toHaveBeenCalled();

    // third reconcile where only products changed -> only products refreshes
    vi.clearAllMocks();
    vi.mocked(getCatalogStamp).mockResolvedValue(
      stamp({ products: { count: 2, lastModified: '2026-06-04T00:00:00Z' } }),
    );
    await reconcileWithStamp();
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(listCategories).not.toHaveBeenCalled();
    expect(listMenus).not.toHaveBeenCalled();
  });

  it('reconcileWithStamp swallows stamp fetch errors without refreshing', async () => {
    const { reconcileWithStamp } = useCatalogFreshness();
    vi.clearAllMocks();
    vi.mocked(getCatalogStamp).mockRejectedValueOnce(new Error('offline'));
    await reconcileWithStamp();
    expect(listProducts).not.toHaveBeenCalled();
  });

  it('invalidateAndRefresh refreshes only the named resources', async () => {
    const { loadAll, invalidateAndRefresh } = useCatalogFreshness();
    await loadAll();
    vi.clearAllMocks();
    await invalidateAndRefresh('products');
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(listCategories).not.toHaveBeenCalled();
    expect(listMenus).not.toHaveBeenCalled();
  });

  it('invalidateAndRefresh refreshes all resources when none are named', async () => {
    const { loadAll, invalidateAndRefresh } = useCatalogFreshness();
    await loadAll();
    vi.clearAllMocks();
    await invalidateAndRefresh();
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(listCategories).toHaveBeenCalledTimes(1);
    expect(listMenus).toHaveBeenCalledTimes(1);
  });

  it('only coordinates the requested subset of resources', async () => {
    const { loadAll } = useCatalogFreshness(['products']);
    await loadAll();
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(listCategories).not.toHaveBeenCalled();
    expect(listMenus).not.toHaveBeenCalled();
  });
});
