<script setup lang="ts">
import { useId } from 'vue';
import { colors } from '@/shared/styles/colors';

const props = defineProps<{
  label: string;
  for: string;
  error?: string;
}>();

const errorId = useId();
</script>

<template>
  <div class="field">
    <label class="field-label" :for="props.for">{{ props.label }}</label>
    <slot :error-id="props.error ? errorId : undefined" :invalid="Boolean(props.error)" />
    <p v-if="props.error" :id="errorId" class="field-error" role="alert">{{ props.error }}</p>
  </div>
</template>

<style>
.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #111827;
  font-family: inherit;
  transition: border-color 0.15s;
  background: white;
}

.field-input:focus {
  border-color: var(--color-primary);
}
</style>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-error {
  font-size: var(--font-xs);
  color: v-bind('colors.feedback.error');
}
</style>
