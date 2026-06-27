import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
}));

import { listTables } from '@/shared/api/venue';
import { ApiRequestError } from '@/shared/api/client';
import { useTables } from '@/modules/service/composables/useTables';

const table1 = { id: 'table-1', name: 'Mesa 1', capacity: 4, status: 'libre' as const };
const table2 = { id: 'table-2', name: 'Mesa 2', capacity: 2, status: 'ocupada' as const };

async function withSetup(): Promise<ReturnType<typeof useTables>> {
  let result!: ReturnType<typeof useTables>;
  mount(
    defineComponent({
      setup() {
        result = useTables();
        return () => h('div');
      },
    }),
  );
  await flushPromises();
  return result;
}

describe('useTables', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('loads tables on mount and clears loading', async () => {
    vi.mocked(listTables).mockResolvedValue([table1, table2]);
    const { tables, loading, error } = await withSetup();
    expect(tables.value).toHaveLength(2);
    expect(loading.value).toBe(false);
    expect(error.value).toBe('');
  });

  it('surfaces the ApiRequestError message on failure', async () => {
    vi.mocked(listTables).mockRejectedValue(new ApiRequestError('boom', 500, null));
    const { tables, error } = await withSetup();
    expect(tables.value).toHaveLength(0);
    expect(error.value).toBe('boom');
  });

  it('falls back to a generic message for non-Api errors', async () => {
    vi.mocked(listTables).mockRejectedValue(new Error('nope'));
    const { error } = await withSetup();
    expect(error.value).toBe('No se pudieron cargar las mesas.');
  });

  it('reload re-fetches tables', async () => {
    vi.mocked(listTables).mockResolvedValue([table1]);
    const { reload, tables } = await withSetup();
    expect(tables.value).toHaveLength(1);
    vi.mocked(listTables).mockResolvedValue([table1, table2]);
    await reload();
    expect(tables.value).toHaveLength(2);
  });
});
