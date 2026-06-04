<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'
import { Route } from '@/shared/types'
import { useCurrentTable } from '../composables/useCurrentTable'
import { useOrder } from '../composables/useOrder'
import { useTableOrders } from '../composables/useTableOrders'
import OrderNavBar from '../components/OrderNavBar.vue'
import OrderHeaderRow from '../components/OrderHeaderRow.vue'
import InProgressOrders from '../components/InProgressOrders.vue'
import CatalogPanel from '../components/CatalogPanel.vue'
import OrderSummarySection from '../components/OrderSummarySection.vue'
import SubmitOrderBar from '../components/SubmitOrderBar.vue'
import ConfirmRemoveDialog from '../components/ConfirmRemoveDialog.vue'
import type { OrderEntry } from '../composables/useOrder'

const router = useRouter()
const auth = useAuthStore()
const { table, tableId } = useCurrentTable()
const {
  entries,
  products,
  categories,
  combos,
  loading,
  error,
  submitting,
  totalItems,
  addProduct,
  addCombo,
  remove,
  submit,
} = useOrder()
const {
  openAccountOrders,
  error: ordersError,
  deliveringId,
  load: reloadOrders,
  markDelivered,
} = useTableOrders(() => tableId.value)

const searchQuery = ref('')
const selectedCategoryId = ref<string | null>(null)

const pendingRemoveId = ref<string | null>(null)
const pendingRemoveName = ref('')

function entryId(entry: OrderEntry): string {
  return entry.kind === 'combo' ? entry.menu.id : entry.product.id
}

function entryName(entry: OrderEntry): string {
  return entry.kind === 'combo' ? entry.menu.name : entry.product.name
}

function readd(entry: OrderEntry) {
  if (entry.kind === 'combo') addCombo(entry.menu)
  else addProduct(entry.product)
}

function requestRemove(entry: OrderEntry) {
  const id = entryId(entry)
  if (entry.quantity === 1) {
    pendingRemoveId.value = id
    pendingRemoveName.value = entryName(entry)
  } else {
    remove(id)
  }
}

function confirmRemove() {
  if (pendingRemoveId.value) remove(pendingRemoveId.value)
  pendingRemoveId.value = null
}

function cancelRemove() {
  pendingRemoveId.value = null
}

function goBack() {
  router.push(Route.SERVICE)
}

async function handleSubmit() {
  try {
    await submit(tableId.value)
    await reloadOrders()
    router.push(Route.SERVICE)
  } catch {
    // error surfaced via the composable's error ref
  }
}
</script>

<template>
  <div class="order-view">
    <OrderNavBar :user-name="auth.user?.name" @back="goBack" />

    <div class="scroll-area">
      <OrderHeaderRow :table-name="table?.name ?? 'Mesa'" />

      <InProgressOrders
        v-if="openAccountOrders.length > 0"
        :orders="openAccountOrders"
        :error="ordersError"
        :delivering-id="deliveringId"
        @deliver="markDelivered"
      />

      <CatalogPanel
        v-model:search-query="searchQuery"
        v-model:selected-category-id="selectedCategoryId"
        :products="products"
        :categories="categories"
        :combos="combos"
        :loading="loading"
        :error="error"
        @add-product="addProduct"
        @add-combo="addCombo"
      />

      <OrderSummarySection
        v-if="entries.length > 0"
        :entries="entries"
        :categories="categories"
        :total-items="totalItems"
        @add="readd"
        @remove="requestRemove"
      />
    </div>

    <ConfirmRemoveDialog
      v-if="pendingRemoveId"
      :product-name="pendingRemoveName"
      :table-name="table?.name ?? 'la mesa'"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
    />

    <SubmitOrderBar
      :disabled="entries.length === 0 || submitting"
      :submitting="submitting"
      @submit="handleSubmit"
    />
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

.scroll-area {
  flex: 1;
  overflow-y: auto;
  background: white;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
