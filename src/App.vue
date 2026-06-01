<script setup lang="ts">
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  --color-primary: #0d9488;
  --color-primary-dark: #0f766e;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
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
