import { ref, computed, onMounted } from 'vue'
import { listProducts, listCategories } from '@/shared/api/catalog'
import { createOrder } from '@/shared/api/orders'
import { updateTableStatus, listTables } from '@/shared/api/venue'
import { ApiRequestError } from '@/shared/api/client'
import { TABLE_STATUS } from '@/shared/types'
import type { Product, Category } from '@/shared/types'

interface OrderEntry {
  product: Product
  quantity: number
}

export function useOrder() {
  const entries = ref<OrderEntry[]>([])
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref('')
  const submitting = ref(false)

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [prods, cats] = await Promise.all([listProducts(), listCategories()])
      products.value = prods
      categories.value = cats
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudo cargar el menú.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

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

  async function submit(tableId: string) {
    if (entries.value.length === 0) return
    submitting.value = true
    error.value = ''
    try {
      await createOrder({
        tableId,
        items: entries.value.map((e) => ({ productId: e.product.id, quantity: e.quantity })),
      })
      const tables = await listTables()
      const table = tables.find((t) => t.id === tableId)
      if (table && table.status === TABLE_STATUS.FREE) {
        await updateTableStatus(tableId, TABLE_STATUS.OCCUPIED)
      }
      clear()
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudo enviar el pedido.'
      throw err
    } finally {
      submitting.value = false
    }
  }

  return {
    entries,
    products,
    categories,
    loading,
    error,
    submitting,
    totalItems,
    total,
    getQuantity,
    add,
    remove,
    clear,
    submit,
  }
}
