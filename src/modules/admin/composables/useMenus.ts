import { ref, computed } from 'vue'
import { mockMenus } from '@/shared/mocks'

export function useMenus() {
  const search = ref('')
  const menus = computed(() => {
    const q = search.value.trim().toLowerCase()
    return mockMenus
      .map((m) => ({ ...m, productCount: m.productIds.length }))
      .filter((m) => !q || m.name.toLowerCase().includes(q))
  })
  return { menus, search }
}
