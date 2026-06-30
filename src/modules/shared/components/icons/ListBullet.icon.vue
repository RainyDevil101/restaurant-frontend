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
    <path d="M7 5h14v2H7zm0 6h14v2H7zm0 6h14v2H7zM3 5h2v2H3zm0 6h2v2H3zm0 6h2v2H3z" />
  </svg>
</template>

<style scoped></style>
