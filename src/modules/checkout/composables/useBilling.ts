import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { listTables } from '@/shared/api/venue';
import { listOrdersByTable, type ApiOrder } from '@/shared/api/orders';
import { ApiRequestError } from '@/shared/api/client';
import { ORDER_STATUS } from '@/shared/types';
import type { Table } from '@/shared/types';
import { CHECKOUT_MESSAGES, type BillLine } from '../domain';

export function useBilling() {
  const route = useRoute();

  const tableId = computed(() => {
    const raw = route.params['id'];
    return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
  });

  const table = ref<Table | null>(null);
  const orders = ref<ApiOrder[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const [tableList, orderList] = await Promise.all([
        listTables(),
        listOrdersByTable(tableId.value),
      ]);
      table.value = tableList.find((t) => t.id === tableId.value) ?? null;
      orders.value = orderList;
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : CHECKOUT_MESSAGES.LOAD_BILL_ERROR;
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  const activeOrders = computed(() =>
    orders.value.filter((o) => o.status !== ORDER_STATUS.CANCELLED && !o.paid),
  );

  const billLines = computed((): BillLine[] => {
    const map = new Map<string, BillLine>();
    for (const order of activeOrders.value) {
      for (const item of order.items) {
        const existing = map.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.subtotal += item.subtotal;
        } else {
          map.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            kind: item.kind,
          });
        }
      }
    }
    return Array.from(map.values());
  });

  const billTotal = computed(() => billLines.value.reduce((sum, l) => sum + l.subtotal, 0));

  const ordersByStatus = computed(() => ({
    pending: activeOrders.value.filter((o) => o.status === ORDER_STATUS.PENDING).length,
    inProgress: activeOrders.value.filter((o) => o.status === ORDER_STATUS.IN_PROGRESS).length,
    ready: activeOrders.value.filter((o) => o.status === ORDER_STATUS.READY).length,
    delivered: activeOrders.value.filter((o) => o.status === ORDER_STATUS.DELIVERED).length,
  }));

  const hasPendingOrders = computed(
    () =>
      ordersByStatus.value.pending + ordersByStatus.value.inProgress + ordersByStatus.value.ready >
      0,
  );

  return {
    table,
    orders: orders,
    activeOrders,
    billLines,
    billTotal,
    ordersByStatus,
    hasPendingOrders,
    loading,
    error,
    reload: load,
  };
}
