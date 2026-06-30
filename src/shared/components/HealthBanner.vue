<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { colors } from '@/shared/styles/colors';
import { API_BASE_URL, HEALTH_PATH } from '@/shared/api/config';
import { HEALTH_BANNER } from '@/shared/constants/ui';
import { WarningTriangleIcon } from '@/modules/shared/components/icons';

const POLL_MS = 30_000;

const degraded = ref(false);
let timerId: ReturnType<typeof setInterval> | null = null;

async function check() {
  try {
    const res = await fetch(`${API_BASE_URL}${HEALTH_PATH}`);
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
      <WarningTriangleIcon class="icon" :size="16" />
      <span class="title">{{ HEALTH_BANNER.title }}</span>
      <span class="hint">{{ HEALTH_BANNER.hint }}</span>
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
  background: v-bind('colors.feedback.warningBg');
  border-bottom: 1px solid v-bind('colors.feedback.warningBorder');
  color: v-bind('colors.feedback.warningText');
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
  color: v-bind('colors.feedback.warningText');
  opacity: 0.8;
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
