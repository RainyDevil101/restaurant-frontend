<script setup lang="ts">
import type { Category } from '@/shared/types'

withDefaults(
  defineProps<{
    modelValue: string | null
    categories: Category[]
    dark?: boolean
    wrap?: boolean
  }>(),
  { dark: false, wrap: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()
</script>

<template>
  <div class="category-tabs" :class="{ dark, wrap }" role="tablist">
    <button
      role="tab"
      class="tab"
      :class="{ active: modelValue === null }"
      :aria-selected="modelValue === null"
      @click="emit('update:modelValue', null)"
    >
      Todos
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      role="tab"
      class="tab"
      :class="{ active: modelValue === cat.id }"
      :aria-selected="modelValue === cat.id"
      @click="emit('update:modelValue', cat.id)"
    >
      {{ cat.name }}
    </button>
  </div>
</template>

<style scoped>
.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.category-tabs.wrap {
  flex-wrap: wrap;
  overflow-x: visible;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

/* Light (default) */
.tab {
  flex-shrink: 0;
  padding: 6px 18px;
  border-radius: 20px;
  border: 1.5px solid #e0e0e0;
  background: white;
  color: #555;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}

.tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Dark */
.dark .tab {
  background: #3f3f46;
  border-color: #3f3f46;
  color: #a1a1aa;
}

.dark .tab.active {
  background: #fafafa;
  border-color: #fafafa;
  color: #18181b;
}
</style>
