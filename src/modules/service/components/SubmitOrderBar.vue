<script setup lang="ts">
defineProps<{ disabled: boolean; submitting: boolean }>()
defineEmits<{ submit: [] }>()
</script>

<template>
  <div class="bottom-bar">
    <button class="submit-btn" :disabled="disabled" @click="$emit('submit')">
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
      {{ submitting ? 'Enviando…' : 'Enviar a caja' }}
    </button>
  </div>
</template>

<style scoped>
.bottom-bar {
  flex-shrink: 0;
  padding: 1rem 1.25rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
