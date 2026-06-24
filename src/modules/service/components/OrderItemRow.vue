<script setup lang="ts">
import type { Category } from '@/shared/types';
import Badge from '@/shared/components/Badge.vue';
import { colors } from '@/shared/styles/colors';
import type { OrderEntry } from '../composables/useOrder';
import { categoryColor, categoryName } from '../helpers/categoryColor';

defineProps<{ entry: OrderEntry; categories: Category[] }>();
const emit = defineEmits<{ add: []; remove: [] }>();
</script>

<template>
  <div class="order-item-row">
    <div class="item-name-wrap">
      <span class="item-name">{{
        entry.kind === 'combo' ? entry.menu.name : entry.product.name
      }}</span>
      <Badge v-if="entry.kind === 'combo'" tone="teal" class="combo-tag">Combo</Badge>
      <span v-else class="category-tag">
        <span
          class="category-dot"
          :style="{ background: categoryColor(entry.product.categoryId) }"
          aria-hidden="true"
        />
        {{ categoryName(entry.product.categoryId, categories) }}
      </span>
    </div>
    <div class="qty-control">
      <button class="qty-btn" aria-label="Quitar uno" @click="emit('remove')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path d="M19 13H5v-2h14v2z" />
        </svg>
      </button>
      <span class="qty-value">{{ entry.quantity }}</span>
      <button class="qty-btn" aria-label="Agregar uno" @click="emit('add')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.order-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.item-name-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.category-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--font-xs);
  color: v-bind('colors.neutral.mutedText');
}

.category-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.combo-tag {
  align-self: flex-start;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.qty-btn {
  width: 32px;
  height: 32px;
  min-width: 2.75rem;
  min-height: 2.75rem;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  background: white;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.qty-btn:active {
  background: #f3f4f6;
}

.qty-value {
  min-width: 18px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
}
</style>
