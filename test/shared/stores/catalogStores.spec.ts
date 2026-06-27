import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { Category, Product, Menu } from '@/shared/types';
import { useProductsStore, useCategoriesStore, useMenusStore } from '@/shared/stores/catalogStores';
import { DEFAULT_TTL_MS } from '@/shared/stores/createResourceStore';

vi.mock('@/shared/api/catalog', () => ({
  listProducts: vi.fn<typeof import('@/shared/api/catalog').listProducts>(),
  listCategories: vi.fn<typeof import('@/shared/api/catalog').listCategories>(),
  listMenus: vi.fn<typeof import('@/shared/api/catalog').listMenus>(),
}));

import { listProducts, listCategories, listMenus } from '@/shared/api/catalog';

const products: Product[] = [
  { id: 'p1', name: 'Tacos', price: 90, categoryId: 'c1', available: true },
  { id: 'p2', name: 'Agua', price: 30, categoryId: 'c2', available: false },
];

const categories: Category[] = [
  { id: 'c1', name: 'Comida', areaId: 'a1' },
  { id: 'c2', name: 'Bebida', areaId: 'a2' },
];

const menus: Menu[] = [
  { id: 'm1', name: 'Combo', items: [{ productId: 'p1', quantity: 1 }], active: true, price: 120 },
];

describe('catalog stores', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
    vi.mocked(listProducts).mockResolvedValue(products);
    vi.mocked(listCategories).mockResolvedValue(categories);
    vi.mocked(listMenus).mockResolvedValue(menus);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('products store loads via listProducts and exposes items + byId', async () => {
    const store = useProductsStore();
    expect(store.items.length).toBe(0);
    await store.refresh();
    expect(listProducts).toHaveBeenCalledTimes(1);
    expect(store.items).toHaveLength(2);
    expect(store.byId('p1')?.name).toBe('Tacos');
    expect(store.byId('missing')).toBeUndefined();
  });

  it('categories store loads via listCategories', async () => {
    const store = useCategoriesStore();
    await store.refresh();
    expect(listCategories).toHaveBeenCalledTimes(1);
    expect(store.byId('c2')?.name).toBe('Bebida');
  });

  it('menus store loads via listMenus', async () => {
    const store = useMenusStore();
    await store.refresh();
    expect(listMenus).toHaveBeenCalledTimes(1);
    expect(store.items).toHaveLength(1);
    expect(store.byId('m1')?.price).toBe(120);
  });

  it('ensureLoaded fetches once when fresh and refetches after TTL', async () => {
    const store = useProductsStore();
    await store.ensureLoaded();
    await store.ensureLoaded();
    expect(listProducts).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(DEFAULT_TTL_MS + 1);
    await store.ensureLoaded();
    expect(listProducts).toHaveBeenCalledTimes(2);
  });

  it('surfaces the configured error message when the fetcher rejects', async () => {
    vi.mocked(listProducts).mockRejectedValueOnce(new Error('network down'));
    const store = useProductsStore();
    await store.refresh();
    expect(store.error).toBe('No se pudieron cargar los productos.');
    expect(store.items).toHaveLength(0);
  });

  it('keeps separate store instances independent', async () => {
    const productsStore = useProductsStore();
    const categoriesStore = useCategoriesStore();
    await productsStore.refresh();
    expect(productsStore.items).toHaveLength(2);
    expect(categoriesStore.items).toHaveLength(0);
    expect(listCategories).not.toHaveBeenCalled();
  });
});
