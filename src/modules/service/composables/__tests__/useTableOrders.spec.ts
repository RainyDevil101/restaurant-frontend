import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { ORDER_STATUS } from '@/shared/types';
import type { ApiOrder } from '@/shared/api/orders';

vi.mock('@/shared/api/orders', () => ({
  listOrdersByTable: vi.fn<typeof import('@/shared/api/orders').listOrdersByTable>(),
  updateOrderStatus: vi.fn<typeof import('@/shared/api/orders').updateOrderStatus>(),
}));

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}));

import { listOrdersByTable, updateOrderStatus } from '@/shared/api/orders';
import { toast } from '@/shared/toast';
import { ApiRequestError } from '@/shared/api/client';
import { useTableOrders } from '../useTableOrders';

function order(overrides: Partial<ApiOrder> = {}): ApiOrder {
  return {
    id: 'ord-1',
    tableId: 'table-1',
    createdBy: 'u1',
    createdAt: '2026-06-01T00:00:00Z',
    status: ORDER_STATUS.READY,
    paid: false,
    total: 90,
    items: [
      {
        itemId: 'i1',
        productId: 'p1',
        productName: 'Tacos',
        quantity: 1,
        unitPrice: 90,
        subtotal: 90,
      },
    ],
    ...overrides,
  };
}

async function withSetup(
  idRef = ref('table-1'),
): Promise<{ api: ReturnType<typeof useTableOrders>; idRef: typeof idRef }> {
  let api!: ReturnType<typeof useTableOrders>;
  mount(
    defineComponent({
      setup() {
        api = useTableOrders(() => idRef.value);
        return () => h('div');
      },
    }),
  );
  await flushPromises();
  return { api, idRef };
}

describe('useTableOrders — loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads orders for the table on mount', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([order()]);
    const { api } = await withSetup();
    expect(api.openAccountOrders.value).toHaveLength(1);
    expect(api.loading.value).toBe(false);
    expect(listOrdersByTable).toHaveBeenCalledWith('table-1');
  });

  it('does not call the API and stays empty when the id is blank', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([order()]);
    const { api } = await withSetup(ref(''));
    expect(api.openAccountOrders.value).toHaveLength(0);
    expect(listOrdersByTable).not.toHaveBeenCalled();
  });

  it('openAccountOrders excludes cancelled and paid orders', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([
      order({ id: 'ord-1' }),
      order({ id: 'ord-2', status: ORDER_STATUS.CANCELLED }),
      order({ id: 'ord-3', paid: true }),
    ]);
    const { api } = await withSetup();
    expect(api.openAccountOrders.value.map((o) => o.id)).toEqual(['ord-1']);
  });

  it('reloads when the table id changes', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([order()]);
    const { idRef } = await withSetup();
    expect(listOrdersByTable).toHaveBeenCalledWith('table-1');
    idRef.value = 'table-2';
    await flushPromises();
    expect(listOrdersByTable).toHaveBeenCalledWith('table-2');
  });

  it('surfaces the error message on load failure', async () => {
    vi.mocked(listOrdersByTable).mockRejectedValue(new ApiRequestError('down', 500, null));
    const { api } = await withSetup();
    expect(api.error.value).toBe('down');
  });
});

describe('useTableOrders — markDelivered', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listOrdersByTable).mockResolvedValue([
      order({ id: 'ord-1', status: ORDER_STATUS.READY }),
    ]);
  });

  it('optimistically sets the order to delivered and persists it', async () => {
    vi.mocked(updateOrderStatus).mockResolvedValue(order({ status: ORDER_STATUS.DELIVERED }));
    const { api } = await withSetup();
    await api.markDelivered('ord-1');
    await flushPromises();
    expect(updateOrderStatus).toHaveBeenCalledWith('ord-1', ORDER_STATUS.DELIVERED);
    expect(api.openAccountOrders.value[0]?.status).toBe(ORDER_STATUS.DELIVERED);
    expect(toast.success).toHaveBeenCalled();
    expect(api.deliveringId.value).toBeNull();
  });

  it('rolls back the optimistic update when the API fails', async () => {
    vi.mocked(updateOrderStatus).mockRejectedValue(new ApiRequestError('rejected', 409, null));
    const { api } = await withSetup();
    await api.markDelivered('ord-1');
    await flushPromises();
    expect(api.openAccountOrders.value[0]?.status).toBe(ORDER_STATUS.READY);
    expect(api.error.value).toBe('rejected');
    expect(api.deliveringId.value).toBeNull();
  });
});
