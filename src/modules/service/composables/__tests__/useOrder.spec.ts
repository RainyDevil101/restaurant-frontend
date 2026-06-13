import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import type { Product, Menu } from '@/shared/types';

vi.mock('@/shared/api/catalog', () => ({
  listProducts: vi.fn<typeof import('@/shared/api/catalog').listProducts>().mockResolvedValue([]),
  listCategories: vi
    .fn<typeof import('@/shared/api/catalog').listCategories>()
    .mockResolvedValue([]),
  listMenus: vi.fn<typeof import('@/shared/api/catalog').listMenus>().mockResolvedValue([]),
}));

vi.mock('@/shared/api/orders', () => ({
  createOrder: vi.fn<typeof import('@/shared/api/orders').createOrder>(),
}));

vi.mock('@/shared/api/venue', () => ({
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>().mockResolvedValue([]),
  updateTableStatus: vi
    .fn<typeof import('@/shared/api/venue').updateTableStatus>()
    .mockResolvedValue({ id: 'table-1', name: 'Mesa 1', capacity: 4, status: 'ocupada' }),
}));

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}));

import { useOrder } from '../useOrder';

function withSetup(): ReturnType<typeof useOrder> {
  let result!: ReturnType<typeof useOrder>;
  mount(
    defineComponent({
      setup() {
        result = useOrder();
        return () => h('div');
      },
    }),
  );
  return result;
}

const p = (id: string, price: number): Product => ({
  id,
  name: `Product ${id}`,
  price,
  categoryId: 'cat1',
  available: true,
});

const m = (id: string, price: number): Menu => ({
  id,
  name: `Menu ${id}`,
  price,
  active: true,
  items: [],
});

describe('useOrder — cart state', () => {
  it('starts with an empty cart', () => {
    const { entries, totalItems, total } = withSetup();
    expect(entries.value).toHaveLength(0);
    expect(totalItems.value).toBe(0);
    expect(total.value).toBe(0);
  });

  it('addProduct adds a new entry with quantity 1', () => {
    const { addProduct, entries } = withSetup();
    addProduct(p('p1', 90));
    expect(entries.value).toHaveLength(1);
    expect(entries.value[0]).toMatchObject({ kind: 'product', quantity: 1 });
  });

  it('addProduct increments quantity for the same product', () => {
    const { addProduct, entries } = withSetup();
    const product = p('p1', 90);
    addProduct(product);
    addProduct(product);
    expect(entries.value).toHaveLength(1);
    expect(entries.value[0]?.quantity).toBe(2);
  });

  it('addProduct creates separate entries for different products', () => {
    const { addProduct, entries } = withSetup();
    addProduct(p('p1', 90));
    addProduct(p('p2', 50));
    expect(entries.value).toHaveLength(2);
  });

  it('addCombo adds a combo entry with quantity 1', () => {
    const { addCombo, entries } = withSetup();
    addCombo(m('m1', 150));
    expect(entries.value[0]).toMatchObject({ kind: 'combo', quantity: 1 });
  });

  it('addCombo increments quantity for the same menu', () => {
    const { addCombo, entries } = withSetup();
    const menu = m('m1', 150);
    addCombo(menu);
    addCombo(menu);
    expect(entries.value[0]?.quantity).toBe(2);
  });

  it('remove decrements quantity by 1', () => {
    const { addProduct, remove, entries } = withSetup();
    const product = p('p1', 90);
    addProduct(product);
    addProduct(product);
    remove('p1');
    expect(entries.value[0]?.quantity).toBe(1);
  });

  it('remove deletes the entry when quantity reaches 0', () => {
    const { addProduct, remove, entries } = withSetup();
    addProduct(p('p1', 90));
    remove('p1');
    expect(entries.value).toHaveLength(0);
  });

  it('remove is a no-op for an id not in the cart', () => {
    const { addProduct, remove, entries } = withSetup();
    addProduct(p('p1', 90));
    remove('unknown');
    expect(entries.value).toHaveLength(1);
  });

  it('totalItems sums quantities across all entries', () => {
    const { addProduct, addCombo, totalItems } = withSetup();
    addProduct(p('p1', 90));
    addProduct(p('p1', 90));
    addCombo(m('m1', 150));
    expect(totalItems.value).toBe(3);
  });

  it('total sums price × quantity across all entries', () => {
    const { addProduct, addCombo, total } = withSetup();
    addProduct(p('p1', 90));
    addProduct(p('p1', 90));
    addCombo(m('m1', 150));
    expect(total.value).toBe(330); // 90*2 + 150*1
  });

  it('getQuantity returns 0 for an item not in the cart', () => {
    const { getQuantity } = withSetup();
    expect(getQuantity('p1')).toBe(0);
  });

  it('getQuantity reflects the current quantity', () => {
    const { addProduct, getQuantity } = withSetup();
    const product = p('p1', 90);
    addProduct(product);
    addProduct(product);
    expect(getQuantity('p1')).toBe(2);
  });
});

describe('useOrder — submit', () => {
  it('does not enter submitting state when the cart is empty', async () => {
    const { submit, submitting } = withSetup();
    const done = submit('table-1');
    expect(submitting.value).toBe(false);
    await done;
    await flushPromises();
    expect(submitting.value).toBe(false);
  });

  it('clears the cart after a successful submit', async () => {
    const { addProduct, submit, entries } = withSetup();
    addProduct(p('p1', 90));
    await submit('table-1');
    await flushPromises();
    expect(entries.value).toHaveLength(0);
  });
});
