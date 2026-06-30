<script setup lang="ts">
import 'vue-sonner/style.css';
import { Toaster } from 'vue-sonner';
import { colors } from '@/shared/styles/colors';
import HealthBanner from '@/shared/components/HealthBanner.vue';
import { SKIP_LINK } from '@/shared/constants/ui';

const toastStyle = {
  '--border-radius': '12px',
  '--success-bg': colors.brand.soft,
  '--success-border': colors.brand.primary,
  '--success-text': colors.brand.primaryDark,
  '--error-bg': colors.feedback.errorBg,
  '--error-border': colors.feedback.errorBorder,
  '--error-text': colors.feedback.errorDark,
  '--info-bg': colors.feedback.infoBg,
  '--info-border': colors.feedback.infoBorder,
  '--info-text': colors.feedback.infoDark,
  '--warning-bg': colors.feedback.warningBg,
  '--warning-border': colors.feedback.warningBorder,
  '--warning-text': colors.feedback.warningText,
} as const;
</script>

<template>
  <a :href="SKIP_LINK.target" class="skip-link">{{ SKIP_LINK.label }}</a>
  <HealthBanner />
  <RouterView />
  <Toaster position="top-right" rich-colors :expand="false" :duration="4000" :style="toastStyle" />
</template>

<style>
:root {
  --color-primary: #0d9488;
  --color-primary-dark: #0f766e;
  --color-primary-soft: #ccfbf1;

  --font-xs: 0.8125rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-md: 1.125rem;
  --font-lg: 1.25rem;
  --font-xl: 1.5rem;
  --font-2xl: 1.875rem;
}

html {
  font-size: 106.25%;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  background: #f0f2f5;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
}

button {
  cursor: pointer;
  font-family: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

.tap-target {
  min-width: 2.75rem;
  min-height: 2.75rem;
}

.skip-link {
  position: absolute;
  left: 0.5rem;
  top: -4rem;
  z-index: 1000;
  padding: 0.5rem 0.875rem;
  background: var(--color-primary);
  color: #ffffff;
  border-radius: 0 0 8px 8px;
  transition: top 0.15s ease;
}

.skip-link:focus {
  top: 0;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
