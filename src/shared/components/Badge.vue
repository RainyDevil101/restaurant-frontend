<script lang="ts">
export type BadgeTone = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal'
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: BadgeTone
  }>(),
  { tone: 'gray' },
)
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.badge--gray {
  background: #f3f4f6;
  color: #374151;
}

.badge--blue {
  background: #dbeafe;
  color: #1e40af;
}

.badge--green {
  background: #dcfce7;
  color: #166534;
}

.badge--amber {
  background: #fef3cd;
  color: #92690a;
}

.badge--red {
  background: #fee2e2;
  color: #991b1b;
}

.badge--purple {
  background: #ede9fe;
  color: #6d28d9;
}

.badge--teal {
  background: color-mix(in srgb, var(--color-primary) 12%, white);
  color: var(--color-primary);
}
</style>
