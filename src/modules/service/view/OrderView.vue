<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, onBeforeRouteLeave, type NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Route } from '@/shared/types';
import { useCurrentTable } from '../composables/useCurrentTable';
import { useOrder } from '../composables/useOrder';
import { useTableOrders } from '../composables/useTableOrders';
import OrderNavBar from '../components/OrderNavBar.vue';
import OrderHeaderRow from '../components/OrderHeaderRow.vue';
import InProgressOrders from '../components/InProgressOrders.vue';
import CatalogPanel from '../components/CatalogPanel.vue';
import OrderSummarySection from '../components/OrderSummarySection.vue';
import SubmitOrderBar from '../components/SubmitOrderBar.vue';
import ConfirmRemoveDialog from '../components/ConfirmRemoveDialog.vue';
import ConfirmLeaveDialog from '../components/ConfirmLeaveDialog.vue';
import type { Product, Menu } from '@/shared/types';
import { ORDER_ENTRY_KIND, type OrderEntry } from '../domain';

const router = useRouter();
const auth = useAuthStore();
const { table, tableId } = useCurrentTable();
const {
  entries,
  products,
  categories,
  combos,
  loading,
  error,
  submitting,
  totalItems,
  total,
  getQuantity,
  addProduct,
  addCombo,
  remove,
  submit,
  reload: reloadCatalog,
} = useOrder();
const {
  openAccountOrders,
  error: ordersError,
  deliveringId,
  load: reloadOrders,
  markDelivered,
} = useTableOrders(() => tableId.value);

const searchQuery = ref('');
const selectedCategoryId = ref<string | null>(null);

const pendingRemoveId = ref<string | null>(null);
const pendingRemoveName = ref('');

const showLeaveDialog = ref(false);
let leaveNext: NavigationGuardNext | null = null;

function entryId(entry: OrderEntry): string {
  return entry.kind === ORDER_ENTRY_KIND.COMBO ? entry.menu.id : entry.product.id;
}

function entryName(entry: OrderEntry): string {
  return entry.kind === ORDER_ENTRY_KIND.COMBO ? entry.menu.name : entry.product.name;
}

function readd(entry: OrderEntry) {
  if (entry.kind === ORDER_ENTRY_KIND.COMBO) addCombo(entry.menu);
  else addProduct(entry.product);
}

function requestRemove(entry: OrderEntry) {
  const id = entryId(entry);
  if (entry.quantity === 1) {
    pendingRemoveId.value = id;
    pendingRemoveName.value = entryName(entry);
  } else {
    remove(id);
  }
}

function confirmRemove() {
  if (pendingRemoveId.value) remove(pendingRemoveId.value);
  pendingRemoveId.value = null;
}

function cancelRemove() {
  pendingRemoveId.value = null;
}

function removeProduct(product: Product) {
  remove(product.id);
}

function removeCombo(menu: Menu) {
  remove(menu.id);
}

function goBack() {
  router.push(Route.SERVICE);
}

function confirmLeave() {
  showLeaveDialog.value = false;
  leaveNext?.();
  leaveNext = null;
}

function cancelLeave() {
  showLeaveDialog.value = false;
  leaveNext?.(false);
  leaveNext = null;
}

onBeforeRouteLeave((_to, _from, next) => {
  if (entries.value.length === 0 || submitting.value) {
    next();
    return;
  }
  leaveNext = next;
  showLeaveDialog.value = true;
});

async function handleSubmit() {
  try {
    await submit(tableId.value);
    router.push(Route.SERVICE);
  } catch {
    return;
  }
}
</script>

<template>
  <div class="order-view">
    <OrderNavBar :user-name="auth.user?.name" @back="goBack" />

    <div class="scroll-area">
      <OrderHeaderRow :table-name="table?.name ?? 'Mesa'" />

      <div v-if="ordersError && openAccountOrders.length === 0" class="orders-error">
        <span>{{ ordersError }}</span>
        <button type="button" class="retry-inline" @click="reloadOrders">Reintentar</button>
      </div>

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
        :get-quantity="getQuantity"
        @add-product="addProduct"
        @remove-product="removeProduct"
        @add-combo="addCombo"
        @remove-combo="removeCombo"
        @retry="reloadCatalog"
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

    <ConfirmLeaveDialog
      v-if="showLeaveDialog"
      :table-name="table?.name ?? 'la mesa'"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />

    <SubmitOrderBar
      :disabled="entries.length === 0 || submitting"
      :submitting="submitting"
      :total-items="totalItems"
      :total="total"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.order-view {
  height: 100dvh;
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
  padding-bottom: calc(1.25rem + 72px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.orders-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0.75rem 1rem;
  border: 1px solid #fecaca;
  background: #fef2f2;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #991b1b;
}

.retry-inline {
  flex-shrink: 0;
  min-height: 2.25rem;
  padding: 0 0.875rem;
  border-radius: 8px;
  border: 1.5px solid #991b1b;
  background: white;
  color: #991b1b;
  font-size: 0.85rem;
  font-weight: 600;
}

.retry-inline:active {
  background: #fee2e2;
}
</style>
