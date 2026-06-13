import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { ORDER_STATUS } from '@/shared/types';
import type { ApiOrder } from '@/shared/api/orders';

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
}));

vi.mock('@/shared/api/orders', () => ({
  listOrdersByTable: vi.fn<typeof import('@/shared/api/orders').listOrdersByTable>(),
}));

import { listTables } from '@/shared/api/venue';
import { listOrdersByTable } from '@/shared/api/orders';
import { useBilling } from '../useBilling';

const mockTable = { id: 'table-1', name: 'Mesa 1', capacity: 4, status: 'por_cobrar' as const };

function order(overrides: Partial<ApiOrder> = {}): ApiOrder {
  return {
    id: 'ord-1',
    tableId: 'table-1',
    createdBy: 'u1',
    createdAt: '2026-06-01T00:00:00Z',
    status: ORDER_STATUS.DELIVERED,
    paid: false,
    total: 180,
    items: [
      {
        itemId: 'i1',
        productId: 'p1',
        productName: 'Tacos',
        quantity: 2,
        unitPrice: 90,
        subtotal: 180,
      },
    ],
    ...overrides,
  };
}

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/checkout/table/:id', component: { template: '<div />' } },
      { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
    ],
  });
}

async function withSetup(): Promise<ReturnType<typeof useBilling>> {
  let result!: ReturnType<typeof useBilling>;
  const router = makeRouter();
  await router.push('/checkout/table/table-1');
  mount(
    defineComponent({
      setup() {
        result = useBilling();
        return () => h('div');
      },
    }),
    { global: { plugins: [router] } },
  );
  await flushPromises();
  return result;
}

describe('useBilling — with delivered orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listTables).mockResolvedValue([mockTable]);
    vi.mocked(listOrdersByTable).mockResolvedValue([order()]);
  });

  it('resolves the table from the route id', async () => {
    const { table } = await withSetup();
    expect(table.value?.id).toBe('table-1');
  });

  it('billTotal sums delivered unpaid subtotals', async () => {
    const { billTotal } = await withSetup();
    expect(billTotal.value).toBe(180);
  });

  it('billLines aggregates the same product across orders', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([
      order({ id: 'ord-1' }),
      order({ id: 'ord-2' }),
    ]);
    const { billLines, billTotal } = await withSetup();
    expect(billLines.value).toHaveLength(1);
    expect(billLines.value[0]?.quantity).toBe(4);
    expect(billLines.value[0]?.subtotal).toBe(360);
    expect(billTotal.value).toBe(360);
  });

  it('keeps distinct products as separate lines', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([
      order({
        id: 'ord-1',
        items: [
          {
            itemId: 'i1',
            productId: 'p1',
            productName: 'Tacos',
            quantity: 1,
            unitPrice: 90,
            subtotal: 90,
          },
          {
            itemId: 'i2',
            productId: 'p2',
            productName: 'Agua',
            quantity: 2,
            unitPrice: 20,
            subtotal: 40,
          },
        ],
      }),
    ]);
    const { billLines, billTotal } = await withSetup();
    expect(billLines.value).toHaveLength(2);
    expect(billTotal.value).toBe(130);
  });

  it('ordersByStatus counts delivered orders and hasPendingOrders is false', async () => {
    const { ordersByStatus, hasPendingOrders } = await withSetup();
    expect(ordersByStatus.value.delivered).toBe(1);
    expect(ordersByStatus.value.pending).toBe(0);
    expect(hasPendingOrders.value).toBe(false);
  });

  it('hasPendingOrders is true when an order is still pending', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([order({ status: ORDER_STATUS.PENDING })]);
    const { hasPendingOrders, ordersByStatus } = await withSetup();
    expect(ordersByStatus.value.pending).toBe(1);
    expect(hasPendingOrders.value).toBe(true);
  });
});

describe('useBilling — exclusions and empty state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listTables).mockResolvedValue([mockTable]);
  });

  it('excludes cancelled and paid orders from the bill', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([
      order({ id: 'ord-1', status: ORDER_STATUS.CANCELLED }),
      order({ id: 'ord-2', paid: true }),
    ]);
    const { activeOrders, billTotal } = await withSetup();
    expect(activeOrders.value).toHaveLength(0);
    expect(billTotal.value).toBe(0);
  });

  it('billTotal is 0 with no orders', async () => {
    vi.mocked(listOrdersByTable).mockResolvedValue([]);
    const { billLines, billTotal } = await withSetup();
    expect(billLines.value).toHaveLength(0);
    expect(billTotal.value).toBe(0);
  });
});
