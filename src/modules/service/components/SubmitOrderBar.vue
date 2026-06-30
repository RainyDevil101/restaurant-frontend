<script setup lang="ts">
import { formatCurrency } from '../helpers/formatCurrency';
import { SERVICE_LABELS } from '../domain';

defineProps<{
  disabled: boolean;
  submitting: boolean;
  totalItems: number;
  total: number;
}>();
defineEmits<{ submit: [] }>();
</script>

<template>
  <div class="bottom-bar">
    <button class="submit-btn" :disabled="disabled" @click="$emit('submit')">
      <span class="submit-main">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <span>{{
          submitting ? SERVICE_LABELS.submitBar.sending : SERVICE_LABELS.submitBar.submit
        }}</span>
      </span>
      <span v-if="totalItems > 0 && !submitting" class="submit-summary">
        {{ totalItems }}
        {{ totalItems === 1 ? SERVICE_LABELS.items.singular : SERVICE_LABELS.items.plural }} ·
        {{ formatCurrency(total) }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0.875rem 1.25rem;
  padding-bottom: max(0.875rem, env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  width: 100%;
  padding: 14px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: background 0.15s;
}

.submit-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-summary {
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.submit-btn:active {
  background: var(--color-primary-dark);
}

.submit-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}
</style>
