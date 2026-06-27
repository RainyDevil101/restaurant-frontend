import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import type { MenuInput } from '@/shared/api/catalog';

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}));

import { useMenuForm } from '@/modules/admin/composables/useMenuForm';
import type { MenuRow } from '@/modules/admin/domain';
import { ADMIN_LABELS, PRODUCT_PRICE_MAX } from '@/modules/admin/constants';

interface Deps {
  createMenu: ReturnType<typeof vi.fn<(input: MenuInput) => Promise<void>>>;
  updateMenu: ReturnType<typeof vi.fn<(id: string, input: Partial<MenuInput>) => Promise<void>>>;
}

function makeDeps(): Deps {
  return {
    createMenu: vi.fn<(input: MenuInput) => Promise<void>>().mockResolvedValue(undefined),
    updateMenu: vi
      .fn<(id: string, input: Partial<MenuInput>) => Promise<void>>()
      .mockResolvedValue(undefined),
  };
}

function withSetup(deps: Deps): ReturnType<typeof useMenuForm> {
  let result!: ReturnType<typeof useMenuForm>;
  mount(
    defineComponent({
      setup() {
        result = useMenuForm(deps);
        return () => h('div');
      },
    }),
  );
  return result;
}

const menuRow: MenuRow = {
  id: 'm1',
  name: 'Combo',
  items: [{ productId: 'p1', quantity: 2 }],
  active: true,
  price: 150,
  productCount: 1,
};

describe('useMenuForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('openCreate resets the form to an empty draft', () => {
    const deps = makeDeps();
    const { form, dialogOpen, editingId, openCreate } = withSetup(deps);
    openCreate();
    expect(dialogOpen.value).toBe(true);
    expect(editingId.value).toBeNull();
    expect(form.name).toBe('');
    expect(form.items).toEqual([]);
    expect(form.price).toBe(0);
  });

  it('openEdit populates the form with a deep copy of items', () => {
    const deps = makeDeps();
    const { form, editingId, openEdit } = withSetup(deps);
    openEdit(menuRow);
    expect(editingId.value).toBe('m1');
    expect(form.name).toBe('Combo');
    expect(form.price).toBe(150);
    expect(form.items).toEqual([{ productId: 'p1', quantity: 2 }]);
    // mutating the form must not mutate the source row
    form.items[0]!.quantity = 9;
    expect(menuRow.items[0]!.quantity).toBe(2);
  });

  it('toggleProduct adds then removes a product, isSelected tracks it', () => {
    const deps = makeDeps();
    const { isSelected, toggleProduct } = withSetup(deps);
    expect(isSelected('p1')).toBe(false);
    toggleProduct('p1');
    expect(isSelected('p1')).toBe(true);
    toggleProduct('p1');
    expect(isSelected('p1')).toBe(false);
  });

  it('getQuantity defaults to 1 and setQuantity floors to a minimum of 1', () => {
    const deps = makeDeps();
    const { toggleProduct, getQuantity, setQuantity } = withSetup(deps);
    toggleProduct('p1');
    expect(getQuantity('p1')).toBe(1);
    setQuantity('p1', 4.8);
    expect(getQuantity('p1')).toBe(4);
    setQuantity('p1', 0);
    expect(getQuantity('p1')).toBe(1);
  });

  it('clampPrice rounds and clamps to the [0, max] range', () => {
    const deps = makeDeps();
    const { form, clampPrice } = withSetup(deps);
    form.price = 99.6;
    clampPrice();
    expect(form.price).toBe(100);
    form.price = -1;
    clampPrice();
    expect(form.price).toBe(0);
    form.price = PRODUCT_PRICE_MAX + 1;
    clampPrice();
    expect(form.price).toBe(PRODUCT_PRICE_MAX);
  });

  it('save rejects an empty name', async () => {
    const deps = makeDeps();
    const { form, formError, save } = withSetup(deps);
    form.name = '   ';
    await save();
    expect(formError.value).toBe(ADMIN_LABELS.menu.nameRequired);
    expect(deps.createMenu).not.toHaveBeenCalled();
  });

  it('save rejects when no products are selected', async () => {
    const deps = makeDeps();
    const { form, formError, save } = withSetup(deps);
    form.name = 'Combo';
    await save();
    expect(formError.value).toBe(ADMIN_LABELS.menu.productsRequired);
    expect(deps.createMenu).not.toHaveBeenCalled();
  });

  it('save rejects a non-integer price', async () => {
    const deps = makeDeps();
    const { form, formError, toggleProduct, save } = withSetup(deps);
    form.name = 'Combo';
    toggleProduct('p1');
    form.price = 10.5;
    await save();
    expect(formError.value).toBe(ADMIN_LABELS.menu.priceInvalid);
    expect(deps.createMenu).not.toHaveBeenCalled();
  });

  it('save creates a menu with a trimmed name when not editing', async () => {
    const deps = makeDeps();
    const { form, dialogOpen, toggleProduct, save } = withSetup(deps);
    form.name = '  Combo  ';
    toggleProduct('p1');
    form.price = 150;
    await save();
    expect(deps.createMenu).toHaveBeenCalledWith({
      name: 'Combo',
      items: [{ productId: 'p1', quantity: 1 }],
      price: 150,
    });
    expect(dialogOpen.value).toBe(false);
  });

  it('save updates an existing menu when editing', async () => {
    const deps = makeDeps();
    const { form, openEdit, save } = withSetup(deps);
    openEdit(menuRow);
    form.price = 175;
    await save();
    expect(deps.updateMenu).toHaveBeenCalledWith('m1', {
      name: 'Combo',
      items: [{ productId: 'p1', quantity: 2 }],
      price: 175,
    });
    expect(deps.createMenu).not.toHaveBeenCalled();
  });
});
