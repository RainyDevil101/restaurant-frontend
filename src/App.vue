<script setup lang="ts">
import 'vue-sonner/style.css';
import { Toaster } from 'vue-sonner';
import { colors } from '@/shared/styles/colors';
import HealthBanner from '@/shared/components/HealthBanner.vue';

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
  <HealthBanner />
  <RouterView />
  <Toaster position="top-right" rich-colors :expand="false" :duration="4000" :style="toastStyle" />
</template>

<style>
:root {
  --color-primary: #0d9488;
  --color-primary-dark: #0f766e;
  --color-primary-soft: #ccfbf1;
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
</style>
