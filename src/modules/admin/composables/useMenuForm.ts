import { reactive } from 'vue';
import { useAdminDialog } from './useAdminDialog';
import { ADMIN_LABELS, PRODUCT_PRICE_MAX } from '../constants';
import type { MenuInput } from '@/shared/api/catalog';
import type { MenuItem } from '@/shared/types';
import type { MenuRow } from '../domain';

interface MenuFormDeps {
  createMenu: (input: MenuInput) => Promise<void>;
  updateMenu: (id: string, input: Partial<MenuInput>) => Promise<void>;
}

export function useMenuForm({ createMenu, updateMenu }: MenuFormDeps) {
  const dialog = useAdminDialog();
  const form = reactive<{ name: string; items: MenuItem[]; price: number }>({
    name: '',
    items: [],
    price: 0,
  });

  function openCreate() {
    form.name = '';
    form.items = [];
    form.price = 0;
    dialog.openCreate();
  }

  function openEdit(menu: MenuRow) {
    form.name = menu.name;
    form.items = menu.items.map((i) => ({ ...i }));
    form.price = menu.price;
    dialog.openEdit(menu.id);
  }

  function clampPrice() {
    form.price = Math.round(form.price);
    if (form.price > PRODUCT_PRICE_MAX) form.price = PRODUCT_PRICE_MAX;
    if (form.price < 0) form.price = 0;
  }

  function isSelected(productId: string) {
    return form.items.some((i) => i.productId === productId);
  }

  function toggleProduct(productId: string) {
    const index = form.items.findIndex((i) => i.productId === productId);
    if (index === -1) form.items.push({ productId, quantity: 1 });
    else form.items.splice(index, 1);
  }

  function getQuantity(productId: string): number {
    return form.items.find((i) => i.productId === productId)?.quantity ?? 1;
  }

  function setQuantity(productId: string, quantity: number) {
    const item = form.items.find((i) => i.productId === productId);
    if (!item) return;
    const next = Math.max(1, Math.floor(quantity));
    item.quantity = Number.isNaN(next) ? 1 : next;
  }

  async function save() {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      dialog.formError.value = ADMIN_LABELS.menu.nameRequired;
      return;
    }
    if (form.items.length === 0) {
      dialog.formError.value = ADMIN_LABELS.menu.productsRequired;
      return;
    }
    if (!Number.isInteger(form.price) || form.price < 0 || form.price > PRODUCT_PRICE_MAX) {
      dialog.formError.value = ADMIN_LABELS.menu.priceInvalid;
      return;
    }
    const payload = { name: trimmedName, items: form.items, price: form.price };
    await dialog.runSave(async () => {
      if (dialog.editingId.value) await updateMenu(dialog.editingId.value, payload);
      else await createMenu(payload);
    });
  }

  return {
    dialogOpen: dialog.dialogOpen,
    editingId: dialog.editingId,
    saving: dialog.saving,
    formError: dialog.formError,
    closeDialog: dialog.closeDialog,
    form,
    openCreate,
    openEdit,
    clampPrice,
    isSelected,
    toggleProduct,
    getQuantity,
    setQuantity,
    save,
  };
}
