<script setup lang="ts">
import { ITEM_KIND, type Category } from '@/shared/types';
import Badge from '@/shared/components/Badge.vue';
import { ITEM_KIND_LABEL } from '@/shared/constants/labels';
import { colors } from '@/shared/styles/colors';
import { ORDER_ENTRY_KIND, SERVICE_LABELS, type OrderEntry } from '../domain';
import { categoryColor, categoryName } from '../helpers/categoryColor';
import { PlusIcon, MinusIcon } from '@/modules/shared/components/icons';

defineProps<{ entry: OrderEntry; categories: Category[] }>();
const emit = defineEmits<{ add: []; remove: [] }>();
</script>

<template>
  <div class="order-item-row">
    <div class="item-name-wrap">
      <span class="item-name">{{
        entry.kind === ORDER_ENTRY_KIND.COMBO ? entry.menu.name : entry.product.name
      }}</span>
      <Badge
        v-if="entry.kind === ORDER_ENTRY_KIND.COMBO"
        :tone="ITEM_KIND_LABEL[ITEM_KIND.COMBO].tone"
        class="combo-tag"
      >
        {{ ITEM_KIND_LABEL[ITEM_KIND.COMBO].label }}
      </Badge>
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
      <button
        class="qty-btn"
        :aria-label="SERVICE_LABELS.itemRow.removeOneAria"
        @click="emit('remove')"
      >
        <MinusIcon :size="16" />
      </button>
      <span class="qty-value">{{ entry.quantity }}</span>
      <button class="qty-btn" :aria-label="SERVICE_LABELS.itemRow.addOneAria" @click="emit('add')">
        <PlusIcon :size="16" />
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
