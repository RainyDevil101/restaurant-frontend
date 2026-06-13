<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const BASE_URL = import.meta.env.VITE_API_URL as string;
const POLL_MS = 30_000;

const degraded = ref(false);
let timerId: ReturnType<typeof setInterval> | null = null;

async function check() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    degraded.value = !res.ok;
  } catch {
    degraded.value = true;
  }
}

onMounted(() => {
  check();
  timerId = setInterval(check, POLL_MS);
});

onUnmounted(() => {
  if (timerId !== null) clearInterval(timerId);
});
</script>

<template>
  <Transition name="health-banner">
    <div v-if="degraded" role="status" aria-live="polite" class="health-banner">
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span class="title">Servidor no disponible</span>
      <span class="hint">— algunas operaciones pueden fallar</span>
    </div>
  </Transition>
</template>

<style scoped>
.health-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fffbeb;
  border-bottom: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.875rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.title {
  font-weight: 600;
}

.hint {
  color: #b45309;
}

.health-banner-enter-active,
.health-banner-leave-active {
  transition: all 0.3s ease;
}

.health-banner-enter-from,
.health-banner-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
