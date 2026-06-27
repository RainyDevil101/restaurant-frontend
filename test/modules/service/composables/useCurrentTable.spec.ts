import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
}));

import { listTables } from '@/shared/api/venue';
import { useCurrentTable } from '@/modules/service/composables/useCurrentTable';

const table1 = { id: 'table-1', name: 'Mesa 1', capacity: 4, status: 'ocupada' as const };
const table2 = { id: 'table-2', name: 'Mesa 2', capacity: 2, status: 'libre' as const };

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/service/table/:id', component: { template: '<div />' } },
      { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
    ],
  });
}

async function withSetup(path: string): Promise<ReturnType<typeof useCurrentTable>> {
  let result!: ReturnType<typeof useCurrentTable>;
  const router = makeRouter();
  await router.push(path);
  mount(
    defineComponent({
      setup() {
        result = useCurrentTable();
        return () => h('div');
      },
    }),
    { global: { plugins: [router] } },
  );
  await flushPromises();
  return result;
}

describe('useCurrentTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(listTables).mockResolvedValue([table1, table2]);
  });

  it('binds tableId from the route param', async () => {
    const { tableId } = await withSetup('/service/table/table-2');
    expect(tableId.value).toBe('table-2');
  });

  it('resolves the matching table after load', async () => {
    const { table } = await withSetup('/service/table/table-1');
    expect(table.value?.id).toBe('table-1');
    expect(table.value?.name).toBe('Mesa 1');
  });

  it('table is null when the route id matches no table', async () => {
    const { table, tableId } = await withSetup('/service/table/missing');
    expect(tableId.value).toBe('missing');
    expect(table.value).toBeNull();
  });
});
