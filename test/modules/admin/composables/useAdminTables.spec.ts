import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
  createTable: vi.fn<typeof import('@/shared/api/venue').createTable>(),
  updateTable: vi.fn<typeof import('@/shared/api/venue').updateTable>(),
  deleteTable: vi.fn<typeof import('@/shared/api/venue').deleteTable>(),
}));

import { listTables, createTable, updateTable, deleteTable } from '@/shared/api/venue';
import { useAdminTables } from '@/modules/admin/composables/useAdminTables';

const table = { id: 't1', name: 'Mesa 1', capacity: 4, status: 'libre' as const };

function withSetup(): ReturnType<typeof useAdminTables> {
  let result!: ReturnType<typeof useAdminTables>;
  mount(
    defineComponent({
      setup() {
        result = useAdminTables();
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('useAdminTables', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(listTables).mockResolvedValue([table]);
    vi.mocked(createTable).mockResolvedValue(table);
    vi.mocked(updateTable).mockResolvedValue(table);
    vi.mocked(deleteTable).mockResolvedValue(undefined);
  });

  it('loads tables on mount', async () => {
    const { tables, loading } = withSetup();
    await flushPromises();
    expect(listTables).toHaveBeenCalled();
    expect(tables.value).toHaveLength(1);
    expect(tables.value[0]?.name).toBe('Mesa 1');
    expect(loading.value).toBe(false);
  });

  it('createTable calls the API then reloads tables', async () => {
    const { createTable: create } = withSetup();
    await flushPromises();
    vi.mocked(listTables).mockClear();
    await create({ name: 'Mesa 2', capacity: 2 });
    expect(createTable).toHaveBeenCalledWith({ name: 'Mesa 2', capacity: 2 });
    expect(listTables).toHaveBeenCalledTimes(1);
  });

  it('updateTable calls the API then reloads tables', async () => {
    const { updateTable: update } = withSetup();
    await flushPromises();
    vi.mocked(listTables).mockClear();
    await update('t1', { capacity: 6 });
    expect(updateTable).toHaveBeenCalledWith('t1', { capacity: 6 });
    expect(listTables).toHaveBeenCalledTimes(1);
  });

  it('removeTable calls the API then reloads tables', async () => {
    const { removeTable } = withSetup();
    await flushPromises();
    vi.mocked(listTables).mockClear();
    await removeTable('t1');
    expect(deleteTable).toHaveBeenCalledWith('t1');
    expect(listTables).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error on the error ref when the initial load fails', async () => {
    vi.mocked(listTables).mockRejectedValue(new Error('boom'));
    const { error } = withSetup();
    await flushPromises();
    expect(error.value).toBe('No se pudieron cargar las mesas.');
  });

  it('rejects when a mutation API call fails', async () => {
    vi.mocked(updateTable).mockRejectedValue(new Error('nope'));
    const { updateTable: update } = withSetup();
    await flushPromises();
    await expect(update('t1', { capacity: 8 })).rejects.toThrow('nope');
  });
});
