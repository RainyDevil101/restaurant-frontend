import { ref, computed } from 'vue';
import { createOrder, type OrderItemInput } from '@/shared/api/orders';
import { updateTableStatus } from '@/shared/api/venue';
import { ApiRequestError } from '@/shared/api/client';
import { TABLE_STATUS } from '@/shared/types';
import type { Product, Category, Menu } from '@/shared/types';
import { useProductsStore, useCategoriesStore, useMenusStore } from '@/shared/stores/catalogStores';
import { useTablesStore } from '@/shared/stores/venueStores';
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness';
import { toast } from '@/shared/toast';
import { ORDER_ENTRY_KIND, SERVICE_MESSAGES, type OrderEntry } from '../domain';

function entryId(entry: OrderEntry): string {
  return entry.kind === ORDER_ENTRY_KIND.COMBO ? entry.menu.id : entry.product.id;
}

function entryPrice(entry: OrderEntry): number {
  return entry.kind === ORDER_ENTRY_KIND.COMBO ? entry.menu.price : entry.product.price;
}

export function useOrder() {
  const productsStore = useProductsStore();
  const categoriesStore = useCategoriesStore();
  const menusStore = useMenusStore();
  const tablesStore = useTablesStore();
  const { invalidateAndRefresh } = useCatalogFreshness();

  const entries = ref<OrderEntry[]>([]);
  const submitting = ref(false);

  const products = computed<Product[]>(() => productsStore.items);
  const categories = computed<Category[]>(() => categoriesStore.items);
  const combos = computed<Menu[]>(() => menusStore.items.filter((m) => m.active));

  const loading = computed(
    () => productsStore.loading || categoriesStore.loading || menusStore.loading,
  );
  const error = computed(
    () => productsStore.error ?? categoriesStore.error ?? menusStore.error ?? '',
  );

  const totalItems = computed(() => entries.value.reduce((sum, e) => sum + e.quantity, 0));

  const total = computed(() =>
    entries.value.reduce((sum, e) => sum + entryPrice(e) * e.quantity, 0),
  );

  function getQuantity(id: string): number {
    return entries.value.find((e) => entryId(e) === id)?.quantity ?? 0;
  }

  function addProduct(product: Product) {
    const entry = entries.value.find(
      (e) => e.kind === ORDER_ENTRY_KIND.PRODUCT && e.product.id === product.id,
    );
    if (entry) {
      entry.quantity++;
    } else {
      entries.value.push({ kind: ORDER_ENTRY_KIND.PRODUCT, product, quantity: 1 });
    }
  }

  function addCombo(menu: Menu) {
    const entry = entries.value.find(
      (e) => e.kind === ORDER_ENTRY_KIND.COMBO && e.menu.id === menu.id,
    );
    if (entry) {
      entry.quantity++;
    } else {
      entries.value.push({ kind: ORDER_ENTRY_KIND.COMBO, menu, quantity: 1 });
    }
  }

  function remove(id: string) {
    const idx = entries.value.findIndex((e) => entryId(e) === id);
    if (idx === -1) return;
    const entry = entries.value[idx];
    if (!entry) return;
    if (entry.quantity <= 1) {
      entries.value.splice(idx, 1);
    } else {
      entry.quantity--;
    }
  }

  function clear() {
    entries.value = [];
  }

  async function submit(tableId: string): Promise<boolean> {
    if (entries.value.length === 0) return false;
    submitting.value = true;
    try {
      const items: OrderItemInput[] = entries.value.map((e) =>
        e.kind === ORDER_ENTRY_KIND.COMBO
          ? { menuId: e.menu.id, quantity: e.quantity }
          : { productId: e.product.id, quantity: e.quantity },
      );
      await createOrder({ tableId, items });
      await tablesStore.ensureLoaded();
      const table = tablesStore.byId(tableId);
      if (table && table.status === TABLE_STATUS.FREE) {
        await updateTableStatus(tableId, TABLE_STATUS.OCCUPIED);
        tablesStore.invalidate();
      }
      clear();
      toast.success(SERVICE_MESSAGES.ORDER_SENT);
      return true;
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : SERVICE_MESSAGES.ORDER_SUBMIT_ERROR;
      toast.error(message);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  return {
    entries,
    products,
    categories,
    combos,
    loading,
    error,
    submitting,
    totalItems,
    total,
    getQuantity,
    addProduct,
    addCombo,
    remove,
    submit,
    reload: () => invalidateAndRefresh(),
  };
}
