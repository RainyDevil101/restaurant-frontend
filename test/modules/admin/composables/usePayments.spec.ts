import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/shared/api/billing', () => ({
  listPayments: vi.fn<typeof import('@/shared/api/billing').listPayments>(),
}));

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
}));

vi.mock('@/shared/api/users', () => ({
  listUsers: vi.fn<typeof import('@/shared/api/users').listUsers>(),
}));

import { Role } from '@/shared/types';
import { listPayments } from '@/shared/api/billing';
import { listTables } from '@/shared/api/venue';
import { listUsers } from '@/shared/api/users';
import { usePayments } from '@/modules/admin/composables/usePayments';

const payment = {
  id: 'pay-1',
  billId: 'bill-1',
  tableId: 'table-1',
  amount: 180,
  method: 'efectivo' as const,
  change: 20,
  paidAt: '2026-06-01T00:00:00Z',
  items: [{ productId: 'p1', productName: 'Tacos', quantity: 2, unitPrice: 90, subtotal: 180 }],
  waiterIds: ['u1', 'u2'],
};

const table = { id: 'table-1', name: 'Mesa 5', capacity: 4, status: 'libre' as const };
const userAna = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@subito.mx',
  role: Role.MESERO,
  active: true,
  isOwner: false,
};
const userBeto = {
  id: 'u2',
  name: 'Beto',
  email: 'beto@subito.mx',
  role: Role.MESERO,
  active: true,
  isOwner: false,
};

function withSetup(): ReturnType<typeof usePayments> {
  let result!: ReturnType<typeof usePayments>;
  mount(
    defineComponent({
      setup() {
        result = usePayments();
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('usePayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listPayments).mockResolvedValue([payment]);
    vi.mocked(listTables).mockResolvedValue([table]);
    vi.mocked(listUsers).mockResolvedValue([userAna, userBeto]);
  });

  it('loads payments on mount in parallel and resolves table + waiter names', async () => {
    const { payments, loading } = withSetup();
    await flushPromises();
    expect(listPayments).toHaveBeenCalled();
    expect(listTables).toHaveBeenCalled();
    expect(listUsers).toHaveBeenCalled();
    expect(loading.value).toBe(false);
    expect(payments.value).toHaveLength(1);
    const row = payments.value[0]!;
    expect(row.tableName).toBe('Mesa 5');
    expect(row.waiterNames).toEqual(['Ana', 'Beto']);
    expect(row.amount).toBe(180);
    expect(row.change).toBe(20);
    expect(row.items).toEqual(payment.items);
  });

  it('falls back to the raw id when the table is unknown', async () => {
    vi.mocked(listTables).mockResolvedValue([]);
    const { payments } = withSetup();
    await flushPromises();
    expect(payments.value[0]!.tableName).toBe('table-1');
  });

  it('falls back to the raw waiter id when the user is unknown', async () => {
    vi.mocked(listUsers).mockResolvedValue([userAna]);
    const { payments } = withSetup();
    await flushPromises();
    expect(payments.value[0]!.waiterNames).toEqual(['Ana', 'u2']);
  });

  it('surfaces an error message when the load fails', async () => {
    vi.mocked(listPayments).mockRejectedValue(new Error('boom'));
    const { error, loading, payments } = withSetup();
    await flushPromises();
    expect(error.value).toBe('No se pudieron cargar los pagos.');
    expect(loading.value).toBe(false);
    expect(payments.value).toEqual([]);
  });

  it('reload re-fetches the payments', async () => {
    const { reload } = withSetup();
    await flushPromises();
    vi.mocked(listPayments).mockClear();
    await reload();
    expect(listPayments).toHaveBeenCalledTimes(1);
  });
});
