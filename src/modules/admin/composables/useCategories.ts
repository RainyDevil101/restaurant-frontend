import { ref, computed } from 'vue'
import { mockCategories, mockProducts } from '@/shared/mocks'

export function useCategories() {
  const search = ref('')
  const categories = computed(() => {
    const q = search.value.trim().toLowerCase()
    return mockCategories
      .map((c) => ({
        ...c,
        productCount: mockProducts.filter((p) => p.categoryId === c.id).length,
      }))
      .filter((c) => !q || c.name.toLowerCase().includes(q))
  })
  return { categories, search }
}
