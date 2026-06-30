<script setup lang="ts">
import type { Category } from '@/shared/types';
import { colors } from '@/shared/styles/colors';
import { ORDER_ENTRY_KIND, SERVICE_LABELS, type OrderEntry } from '../domain';
import OrderItemRow from './OrderItemRow.vue';
import { ClipboardDocumentListIcon } from '@/modules/shared/components/icons';

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
      <ClipboardDocumentListIcon :size="18" />
      <span>{{ SERVICE_LABELS.summary.title }}</span>
    </div>
    <span class="item-count">{{ totalItems }} {{ SERVICE_LABELS.items.plural }}</span>
  </div>

  <div class="order-items">
    <OrderItemRow
      v-for="entry in entries"
      :key="entry.kind === ORDER_ENTRY_KIND.COMBO ? entry.menu.id : entry.product.id"
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
