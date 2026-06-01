<script setup lang="ts">
import type { Product } from '@/shared/types'

defineProps<{ product: Product }>()
const emit = defineEmits<{ add: [] }>()
</script>

<template>
  <div class="product-row">
    <span class="product-name">{{ product.name }}</span>
    <button class="add-btn" :aria-label="`Agregar ${product.name}`" @click="emit('add')">
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
.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
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
