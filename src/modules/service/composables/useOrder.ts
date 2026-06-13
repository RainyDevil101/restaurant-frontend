import { ref, computed, onMounted } from 'vue';
import { listProducts, listCategories, listMenus } from '@/shared/api/catalog';
import { createOrder, type OrderItemInput } from '@/shared/api/orders';
import { updateTableStatus, listTables } from '@/shared/api/venue';
import { ApiRequestError } from '@/shared/api/client';
import { TABLE_STATUS } from '@/shared/types';
import type { Product, Category, Menu } from '@/shared/types';
import { toast } from '@/shared/toast';

export interface ProductEntry {
  kind: 'product';
  product: Product;
  quantity: number;
}

export interface ComboEntry {
  kind: 'combo';
  menu: Menu;
  quantity: number;
}

export type OrderEntry = ProductEntry | ComboEntry;

function entryId(entry: OrderEntry): string {
  return entry.kind === 'combo' ? entry.menu.id : entry.product.id;
}

function entryPrice(entry: OrderEntry): number {
  return entry.kind === 'combo' ? entry.menu.price : entry.product.price;
}

export function useOrder() {
  const entries = ref<OrderEntry[]>([]);
  const products = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const menus = ref<Menu[]>([]);
  const loading = ref(false);
  const error = ref('');
  const submitting = ref(false);

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const [prods, cats, mens] = await Promise.all([
        listProducts(),
        listCategories(),
        listMenus(),
      ]);
      products.value = prods;
      categories.value = cats;
      menus.value = mens;
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudo cargar el menú.';
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  const combos = computed(() => menus.value.filter((m) => m.active));

  const totalItems = computed(() => entries.value.reduce((sum, e) => sum + e.quantity, 0));

  const total = computed(() =>
    entries.value.reduce((sum, e) => sum + entryPrice(e) * e.quantity, 0),
  );

  function getQuantity(id: string): number {
    return entries.value.find((e) => entryId(e) === id)?.quantity ?? 0;
  }

  function addProduct(product: Product) {
    const entry = entries.value.find((e) => e.kind === 'product' && e.product.id === product.id);
    if (entry) {
      entry.quantity++;
    } else {
      entries.value.push({ kind: 'product', product, quantity: 1 });
    }
  }

  function addCombo(menu: Menu) {
    const entry = entries.value.find((e) => e.kind === 'combo' && e.menu.id === menu.id);
    if (entry) {
      entry.quantity++;
    } else {
      entries.value.push({ kind: 'combo', menu, quantity: 1 });
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

  async function submit(tableId: string) {
    if (entries.value.length === 0) return;
    submitting.value = true;
    error.value = '';
    try {
      const items: OrderItemInput[] = entries.value.map((e) =>
        e.kind === 'combo'
          ? { menuId: e.menu.id, quantity: e.quantity }
          : { productId: e.product.id, quantity: e.quantity },
      );
      await createOrder({ tableId, items });
      const tables = await listTables();
      const table = tables.find((t) => t.id === tableId);
      if (table && table.status === TABLE_STATUS.FREE) {
        await updateTableStatus(tableId, TABLE_STATUS.OCCUPIED);
      }
      clear();
      toast.success('Pedido enviado a caja');
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudo enviar el pedido.';
      throw err;
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
  };
}
