<script setup lang="ts">
import { colors } from '@/shared/styles/colors';
import { BRAND, BRAND_TAGLINE } from '@/shared/constants/brand';

withDefaults(
  defineProps<{
    // CSS font-size for the wordmark (e.g. '2rem', '1.25rem')
    size?: string;
    // 'brand' = teal on light surfaces · 'onColor' = white on the teal bar
    variant?: 'brand' | 'onColor';
    // Show the "Gestión de pedidos" tagline beneath the name
    tagline?: boolean;
  }>(),
  { size: '1.375rem', variant: 'brand', tagline: false },
);
</script>

<template>
  <div class="brand-logo" :class="`brand-logo--${variant}`">
    <span class="brand-logo__name">{{ BRAND }}</span>
    <span v-if="tagline" class="brand-logo__tagline">{{ BRAND_TAGLINE }}</span>
  </div>
</template>

<style scoped>
.brand-logo {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.brand-logo__name {
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: v-bind(size);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--color-primary);
}

.brand-logo--onColor .brand-logo__name {
  color: white;
}

.brand-logo__tagline {
  margin-top: 4px;
  font-size: 0.9rem;
  color: v-bind('colors.neutral.mutedText');
}
</style>
