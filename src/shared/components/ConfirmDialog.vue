<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useId } from 'vue';
import { UI_LABELS } from '@/shared/constants/ui';

withDefaults(
  defineProps<{
    title: string;
    message?: string;
    confirmLabel?: string;
    savingLabel?: string;
    saving?: boolean;
    error?: string;
  }>(),
  { confirmLabel: UI_LABELS.remove, savingLabel: UI_LABELS.removing },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const titleId = useId();
const dialogEl = ref<HTMLElement | null>(null);

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(): HTMLElement[] {
  return Array.from(dialogEl.value?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('cancel');
    return;
  }
  if (e.key !== 'Tab') return;
  const focusable = getFocusable();
  if (!focusable.length) return;
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  getFocusable()[0]?.focus();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('cancel')">
      <div
        ref="dialogEl"
        class="dialog"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="icon-circle" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="26"
            height="26"
          >
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            />
          </svg>
        </div>

        <h2 :id="titleId" class="title">{{ title }}</h2>

        <p class="body">
          <slot>{{ message }}</slot>
        </p>

        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <div class="actions">
          <button type="button" class="btn-cancel" @click="emit('cancel')">
            {{ UI_LABELS.cancel }}
          </button>
          <button
            type="button"
            class="btn-confirm"
            :disabled="saving || Boolean(error)"
            @click="emit('confirm')"
          >
            {{ saving ? savingLabel : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.dialog {
  background: white;
  border-radius: 16px;
  padding: 2rem 1.5rem 1.5rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #111827;
}

.body {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.5;
}

.body :deep(strong) {
  color: #111827;
  font-weight: 700;
}

.error {
  font-size: 0.85rem;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 0.5rem;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 13px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  transition: background 0.15s;
}

.btn-cancel {
  background: white;
  border: 1.5px solid #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-confirm {
  background: #dc2626;
  border: 1.5px solid #dc2626;
  color: white;
}

.btn-confirm:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-confirm:disabled {
  background: #f0a3a3;
  border-color: #f0a3a3;
  cursor: not-allowed;
}
</style>
