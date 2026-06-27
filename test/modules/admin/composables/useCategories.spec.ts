import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/shared/api/catalog', () => ({
  getCatalogStamp: vi.fn<typeof import('@/shared/api/catalog').getCatalogStamp>(),
  listProducts: vi.fn<typeof import('@/shared/api/catalog').listProducts>(),
  listCategories: vi.fn<typeof import('@/shared/api/catalog').listCategories>(),
  listMenus: vi.fn<typeof import('@/shared/api/catalog').listMenus>(),
  createCategory: vi.fn<typeof import('@/shared/api/catalog').createCategory>(),
  updateCategory: vi.fn<typeof import('@/shared/api/catalog').updateCategory>(),
  deleteCategory: vi.fn<typeof import('@/shared/api/catalog').deleteCategory>(),
}));

vi.mock('@/shared/api/venue', () => ({
  listAreas: vi.fn<typeof import('@/shared/api/venue').listAreas>(),
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
  createArea: vi.fn<typeof import('@/shared/api/venue').createArea>(),
}));

import {
  listCategories,
  listProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/shared/api/catalog';
import { listAreas, createArea } from '@/shared/api/venue';
import { useCategories } from '@/modules/admin/composables/useCategories';

const category = { id: 'c1', name: 'Comida', areaId: 'a1' };
const product = { id: 'p1', name: 'Tacos', price: 90, categoryId: 'c1', available: true };
const area = { id: 'a1', name: 'Cocina' };

function withSetup(): ReturnType<typeof useCategories> {
  let result!: ReturnType<typeof useCategories>;
  mount(
    defineComponent({
      setup() {
        result = useCategories();
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('useCategories', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(listCategories).mockResolvedValue([category]);
    vi.mocked(listProducts).mockResolvedValue([product]);
    vi.mocked(listAreas).mockResolvedValue([area]);
    vi.mocked(createCategory).mockResolvedValue(category);
    vi.mocked(updateCategory).mockResolvedValue(category);
    vi.mocked(deleteCategory).mockResolvedValue(undefined);
    vi.mocked(createArea).mockResolvedValue(area);
  });

  it('loads categories on mount and derives product count and area name', async () => {
    const { categories, loading } = withSetup();
    await flushPromises();
    expect(listCategories).toHaveBeenCalled();
    expect(categories.value).toHaveLength(1);
    expect(categories.value[0]?.productCount).toBe(1);
    expect(categories.value[0]?.areaName).toBe('Cocina');
    expect(loading.value).toBe(false);
  });

  it('shows a dash for a category with no area', async () => {
    vi.mocked(listCategories).mockResolvedValue([{ id: 'c2', name: 'Sin área' }]);
    const { categories } = withSetup();
    await flushPromises();
    expect(categories.value[0]?.areaName).toBe('—');
  });

  it('createCategory calls the API then reloads categories', async () => {
    const { createCategory: create } = withSetup();
    await flushPromises();
    vi.mocked(listCategories).mockClear();
    await create({ name: 'Bebidas', areaId: 'a1' });
    expect(createCategory).toHaveBeenCalledWith({ name: 'Bebidas', areaId: 'a1' });
    expect(listCategories).toHaveBeenCalledTimes(1);
  });

  it('updateCategory calls the API then reloads categories', async () => {
    const { updateCategory: update } = withSetup();
    await flushPromises();
    vi.mocked(listCategories).mockClear();
    await update('c1', { name: 'Editada' });
    expect(updateCategory).toHaveBeenCalledWith('c1', { name: 'Editada' });
    expect(listCategories).toHaveBeenCalledTimes(1);
  });

  it('removeCategory calls the API then reloads categories', async () => {
    const { removeCategory } = withSetup();
    await flushPromises();
    vi.mocked(listCategories).mockClear();
    await removeCategory('c1');
    expect(deleteCategory).toHaveBeenCalledWith('c1');
    expect(listCategories).toHaveBeenCalledTimes(1);
  });

  it('createArea returns the created area and refreshes areas', async () => {
    const { createArea: create } = withSetup();
    await flushPromises();
    vi.mocked(listAreas).mockClear();
    const created = await create({ name: 'Barra' });
    expect(createArea).toHaveBeenCalledWith({ name: 'Barra' });
    expect(created).toEqual(area);
    expect(listAreas).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error on the error ref when the initial load fails', async () => {
    vi.mocked(listCategories).mockRejectedValue(new Error('boom'));
    const { error } = withSetup();
    await flushPromises();
    expect(error.value).toBe('No se pudieron cargar las categorías.');
  });

  it('rejects when a mutation API call fails', async () => {
    vi.mocked(updateCategory).mockRejectedValue(new Error('nope'));
    const { updateCategory: update } = withSetup();
    await flushPromises();
    await expect(update('c1', { name: 'X' })).rejects.toThrow('nope');
  });
});
