<script setup lang="ts">
import { ITEM_KIND, type Menu, type Product } from '@/shared/types';
import Badge from '@/shared/components/Badge.vue';
import { ITEM_KIND_LABEL } from '@/shared/constants/labels';
import { colors } from '@/shared/styles/colors';
import { formatCurrency } from '../helpers/formatCurrency';
import { SERVICE_LABELS } from '../domain';
import { PlusIcon, MinusIcon } from '@/modules/shared/components/icons';

const props = withDefaults(defineProps<{ menu: Menu; products: Product[]; quantity?: number }>(), {
  quantity: 0,
});
const emit = defineEmits<{ add: []; remove: [] }>();

const memberNames = props.menu.items
  .map((item) => {
    const product = props.products.find((p) => p.id === item.productId);
    return product ? `${item.quantity}× ${product.name}` : null;
  })
  .filter((label): label is string => Boolean(label))
  .join(', ');
</script>

<template>
  <button
    v-if="quantity === 0"
    type="button"
    class="combo-row add-mode"
    :aria-label="SERVICE_LABELS.entryActions.addAria(menu.name)"
    @click="emit('add')"
  >
    <span class="combo-info">
      <span class="combo-head">
        <span class="combo-name">{{ menu.name }}</span>
        <Badge :tone="ITEM_KIND_LABEL[ITEM_KIND.COMBO].tone" class="combo-badge">
          {{ ITEM_KIND_LABEL[ITEM_KIND.COMBO].label }}
        </Badge>
      </span>
      <span v-if="memberNames" class="combo-members">{{ memberNames }}</span>
      <span class="combo-price">{{ formatCurrency(menu.price) }}</span>
    </span>
    <span class="add-hint" aria-hidden="true">
      <PlusIcon :size="20" />
    </span>
  </button>

  <div v-else class="combo-row active">
    <button
      type="button"
      class="info-add"
      :aria-label="SERVICE_LABELS.entryActions.addAnotherAria(menu.name)"
      @click="emit('add')"
    >
      <span class="combo-head">
        <span class="combo-name">{{ menu.name }}</span>
        <Badge :tone="ITEM_KIND_LABEL[ITEM_KIND.COMBO].tone" class="combo-badge">
          {{ ITEM_KIND_LABEL[ITEM_KIND.COMBO].label }}
        </Badge>
      </span>
      <span v-if="memberNames" class="combo-members">{{ memberNames }}</span>
      <span class="combo-price">{{ formatCurrency(menu.price) }}</span>
    </button>
    <div class="qty-control">
      <button
        class="qty-btn"
        :aria-label="SERVICE_LABELS.entryActions.removeOneOfAria(menu.name)"
        @click="emit('remove')"
      >
        <MinusIcon :size="18" />
      </button>
      <span class="qty-value" aria-live="polite">{{ quantity }}</span>
      <button
        class="qty-btn add"
        :aria-label="SERVICE_LABELS.entryActions.addAnotherAria(menu.name)"
        @click="emit('add')"
      >
        <PlusIcon :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.combo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  text-align: left;
}

.combo-row.add-mode {
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  color: inherit;
  font: inherit;
  border-radius: 8px;
  cursor: pointer;
}

.combo-row.add-mode:active {
  background: #f7f7f8;
}

.combo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.combo-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.combo-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.combo-badge {
  flex-shrink: 0;
}

.combo-members {
  font-size: var(--font-xs);
  color: v-bind('colors.neutral.mutedText');
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.combo-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: left;
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
  gap: 4px;
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
