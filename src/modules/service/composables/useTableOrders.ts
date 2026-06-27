import { ref, computed, watch, onMounted } from 'vue';
import { listOrdersByTable, updateOrderStatus, type ApiOrder } from '@/shared/api/orders';
import { ApiRequestError } from '@/shared/api/client';
import { ORDER_STATUS } from '@/shared/types';
import { toast } from '@/shared/toast';
import { SERVICE_MESSAGES } from '../domain';

export function useTableOrders(tableId: () => string) {
  const orders = ref<ApiOrder[]>([]);
  const loading = ref(false);
  const error = ref('');
  const deliveringId = ref<string | null>(null);

  const openAccountOrders = computed(() =>
    orders.value.filter((o) => o.status !== ORDER_STATUS.CANCELLED && !o.paid),
  );

  async function load() {
    const id = tableId();
    if (!id) {
      orders.value = [];
      return;
    }
    loading.value = true;
    error.value = '';
    try {
      orders.value = await listOrdersByTable(id);
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : SERVICE_MESSAGES.LOAD_ORDERS_ERROR;
    } finally {
      loading.value = false;
    }
  }

  async function markDelivered(orderId: string) {
    const previous = orders.value;
    deliveringId.value = orderId;
    error.value = '';
    orders.value = orders.value.map((o) =>
      o.id === orderId ? { ...o, status: ORDER_STATUS.DELIVERED } : o,
    );
    try {
      await updateOrderStatus(orderId, ORDER_STATUS.DELIVERED);
      toast.success(SERVICE_MESSAGES.ORDER_DELIVERED);
    } catch (err) {
      orders.value = previous;
      error.value =
        err instanceof ApiRequestError ? err.message : SERVICE_MESSAGES.ORDER_DELIVER_ERROR;
    } finally {
      deliveringId.value = null;
    }
  }

  onMounted(load);
  watch(tableId, load);

  return { openAccountOrders, loading, error, deliveringId, load, markDelivered };
}
