import { ref, onMounted } from 'vue'
import { listPayments } from '@/shared/api/billing'
import { listTables } from '@/shared/api/venue'
import { ApiRequestError } from '@/shared/api/client'
import type { PaymentMethod } from '@/shared/types'

export interface PaymentRow {
  id: string
  tableName: string
  tableId: string
  method: PaymentMethod
  amount: number
  change: number
  paidAt: string
}

export function usePayments() {
  const payments = ref<PaymentRow[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [raw, tables] = await Promise.all([listPayments(), listTables()])
      const nameById = new Map(tables.map((t) => [t.id, t.name]))
      payments.value = raw.map((p) => ({
        id: p.id,
        tableName: nameById.get(p.tableId) ?? p.tableId,
        tableId: p.tableId,
        method: p.method,
        amount: p.amount,
        change: p.change,
        paidAt: p.paidAt,
      }))
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar los pagos.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { payments, loading, error, reload: load }
}
