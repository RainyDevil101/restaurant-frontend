<script setup lang="ts">
const props = defineProps<{
  label: string
  for: string
}>()
</script>

<template>
  <div class="field">
    <label class="field-label" :for="props.for">{{ props.label }}</label>
    <slot />
  </div>
</template>

<script lang="ts">
// .field-input styles are intentionally NOT scoped here.
// The <input> / <select> rendered inside the slot lives in the
// parent view's scope, so scoped styles from this component
// would not reach it. Making this block un-scoped turns .field-input
// into a global utility class that every admin view can rely on.
</script>

<style>
/* Global — see note in <script lang="ts"> above */
.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #111827;
  font-family: inherit;
  outline: none;
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
</style>
