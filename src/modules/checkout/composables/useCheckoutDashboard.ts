import { ref, computed } from 'vue'
import { mockTables, mockOrders } from '@/shared/mocks'
import type { Table } from '@/shared/types'

export interface TableSummary {
  table: Table
  total: number
  hasNewOrder: boolean
}

export interface BillLine {
  productId: string
  productName: string
  categoryId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export function useCheckoutDashboard() {
  const selectedTableId = ref<string | null>(null)

  const activeTables = computed((): TableSummary[] =>
    mockTables
      .filter((t) => t.status !== 'libre')
      .map((table) => {
        const orders = mockOrders.filter((o) => o.tableId === table.id)
        const total = orders.reduce(
          (sum, o) => sum + o.items.reduce((s, i) => s + i.product.price * i.quantity, 0),
          0,
        )
        const hasNewOrder = orders.some((o) => o.status === 'pendiente')
        return { table, total, hasNewOrder }
      }),
  )

  const selectedSummary = computed(
    () => activeTables.value.find((s) => s.table.id === selectedTableId.value) ?? null,
  )

  const billLines = computed((): BillLine[] => {
    if (!selectedTableId.value) return []
    const orders = mockOrders.filter((o) => o.tableId === selectedTableId.value)
    const map = new Map<string, BillLine>()

    for (const order of orders) {
      for (const item of order.items) {
        const existing = map.get(item.product.id)
        if (existing) {
          existing.quantity += item.quantity
          existing.subtotal += item.product.price * item.quantity
        } else {
          map.set(item.product.id, {
            productId: item.product.id,
            productName: item.product.name,
            categoryId: item.product.categoryId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: item.product.price * item.quantity,
          })
        }
      }
    }

    return Array.from(map.values())
  })

  const billTotal = computed(() => billLines.value.reduce((sum, l) => sum + l.subtotal, 0))

  return { activeTables, selectedTableId, selectedSummary, billLines, billTotal }
}
