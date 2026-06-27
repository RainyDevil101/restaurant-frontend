import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { ORDER_STATUS } from '@/shared/types';
import type { ApiOrder } from '@/shared/api/orders';

vi.mock('@/shared/api/orders', () => ({
  listOrders: vi.fn<typeof import('@/shared/api/orders').listOrders>(),
}));

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>().mockResolvedValue([]),
}));

const handlers = new Map<string, (payload: ApiOrder) => void>();
const fakeSocket = {
  emit: vi.fn<(event: string, ...args: unknown[]) => void>(),
  on: vi.fn<(event: string, handler: (payload: ApiOrder) => void) => void>((event, handler) => {
    handlers.set(event, handler);
  }),
  off: vi.fn<(event: string, handler?: (...args: unknown[]) => void) => void>(),
  disconnect: vi.fn<() => void>(),
};

vi.mock('@/shared/api/socket', () => ({
  connectOrdersSocket: vi.fn<typeof import('@/shared/api/socket').connectOrdersSocket>(
    () =>
      fakeSocket as unknown as ReturnType<typeof import('@/shared/api/socket').connectOrdersSocket>,
  ),
}));

import { listOrders } from '@/shared/api/orders';
import { ApiRequestError } from '@/shared/api/client';
import { useFloorActivity } from '@/modules/service/composables/useFloorActivity';

function order(overrides: Partial<ApiOrder> = {}): ApiOrder {
  return {
    id: 'ord-1',
    tableId: 'table-1',
    createdBy: 'u1',
    createdAt: '2026-06-01T00:00:00Z',
    status: ORDER_STATUS.PENDING,
    paid: false,
    total: 90,
    items: [],
    ...overrides,
  };
}

async function withSetup(): Promise<ReturnType<typeof useFloorActivity>> {
  let api!: ReturnType<typeof useFloorActivity>;
  mount(
    defineComponent({
      setup() {
        api = useFloorActivity();
        return () => h('div');
      },
    }),
  );
  await flushPromises();
  return api;
}

describe('useFloorActivity', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    handlers.clear();
    vi.clearAllMocks();
  });

  it('counts open orders per table', async () => {
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'o1', tableId: 'table-1' }),
      order({ id: 'o2', tableId: 'table-1' }),
      order({ id: 'o3', tableId: 'table-2' }),
    ]);
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-1')?.open).toBe(2);
    expect(api.activityByTable.value.get('table-2')?.open).toBe(1);
  });

  it('excludes cancelled and paid orders', async () => {
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'o1', tableId: 'table-1' }),
      order({ id: 'o2', tableId: 'table-1', status: ORDER_STATUS.CANCELLED }),
      order({ id: 'o3', tableId: 'table-1', paid: true }),
    ]);
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-1')?.open).toBe(1);
  });

  it('flags needsDelivery when an open order is not delivered', async () => {
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'o1', tableId: 'table-1', status: ORDER_STATUS.PENDING }),
    ]);
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-1')?.needsDelivery).toBe(true);
  });

  it('does not flag needsDelivery when every open order is delivered', async () => {
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'o1', tableId: 'table-1', status: ORDER_STATUS.DELIVERED }),
    ]);
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-1')?.needsDelivery).toBe(false);
  });

  it('surfaces the error message on load failure', async () => {
    vi.mocked(listOrders).mockRejectedValue(new ApiRequestError('down', 500, null));
    const api = await withSetup();
    expect(api.error.value).toBe('down');
  });

  it('reload re-fetches the floor activity', async () => {
    vi.mocked(listOrders).mockResolvedValue([order({ id: 'o1', tableId: 'table-1' })]);
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-1')?.open).toBe(1);
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'o1', tableId: 'table-1' }),
      order({ id: 'o2', tableId: 'table-1' }),
    ]);
    await api.reload();
    expect(api.activityByTable.value.get('table-1')?.open).toBe(2);
  });
});

describe('useFloorActivity — realtime', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    handlers.clear();
    vi.clearAllMocks();
    vi.mocked(listOrders).mockResolvedValue([]);
  });

  it('joins the order broadcast room and subscribes to order events', async () => {
    await withSetup();
    expect(fakeSocket.emit).toHaveBeenCalledWith('joinCheckout');
    expect(handlers.has('orderCreated')).toBe(true);
    expect(handlers.has('orderStatusChanged')).toBe(true);
  });

  it('orderCreated adds the new order to the floor activity', async () => {
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-9')).toBeUndefined();

    handlers.get('orderCreated')!(order({ id: 'ord-new', tableId: 'table-9' }));
    await flushPromises();

    expect(api.activityByTable.value.get('table-9')?.open).toBe(1);
    expect(api.activityByTable.value.get('table-9')?.needsDelivery).toBe(true);
  });

  it('orderStatusChanged to delivered clears the needs-delivery flag', async () => {
    vi.mocked(listOrders).mockResolvedValue([
      order({ id: 'ord-1', tableId: 'table-1', status: ORDER_STATUS.PENDING }),
    ]);
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-1')?.needsDelivery).toBe(true);

    handlers.get('orderStatusChanged')!(
      order({ id: 'ord-1', tableId: 'table-1', status: ORDER_STATUS.DELIVERED }),
    );
    await flushPromises();

    expect(api.activityByTable.value.get('table-1')?.needsDelivery).toBe(false);
  });

  it('orderStatusChanged to paid drops the order from the floor activity', async () => {
    vi.mocked(listOrders).mockResolvedValue([order({ id: 'ord-1', tableId: 'table-1' })]);
    const api = await withSetup();
    expect(api.activityByTable.value.get('table-1')?.open).toBe(1);

    handlers.get('orderStatusChanged')!(order({ id: 'ord-1', tableId: 'table-1', paid: true }));
    await flushPromises();

    expect(api.activityByTable.value.get('table-1')).toBeUndefined();
  });
});
