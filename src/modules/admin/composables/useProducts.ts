import { ref, computed } from 'vue'
import { mockProducts, mockCategories } from '@/shared/mocks'

export function useProducts() {
  const search = ref('')

  const products = computed(() => {
    const q = search.value.trim().toLowerCase()
    return mockProducts
      .map((p) => ({
        ...p,
        categoryName: mockCategories.find((c) => c.id === p.categoryId)?.name ?? '—',
      }))
      .filter((p) => !q || p.name.toLowerCase().includes(q))
  })

  return { products, search }
}
