<script setup lang="ts">
import type { Menu, Product } from '@/shared/types'
import Badge from '@/shared/components/Badge.vue'
import { formatCurrency } from '../helpers/formatCurrency'

const props = defineProps<{ menu: Menu; products: Product[] }>()
defineEmits<{ add: [] }>()

const memberNames = props.menu.items
  .map((item) => {
    const product = props.products.find((p) => p.id === item.productId)
    return product ? `${item.quantity}× ${product.name}` : null
  })
  .filter((label): label is string => Boolean(label))
  .join(', ')
</script>

<template>
  <div class="combo-row">
    <div class="combo-info">
      <div class="combo-head">
        <span class="combo-name">{{ menu.name }}</span>
        <Badge tone="teal" class="combo-badge">Combo</Badge>
      </div>
      <span v-if="memberNames" class="combo-members">{{ memberNames }}</span>
      <span class="combo-price">{{ formatCurrency(menu.price) }}</span>
    </div>
    <button class="add-btn" :aria-label="`Agregar ${menu.name}`" @click="$emit('add')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.combo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
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
  font-size: 0.78rem;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.combo-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary);
}

.add-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  background: white;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.add-btn:active {
  background: #f3f4f6;
}
</style>
