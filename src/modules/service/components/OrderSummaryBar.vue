<script setup lang="ts">
import { formatCurrency } from '../helpers/formatCurrency'

defineProps<{
  totalItems: number
  total: number
}>()

const emit = defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="order-bar">
    <div class="order-summary">
      <span class="item-count">
        {{ totalItems }} {{ totalItems === 1 ? 'artículo' : 'artículos' }}
      </span>
      <span class="order-total">{{ formatCurrency(total) }}</span>
    </div>
    <button class="submit-btn" :disabled="totalItems === 0" @click="emit('submit')">
      Enviar pedido
    </button>
  </div>
</template>

<style scoped>
.order-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: white;
  padding: 1rem 1.25rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-count {
  font-size: 0.8rem;
  color: #888;
}

.order-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.submit-btn {
  flex-shrink: 0;
  padding: 12px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s;
}

.submit-btn:active {
  background: var(--color-primary-dark);
}

.submit-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}
</style>
