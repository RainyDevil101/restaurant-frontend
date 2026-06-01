import { ref, computed } from 'vue'
import type { Product } from '@/shared/types'

interface OrderEntry {
  product: Product
  quantity: number
}

export function useOrder() {
  const entries = ref<OrderEntry[]>([])

  const totalItems = computed(() => entries.value.reduce((sum, e) => sum + e.quantity, 0))

  const total = computed(() =>
    entries.value.reduce((sum, e) => sum + e.product.price * e.quantity, 0),
  )

  function getQuantity(productId: string): number {
    return entries.value.find((e) => e.product.id === productId)?.quantity ?? 0
  }

  function add(product: Product) {
    const entry = entries.value.find((e) => e.product.id === product.id)
    if (entry) {
      entry.quantity++
    } else {
      entries.value.push({ product, quantity: 1 })
    }
  }

  function remove(productId: string) {
    const idx = entries.value.findIndex((e) => e.product.id === productId)
    if (idx === -1) return
    const entry = entries.value[idx]
    if (!entry) return
    if (entry.quantity <= 1) {
      entries.value.splice(idx, 1)
    } else {
      entry.quantity--
    }
  }

  function clear() {
    entries.value = []
  }

  return { entries, totalItems, total, getQuantity, add, remove, clear }
}
