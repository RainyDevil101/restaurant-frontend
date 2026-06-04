import { ref, computed, watch, onMounted } from 'vue'
import { listOrdersByTable, updateOrderStatus, type ApiOrder } from '@/shared/api/orders'
import { ApiRequestError } from '@/shared/api/client'
import { ORDER_STATUS } from '@/shared/types'

export function useTableOrders(tableId: () => string) {
  const orders = ref<ApiOrder[]>([])
  const loading = ref(false)
  const error = ref('')
  const deliveringId = ref<string | null>(null)

  const inProgress = computed(() =>
    orders.value.filter(
      (o) => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.CANCELLED,
    ),
  )

  async function load() {
    const id = tableId()
    if (!id) {
      orders.value = []
      return
    }
    loading.value = true
    error.value = ''
    try {
      orders.value = await listOrdersByTable(id)
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar los pedidos.'
    } finally {
      loading.value = false
    }
  }

  async function markDelivered(orderId: string) {
    deliveringId.value = orderId
    error.value = ''
    try {
      await updateOrderStatus(orderId, ORDER_STATUS.DELIVERED)
      orders.value = orders.value.filter((o) => o.id !== orderId)
    } catch (err) {
      error.value =
        err instanceof ApiRequestError
          ? err.message
          : 'No se pudo marcar el pedido como entregado.'
    } finally {
      deliveringId.value = null
    }
  }

  onMounted(load)
  watch(tableId, load)

  return { inProgress, loading, error, deliveringId, load, markDelivered }
}
