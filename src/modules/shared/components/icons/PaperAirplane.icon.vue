<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 20 });
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    :width="size"
    :height="size"
    aria-hidden="true"
  >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
</template>

<style scoped></style>
