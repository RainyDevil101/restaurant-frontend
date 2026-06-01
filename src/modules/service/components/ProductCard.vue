<script setup lang="ts">
import type { Product } from '@/shared/types'
import { formatCurrency } from '../helpers/formatCurrency'

defineProps<{
  product: Product
  quantity: number
}>()

const emit = defineEmits<{
  add: []
  remove: []
}>()
</script>

<template>
  <div class="product-card">
    <div class="product-info">
      <span class="product-name">{{ product.name }}</span>
      <span v-if="product.description" class="product-desc">{{ product.description }}</span>
      <span class="product-price">{{ formatCurrency(product.price) }}</span>
    </div>

    <div class="quantity-control">
      <template v-if="quantity > 0">
        <button class="qty-btn" aria-label="Quitar uno" @click="emit('remove')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
        <span class="qty-value">{{ quantity }}</span>
      </template>
      <button class="qty-btn qty-add" aria-label="Agregar uno" @click="emit('add')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: white;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.product-name {
  font-size: 0.975rem;
  font-weight: 700;
  color: #1a1a1a;
}

.product-desc {
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-top: 2px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf4f3;
  color: var(--color-primary);
  transition: background 0.15s;
}

.qty-btn:active {
  background: #d4ece9;
}

.qty-add {
  background: var(--color-primary);
  color: white;
}

.qty-add:active {
  background: var(--color-primary-dark);
}

.qty-value {
  min-width: 20px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
}
</style>
