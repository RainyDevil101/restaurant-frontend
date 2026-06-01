import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { mockTables, mockOrders } from '@/shared/mocks'
import type { PaymentMethod } from '@/shared/types'
import { PAYMENT_METHOD } from '@/shared/types'

export function usePayment() {
  const route = useRoute()

  const tableId = computed(() => {
    const raw = route.params['id']
    return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '')
  })

  const table = computed(() => mockTables.find((t) => t.id === tableId.value) ?? null)

  const billLines = computed(() => {
    const orders = mockOrders.filter((o) => o.tableId === tableId.value)
    const map = new Map<string, { productName: string; categoryId: string; quantity: number; subtotal: number }>()

    for (const order of orders) {
      for (const item of order.items) {
        const existing = map.get(item.product.id)
        if (existing) {
          existing.quantity += item.quantity
          existing.subtotal += item.product.price * item.quantity
        } else {
          map.set(item.product.id, {
            productName: item.product.name,
            categoryId: item.product.categoryId,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
          })
        }
      }
    }
    return Array.from(map.values())
  })

  const billTotal = computed(() => billLines.value.reduce((sum, l) => sum + l.subtotal, 0))

  const method = ref<PaymentMethod>(PAYMENT_METHOD.CASH)
  const cashReceived = ref<number | null>(null)

  const change = computed(() => {
    if (method.value !== PAYMENT_METHOD.CASH || cashReceived.value === null) return null
    return cashReceived.value - billTotal.value
  })

  const canConfirm = computed(() => {
    if (method.value === PAYMENT_METHOD.CARD) return true
    return cashReceived.value !== null && cashReceived.value >= billTotal.value
  })

  return { table, billLines, billTotal, method, cashReceived, change, canConfirm }
}
