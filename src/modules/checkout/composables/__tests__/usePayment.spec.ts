import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { PAYMENT_METHOD } from '@/shared/types';

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
  updateTableStatus: vi
    .fn<typeof import('@/shared/api/venue').updateTableStatus>()
    .mockResolvedValue({ id: 'table-1', name: 'Mesa 1', capacity: 4, status: 'por_cobrar' }),
}));

vi.mock('@/shared/api/orders', () => ({
  listOrdersByTable: vi.fn<typeof import('@/shared/api/orders').listOrdersByTable>(),
}));

vi.mock('@/shared/api/billing', () => ({
  consolidateBill: vi
    .fn<typeof import('@/shared/api/billing').consolidateBill>()
    .mockResolvedValue({
      id: 'bill-1',
      tableId: 'table-1',
      items: [],
      total: 0,
      createdAt: '2026-06-01T00:00:00Z',
    }),
  payBill: vi.fn<typeof import('@/shared/api/billing').payBill>().mockResolvedValue({
    id: 'pay-1',
    billId: 'bill-1',
    tableId: 'table-1',
    amount: 0,
    method: 'efectivo',
    change: 0,
    paidAt: '2026-06-01T00:00:00Z',
    items: [],
    waiterIds: [],
  }),
}));

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}));

import { listTables } from '@/shared/api/venue';
import { listOrdersByTable } from '@/shared/api/orders';
import { usePayment } from '../usePayment';

const mockTable = { id: 'table-1', name: 'Mesa 1', capacity: 4, status: 'por_cobrar' as const };

const deliveredOrder = {
  id: 'ord-1',
  tableId: 'table-1',
  createdBy: 'u1',
  createdAt: '2026-06-01T00:00:00Z',
  status: 'entregado' as const,
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
};

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/checkout/table/:id', component: { template: '<div />' } },
      { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
    ],
  });
}

async function withSetup(): Promise<ReturnType<typeof usePayment>> {
  let result!: ReturnType<typeof usePayment>;
  const router = makeRouter();
  await router.push('/checkout/table/table-1');
  mount(
    defineComponent({
      setup() {
        result = usePayment();
        return () => h('div');
      },
    }),
    { global: { plugins: [router] } },
  );
  await flushPromises();
  return result;
}

describe('usePayment — with a $180 bill', () => {
  beforeEach(() => {
    vi.mocked(listTables).mockResolvedValue([mockTable]);
    vi.mocked(listOrdersByTable).mockResolvedValue([deliveredOrder]);
  });

  it('billTotal is the sum of delivered unpaid order subtotals', async () => {
    const { billTotal } = await withSetup();
    expect(billTotal.value).toBe(180);
  });

  it('change is null when paying by card', async () => {
    const { method, change } = await withSetup();
    method.value = PAYMENT_METHOD.CARD;
    expect(change.value).toBeNull();
  });

  it('change is null when cashReceived has not been entered', async () => {
    const { change } = await withSetup();
    expect(change.value).toBeNull();
  });

  it('change equals cashReceived minus billTotal', async () => {
    const { method, cashReceived, change } = await withSetup();
    method.value = PAYMENT_METHOD.CASH;
    cashReceived.value = 200;
    expect(change.value).toBe(20);
  });

  it('canConfirm is true when paying by card', async () => {
    const { method, canConfirm } = await withSetup();
    method.value = PAYMENT_METHOD.CARD;
    expect(canConfirm.value).toBe(true);
  });

  it('canConfirm is false when cash received is less than the bill', async () => {
    const { method, cashReceived, canConfirm } = await withSetup();
    method.value = PAYMENT_METHOD.CASH;
    cashReceived.value = 100;
    expect(canConfirm.value).toBe(false);
  });

  it('canConfirm is true when cash received equals the bill total', async () => {
    const { method, cashReceived, canConfirm } = await withSetup();
    method.value = PAYMENT_METHOD.CASH;
    cashReceived.value = 180;
    expect(canConfirm.value).toBe(true);
  });

  it('canConfirm is true when cash received exceeds the bill total', async () => {
    const { method, cashReceived, canConfirm } = await withSetup();
    method.value = PAYMENT_METHOD.CASH;
    cashReceived.value = 500;
    expect(canConfirm.value).toBe(true);
  });
});

describe('usePayment — with an empty bill', () => {
  beforeEach(() => {
    vi.mocked(listTables).mockResolvedValue([{ ...mockTable, status: 'libre' as const }]);
    vi.mocked(listOrdersByTable).mockResolvedValue([]);
  });

  it('billTotal is 0 when there are no delivered unpaid orders', async () => {
    const { billTotal } = await withSetup();
    expect(billTotal.value).toBe(0);
  });

  it('canConfirm is false when billTotal is 0', async () => {
    const { canConfirm } = await withSetup();
    expect(canConfirm.value).toBe(false);
  });
});
