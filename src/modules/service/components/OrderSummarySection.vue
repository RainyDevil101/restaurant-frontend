<script setup lang="ts">
import type { Category } from '@/shared/types';
import { colors } from '@/shared/styles/colors';
import type { OrderEntry } from '../composables/useOrder';
import OrderItemRow from './OrderItemRow.vue';

defineProps<{
  entries: OrderEntry[];
  categories: Category[];
  totalItems: number;
}>();

const emit = defineEmits<{
  add: [entry: OrderEntry];
  remove: [entry: OrderEntry];
}>();
</script>

<template>
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
      :key="entry.kind === 'combo' ? entry.menu.id : entry.product.id"
      :entry="entry"
      :categories="categories"
      @add="emit('add', entry)"
      @remove="emit('remove', entry)"
    />
  </div>
</template>

<style scoped>
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
  color: v-bind('colors.neutral.mutedText');
  font-size: 0.875rem;
}

.item-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('colors.neutral.mutedText');
}

.order-items {
  display: flex;
  flex-direction: column;
}
</style>
