import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/shared/api/venue', () => ({
  listAreas: vi.fn<typeof import('@/shared/api/venue').listAreas>(),
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
  createArea: vi.fn<typeof import('@/shared/api/venue').createArea>(),
  updateArea: vi.fn<typeof import('@/shared/api/venue').updateArea>(),
  deleteArea: vi.fn<typeof import('@/shared/api/venue').deleteArea>(),
}));

vi.mock('@/shared/api/catalog', () => ({
  getCatalogStamp: vi.fn<typeof import('@/shared/api/catalog').getCatalogStamp>(),
  listProducts: vi.fn<typeof import('@/shared/api/catalog').listProducts>(),
  listCategories: vi.fn<typeof import('@/shared/api/catalog').listCategories>(),
  listMenus: vi.fn<typeof import('@/shared/api/catalog').listMenus>(),
}));

import { listAreas, createArea, updateArea, deleteArea } from '@/shared/api/venue';
import { listCategories } from '@/shared/api/catalog';
import { useAreas } from '../useAreas';

const area = { id: 'a1', name: 'Cocina' };
const category = { id: 'c1', name: 'Comida', areaId: 'a1' };

function withSetup(): ReturnType<typeof useAreas> {
  let result!: ReturnType<typeof useAreas>;
  mount(
    defineComponent({
      setup() {
        result = useAreas();
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('useAreas', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(listAreas).mockResolvedValue([area]);
    vi.mocked(listCategories).mockResolvedValue([category]);
    vi.mocked(createArea).mockResolvedValue(area);
    vi.mocked(updateArea).mockResolvedValue(area);
    vi.mocked(deleteArea).mockResolvedValue(undefined);
  });

  it('loads areas on mount and derives category count', async () => {
    const { areas, loading } = withSetup();
    await flushPromises();
    expect(listAreas).toHaveBeenCalled();
    expect(areas.value).toHaveLength(1);
    expect(areas.value[0]?.categoryCount).toBe(1);
    expect(loading.value).toBe(false);
  });

  it('createArea calls the API then reloads areas', async () => {
    const { createArea: create } = withSetup();
    await flushPromises();
    vi.mocked(listAreas).mockClear();
    await create({ name: 'Barra' });
    expect(createArea).toHaveBeenCalledWith({ name: 'Barra' });
    expect(listAreas).toHaveBeenCalledTimes(1);
  });

  it('updateArea calls the API then reloads areas', async () => {
    const { updateArea: update } = withSetup();
    await flushPromises();
    vi.mocked(listAreas).mockClear();
    await update('a1', { name: 'Editada' });
    expect(updateArea).toHaveBeenCalledWith('a1', { name: 'Editada' });
    expect(listAreas).toHaveBeenCalledTimes(1);
  });

  it('removeArea calls the API then reloads areas', async () => {
    const { removeArea } = withSetup();
    await flushPromises();
    vi.mocked(listAreas).mockClear();
    await removeArea('a1');
    expect(deleteArea).toHaveBeenCalledWith('a1');
    expect(listAreas).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error on the error ref when the initial load fails', async () => {
    vi.mocked(listAreas).mockRejectedValue(new Error('boom'));
    const { error } = withSetup();
    await flushPromises();
    expect(error.value).toBe('No se pudieron cargar las áreas.');
  });

  it('rejects when a mutation API call fails', async () => {
    vi.mocked(createArea).mockRejectedValue(new Error('nope'));
    const { createArea: create } = withSetup();
    await flushPromises();
    await expect(create({ name: 'X' })).rejects.toThrow('nope');
  });
});
