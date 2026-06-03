<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'
import { Route } from '@/shared/types'
import { useCurrentTable } from '../composables/useCurrentTable'
import { useOrder } from '../composables/useOrder'
import CategoryTabs from '../components/CategoryTabs.vue'
import ProductRow from '../components/ProductRow.vue'
import OrderItemRow from '../components/OrderItemRow.vue'
import ConfirmRemoveDialog from '../components/ConfirmRemoveDialog.vue'

const router = useRouter()
const auth = useAuthStore()
const { table, tableId } = useCurrentTable()
const {
  entries,
  products,
  categories,
  menuProductIds,
  loading,
  error,
  submitting,
  totalItems,
  add,
  remove,
  submit,
} = useOrder()

const searchQuery = ref('')
const selectedCategoryId = ref<string | null>(null)

// Confirmation dialog state
const pendingRemoveId = ref<string | null>(null)
const pendingRemoveName = ref('')

function requestRemove(productId: string, productName: string) {
  const entry = entries.value.find((e) => e.product.id === productId)
  if (!entry) return
  if (entry.quantity === 1) {
    pendingRemoveId.value = productId
    pendingRemoveName.value = productName
  } else {
    remove(productId)
  }
}

function confirmRemove() {
  if (pendingRemoveId.value) remove(pendingRemoveId.value)
  pendingRemoveId.value = null
}

function cancelRemove() {
  pendingRemoveId.value = null
}

const menuProductSet = computed(() => new Set(menuProductIds.value))

const filteredProducts = computed(() =>
  products.value.filter((p) => {
    if (!menuProductSet.value.has(p.id)) return false
    if (selectedCategoryId.value !== null && p.categoryId !== selectedCategoryId.value) return false
    const q = searchQuery.value.trim().toLowerCase()
    if (q && !p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q))
      return false
    return true
  }),
)

function goBack() {
  router.push(Route.SERVICE)
}

async function handleSubmit() {
  try {
    await submit(tableId.value)
    router.push(Route.SERVICE)
  } catch {
    // error surfaced via the composable's error ref
  }
}
</script>

<template>
  <div class="order-view">
    <!-- Three-part navigation header -->
    <header class="nav-bar">
      <button class="back-btn" @click="goBack">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <span>Mesas</span>
      </button>

      <span class="app-title">Subito</span>

      <div class="user-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
        <span>{{ auth.user?.name }}</span>
      </div>
    </header>

    <!-- Scrollable content -->
    <div class="scroll-area">
      <!-- Order header row -->
      <div class="order-header">
        <h1 class="order-title">Nuevo pedido</h1>
        <span class="table-badge">{{ table?.name ?? 'Mesa' }}</span>
      </div>

      <!-- Search -->
      <div class="search-wrap">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="18"
          height="18"
          class="search-icon"
          aria-hidden="true"
        >
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
        <input v-model="searchQuery" class="search-input" placeholder="Buscar producto..." />
      </div>

      <!-- Category chips — wrapping -->
      <CategoryTabs v-model="selectedCategoryId" :categories="categories" />

      <hr class="divider" />

      <!-- Browse product list -->
      <div class="product-list">
        <p v-if="loading" class="empty-msg">Cargando…</p>
        <p v-else-if="error" class="empty-msg">{{ error }}</p>
        <template v-else>
          <ProductRow
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add="add(product)"
          />
          <p v-if="filteredProducts.length === 0" class="empty-msg">Sin resultados.</p>
        </template>
      </div>

      <!-- Current order section -->
      <template v-if="entries.length > 0">
        <div class="order-section-header">
          <div class="section-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
              />
            </svg>
            <span>Pedido de la mesa</span>
          </div>
          <span class="item-count">{{ totalItems }} ítems</span>
        </div>

        <div class="order-items">
          <OrderItemRow
            v-for="entry in entries"
            :key="entry.product.id"
            :entry="entry"
            @add="add(entry.product)"
            @remove="requestRemove(entry.product.id, entry.product.name)"
          />
        </div>
      </template>
    </div>

    <!-- Remove confirmation dialog -->
    <ConfirmRemoveDialog
      v-if="pendingRemoveId"
      :product-name="pendingRemoveName"
      :table-name="table?.name ?? 'la mesa'"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
    />

    <!-- Bottom action -->
    <div class="bottom-bar">
      <button
        class="submit-btn"
        :disabled="entries.length === 0 || submitting"
        @click="handleSubmit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        {{ submitting ? 'Enviando…' : 'Enviar a caja' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.order-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}

/* Navigation header */
.nav-bar {
  flex-shrink: 0;
  background: var(--color-primary);
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: white;
  font-size: 0.9rem;
  padding: 4px;
  border-radius: 6px;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.15);
}

.app-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

/* Scroll area */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  background: white;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Order header */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
}

.table-badge {
  background: var(--color-primary);
  color: white;
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 10px 14px;
}

.search-icon {
  flex-shrink: 0;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: #1a1a1a;
  font-family: inherit;
}

.search-input::placeholder {
  color: #9ca3af;
}

/* Divider */
.divider {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 0;
}

/* Product list */
.product-list {
  display: flex;
  flex-direction: column;
}

.empty-msg {
  padding: 1.5rem 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

/* Order section */
.order-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.25rem;
}

.section-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
  font-size: 0.875rem;
}

.item-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #888;
}

.order-items {
  display: flex;
  flex-direction: column;
}

/* Bottom bar */
.bottom-bar {
  flex-shrink: 0;
  padding: 1rem 1.25rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}

.submit-btn:active {
  background: var(--color-primary-dark);
}

.submit-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}
</style>
