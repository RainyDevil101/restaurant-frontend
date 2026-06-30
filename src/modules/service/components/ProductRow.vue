<script setup lang="ts">
import type { Product } from '@/shared/types';
import Badge from '@/shared/components/Badge.vue';
import { colors } from '@/shared/styles/colors';
import { formatCurrency } from '../helpers/formatCurrency';
import { SERVICE_LABELS } from '../domain';
import { PlusIcon, MinusIcon } from '@/modules/shared/components/icons';

const props = withDefaults(defineProps<{ product: Product; quantity?: number }>(), {
  quantity: 0,
});
const emit = defineEmits<{ add: []; remove: [] }>();

function handleAdd() {
  if (!props.product.available) return;
  emit('add');
}
</script>

<template>
  <div v-if="!product.available" class="product-row disabled">
    <div class="product-info">
      <span class="product-name">{{ product.name }}</span>
      <span class="product-price">{{ formatCurrency(product.price) }}</span>
    </div>
    <Badge tone="gray" class="status-badge">{{ SERVICE_LABELS.productRow.disabled }}</Badge>
  </div>

  <button
    v-else-if="quantity === 0"
    type="button"
    class="product-row add-mode"
    :aria-label="SERVICE_LABELS.entryActions.addAria(product.name)"
    @click="handleAdd"
  >
    <span class="product-info">
      <span class="product-name">{{ product.name }}</span>
      <span class="product-price">{{ formatCurrency(product.price) }}</span>
    </span>
    <span class="add-hint" aria-hidden="true">
      <PlusIcon :size="20" />
    </span>
  </button>

  <div v-else class="product-row active">
    <button
      type="button"
      class="info-add"
      :aria-label="SERVICE_LABELS.entryActions.addAnotherAria(product.name)"
      @click="handleAdd"
    >
      <span class="product-name">{{ product.name }}</span>
      <span class="product-price">{{ formatCurrency(product.price) }}</span>
    </button>
    <div class="qty-control">
      <button
        class="qty-btn"
        :aria-label="SERVICE_LABELS.entryActions.removeOneOfAria(product.name)"
        @click="emit('remove')"
      >
        <MinusIcon :size="18" />
      </button>
      <span class="qty-value" aria-live="polite">{{ quantity }}</span>
      <button
        class="qty-btn add"
        :aria-label="SERVICE_LABELS.entryActions.addAnotherAria(product.name)"
        @click="handleAdd"
      >
        <PlusIcon :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  text-align: left;
}

.product-row.add-mode {
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  color: inherit;
  font: inherit;
  border-radius: 8px;
  cursor: pointer;
}

.product-row.add-mode:active {
  background: #f7f7f8;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.product-row.disabled .product-name {
  color: v-bind('colors.neutral.mutedText');
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: left;
}

.product-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: left;
}

.product-row.disabled .product-price {
  color: v-bind('colors.neutral.muted');
}

.status-badge {
  flex-shrink: 0;
}

.add-hint {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  background: white;
  color: #555;
}

.info-add {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  border-radius: 8px;
  cursor: pointer;
}

.info-add:active {
  background: #f7f7f8;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.qty-btn {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  background: white;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.qty-btn.add {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.qty-btn:active {
  background: #f3f4f6;
}

.qty-value {
  min-width: 1.25rem;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a1a;
}
</style>
