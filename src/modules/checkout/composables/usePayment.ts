import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { listTables, updateTableStatus } from '@/shared/api/venue';
import { listOrdersByTable } from '@/shared/api/orders';
import { consolidateBill, payBill } from '@/shared/api/billing';
import { ApiRequestError } from '@/shared/api/client';
import { ORDER_STATUS, PAYMENT_METHOD, TABLE_STATUS } from '@/shared/types';
import type { PaymentMethod, Table } from '@/shared/types';
import { toast } from '@/shared/toast';

interface PaymentBillLine {
  productId: string;
  productName: string;
  quantity: number;
  subtotal: number;
  kind?: 'product' | 'combo';
}

export function usePayment() {
  const route = useRoute();

  const tableId = computed(() => {
    const raw = route.params['id'];
    return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
  });

  const table = ref<Table | null>(null);
  const lines = ref<PaymentBillLine[]>([]);
  const loading = ref(false);
  const error = ref('');
  const processing = ref(false);

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const [tables, orders] = await Promise.all([listTables(), listOrdersByTable(tableId.value)]);
      table.value = tables.find((t) => t.id === tableId.value) ?? null;
      lines.value = buildLines(orders);
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudo cargar la cuenta.';
    } finally {
      loading.value = false;
    }
  }

  function buildLines(
    orders: {
      status: string;
      paid: boolean;
      items: {
        productId: string;
        productName: string;
        quantity: number;
        subtotal: number;
        kind?: 'product' | 'combo';
      }[];
    }[],
  ): PaymentBillLine[] {
    const map = new Map<string, PaymentBillLine>();

    for (const order of orders) {
      if (order.status !== ORDER_STATUS.DELIVERED || order.paid) continue;
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
            subtotal: item.subtotal,
            kind: item.kind,
          });
        }
      }
    }
    return Array.from(map.values());
  }

  onMounted(load);

  const billLines = computed(() => lines.value);
  const billTotal = computed(() => billLines.value.reduce((sum, l) => sum + l.subtotal, 0));

  const method = ref<PaymentMethod>(PAYMENT_METHOD.CASH);
  const cashReceived = ref<number | null>(null);

  const change = computed(() => {
    if (method.value !== PAYMENT_METHOD.CASH || cashReceived.value === null) return null;
    return cashReceived.value - billTotal.value;
  });

  const canConfirm = computed(() => {
    if (billTotal.value <= 0) return false;
    if (method.value === PAYMENT_METHOD.CARD) return true;
    return cashReceived.value !== null && cashReceived.value >= billTotal.value;
  });

  async function confirmPayment() {
    processing.value = true;
    error.value = '';
    try {
      if (table.value && table.value.status === TABLE_STATUS.OCCUPIED) {
        table.value = await updateTableStatus(tableId.value, TABLE_STATUS.PENDING_PAYMENT);
      }
      await consolidateBill(tableId.value);
      const amount =
        method.value === PAYMENT_METHOD.CASH && cashReceived.value !== null
          ? cashReceived.value
          : billTotal.value;
      await payBill(tableId.value, { method: method.value, amount });
      toast.success('Pago registrado correctamente');
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudo registrar el pago.';
      throw err;
    } finally {
      processing.value = false;
    }
  }

  return {
    table,
    billLines,
    billTotal,
    method,
    cashReceived,
    change,
    canConfirm,
    loading,
    error,
    processing,
    confirmPayment,
  };
}
