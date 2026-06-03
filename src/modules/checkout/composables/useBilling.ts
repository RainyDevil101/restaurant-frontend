import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { listTables } from '@/shared/api/venue'
import { listProducts } from '@/shared/api/catalog'
import { listOrdersByTable, type ApiOrder } from '@/shared/api/orders'
import { ApiRequestError } from '@/shared/api/client'
import { ORDER_STATUS } from '@/shared/types'
import type { Table, Product } from '@/shared/types'

export interface BillingLine {
  productId: string
  productName: string
  categoryId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export function useBilling() {
  const route = useRoute()

  const tableId = computed(() => {
    const raw = route.params['id']
    return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '')
  })

  const table = ref<Table | null>(null)
  const orders = ref<ApiOrder[]>([])
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [tableList, orderList, productList] = await Promise.all([
        listTables(),
        listOrdersByTable(tableId.value),
        listProducts(),
      ])
      table.value = tableList.find((t) => t.id === tableId.value) ?? null
      orders.value = orderList
      products.value = productList
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudo cargar la cuenta.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  function categoryOf(productId: string): string {
    return products.value.find((p) => p.id === productId)?.categoryId ?? ''
  }

  const activeOrders = computed(() =>
    orders.value.filter((o) => o.status !== ORDER_STATUS.CANCELLED),
  )

  const billLines = computed((): BillingLine[] => {
    const map = new Map<string, BillingLine>()
    for (const order of activeOrders.value) {
      for (const item of order.items) {
        const existing = map.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.subtotal += item.subtotal
        } else {
          map.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            categoryId: categoryOf(item.productId),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })
        }
      }
    }
    return Array.from(map.values())
  })

  const billTotal = computed(() => billLines.value.reduce((sum, l) => sum + l.subtotal, 0))

  const ordersByStatus = computed(() => ({
    pending: activeOrders.value.filter((o) => o.status === ORDER_STATUS.PENDING).length,
    inProgress: activeOrders.value.filter((o) => o.status === ORDER_STATUS.IN_PROGRESS).length,
    ready: activeOrders.value.filter((o) => o.status === ORDER_STATUS.READY).length,
    delivered: activeOrders.value.filter((o) => o.status === ORDER_STATUS.DELIVERED).length,
  }))

  const hasPendingOrders = computed(
    () => ordersByStatus.value.pending + ordersByStatus.value.inProgress + ordersByStatus.value.ready > 0,
  )

  return {
    table,
    orders: activeOrders,
    billLines,
    billTotal,
    ordersByStatus,
    hasPendingOrders,
    loading,
    error,
  }
}
