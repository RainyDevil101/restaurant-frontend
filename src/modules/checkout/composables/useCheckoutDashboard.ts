import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Socket } from 'socket.io-client'
import { listTables } from '@/shared/api/venue'
import { listOrders, type ApiOrder } from '@/shared/api/orders'
import { connectOrdersSocket } from '@/shared/api/socket'
import { ApiRequestError } from '@/shared/api/client'
import { ORDER_STATUS, TABLE_STATUS } from '@/shared/types'
import type { Table } from '@/shared/types'

export interface TableSummary {
  table: Table
  total: number
  hasNewOrder: boolean
}

export interface BillLine {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  kind?: 'product' | 'combo'
}

const SOCKET_EVENT = {
  JOIN_CHECKOUT: 'joinCheckout',
  ORDER_CREATED: 'orderCreated',
  ORDER_STATUS_CHANGED: 'orderStatusChanged',
} as const

export function useCheckoutDashboard() {
  const selectedTableId = ref<string | null>(null)
  const tables = ref<Table[]>([])
  const orders = ref<ApiOrder[]>([])
  const loading = ref(false)
  const error = ref('')

  let socket: Socket | null = null

  const billableOrders = computed(() =>
    orders.value.filter((o) => o.status !== ORDER_STATUS.CANCELLED),
  )

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [tableList, orderList] = await Promise.all([listTables(), listOrders()])
      tables.value = tableList
      orders.value = orderList
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudo cargar el tablero.'
    } finally {
      loading.value = false
    }
  }

  function upsertOrder(incoming: ApiOrder) {
    const idx = orders.value.findIndex((o) => o.id === incoming.id)
    if (idx === -1) {
      orders.value = [...orders.value, incoming]
    } else {
      orders.value = orders.value.map((o) => (o.id === incoming.id ? incoming : o))
    }
  }

  onMounted(async () => {
    await load()
    socket = connectOrdersSocket()
    socket.emit(SOCKET_EVENT.JOIN_CHECKOUT)
    socket.on(SOCKET_EVENT.ORDER_CREATED, (order: ApiOrder) => {
      upsertOrder(order)
    })
    socket.on(SOCKET_EVENT.ORDER_STATUS_CHANGED, (order: ApiOrder) => {
      upsertOrder(order)
    })
  })

  onUnmounted(() => {
    if (socket) {
      socket.off(SOCKET_EVENT.ORDER_CREATED)
      socket.off(SOCKET_EVENT.ORDER_STATUS_CHANGED)
      socket.disconnect()
      socket = null
    }
  })

  const activeTables = computed((): TableSummary[] =>
    tables.value
      .filter((t) => t.status !== TABLE_STATUS.FREE)
      .map((table) => {
        const tableOrders = billableOrders.value.filter((o) => o.tableId === table.id)
        const total = tableOrders.reduce((sum, o) => sum + o.total, 0)
        const hasNewOrder = tableOrders.some((o) => o.status === ORDER_STATUS.PENDING)
        return { table, total, hasNewOrder }
      }),
  )

  const selectedSummary = computed(
    () => activeTables.value.find((s) => s.table.id === selectedTableId.value) ?? null,
  )

  const billLines = computed((): BillLine[] => {
    if (!selectedTableId.value) return []
    const tableOrders = billableOrders.value.filter((o) => o.tableId === selectedTableId.value)
    const map = new Map<string, BillLine>()

    for (const order of tableOrders) {
      for (const item of order.items) {
        const existing = map.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.subtotal += item.subtotal
        } else {
          map.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            kind: item.kind,
          })
        }
      }
    }

    return Array.from(map.values())
  })

  const billTotal = computed(() => billLines.value.reduce((sum, l) => sum + l.subtotal, 0))

  return {
    activeTables,
    selectedTableId,
    selectedSummary,
    billLines,
    billTotal,
    loading,
    error,
    reload: load,
  }
}
