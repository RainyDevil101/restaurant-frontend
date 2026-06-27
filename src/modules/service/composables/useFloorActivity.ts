import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Socket } from 'socket.io-client';
import { listOrders, type ApiOrder } from '@/shared/api/orders';
import { connectOrdersSocket } from '@/shared/api/socket';
import { ORDERS_SOCKET_EVENT } from '@/shared/api/socketEvents';
import { ApiRequestError } from '@/shared/api/client';
import { ORDER_STATUS } from '@/shared/types';
import { useTablesStore } from '@/shared/stores/venueStores';
import { SERVICE_MESSAGES, type TableActivity } from '../domain';

export function useFloorActivity() {
  const tablesStore = useTablesStore();
  const orders = ref<ApiOrder[]>([]);
  const loading = ref(false);
  const error = ref('');

  let socket: Socket | null = null;
  let connectedOnce = false;

  const activityByTable = computed<Map<string, TableActivity>>(() => {
    const map = new Map<string, TableActivity>();
    for (const order of orders.value) {
      if (order.status === ORDER_STATUS.CANCELLED || order.paid) continue;
      const current = map.get(order.tableId) ?? { open: 0, needsDelivery: false };
      current.open += 1;
      if (order.status !== ORDER_STATUS.DELIVERED) current.needsDelivery = true;
      map.set(order.tableId, current);
    }
    return map;
  });

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      orders.value = await listOrders();
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : SERVICE_MESSAGES.LOAD_FLOOR_ERROR;
    } finally {
      loading.value = false;
    }
  }

  function upsertOrder(incoming: ApiOrder) {
    const idx = orders.value.findIndex((o) => o.id === incoming.id);
    if (idx === -1) {
      orders.value = [...orders.value, incoming];
    } else {
      orders.value = orders.value.map((o) => (o.id === incoming.id ? incoming : o));
    }
  }

  function onOrderEvent(order: ApiOrder) {
    upsertOrder(order);
    void tablesStore.refresh();
  }

  onMounted(() => {
    void load();
    socket = connectOrdersSocket();
    socket.emit(ORDERS_SOCKET_EVENT.JOIN_CHECKOUT);
    socket.on(ORDERS_SOCKET_EVENT.ORDER_CREATED, onOrderEvent);
    socket.on(ORDERS_SOCKET_EVENT.ORDER_STATUS_CHANGED, onOrderEvent);
    socket.on(ORDERS_SOCKET_EVENT.CONNECT, () => {
      if (connectedOnce) {
        socket?.emit(ORDERS_SOCKET_EVENT.JOIN_CHECKOUT);
        void load();
        void tablesStore.refresh();
      }
      connectedOnce = true;
    });
  });

  onUnmounted(() => {
    if (socket) {
      socket.off(ORDERS_SOCKET_EVENT.ORDER_CREATED);
      socket.off(ORDERS_SOCKET_EVENT.ORDER_STATUS_CHANGED);
      socket.off(ORDERS_SOCKET_EVENT.CONNECT);
      socket.disconnect();
      socket = null;
    }
  });

  return { activityByTable, loading, error, reload: load };
}
