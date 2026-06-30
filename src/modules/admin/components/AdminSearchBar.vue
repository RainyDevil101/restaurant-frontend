<script setup lang="ts">
import { colors } from '@/shared/styles/colors';
import { MagnifyingGlassIcon } from '@/modules/shared/components/icons';

defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="search-wrap">
    <MagnifyingGlassIcon class="search-icon" :size="16" />
    <input
      :value="modelValue"
      class="search-input"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 9px 14px;
  max-width: 320px;
}

.search-icon {
  flex-shrink: 0;
  color: v-bind('colors.neutral.mutedText');
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #1a1a1a;
  font-family: inherit;
}

.search-input::placeholder {
  color: v-bind('colors.neutral.mutedText');
}
</style>
