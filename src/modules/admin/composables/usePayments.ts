import { ref, onMounted } from 'vue';
import { listPayments } from '@/shared/api/billing';
import { listTables } from '@/shared/api/venue';
import { listUsers } from '@/shared/api/users';
import { ApiRequestError } from '@/shared/api/client';
import { ADMIN_MESSAGES, type PaymentRow } from '../domain';

export function usePayments() {
  const payments = ref<PaymentRow[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const [raw, tables, users] = await Promise.all([listPayments(), listTables(), listUsers()]);
      const tableNameById = new Map(tables.map((t) => [t.id, t.name]));
      const userNameById = new Map(users.map((u) => [u.id, u.name]));
      payments.value = raw.map((p) => ({
        id: p.id,
        tableName: tableNameById.get(p.tableId) ?? p.tableId,
        tableId: p.tableId,
        method: p.method,
        amount: p.amount,
        change: p.change,
        paidAt: p.paidAt,
        items: p.items,
        waiterNames: p.waiterIds.map((id) => userNameById.get(id) ?? id),
      }));
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.LOAD_PAYMENTS_ERROR;
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  return { payments, loading, error, reload: load };
}
