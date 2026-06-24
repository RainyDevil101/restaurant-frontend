<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useId } from 'vue';
import { colors } from '@/shared/styles/colors';

defineProps<{ title: string; saving?: boolean; error?: string }>();
const emit = defineEmits<{ close: []; submit: [] }>();

const modalEl = ref<HTMLElement | null>(null);
const titleId = useId();

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(): HTMLElement[] {
  return Array.from(modalEl.value?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
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
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="emit('close')"
    >
      <div ref="modalEl" class="modal">
        <div class="modal-header">
          <h2 :id="titleId" class="modal-title">{{ title }}</h2>
          <button type="button" class="close-x" aria-label="Cerrar" @click="emit('close')">
            ×
          </button>
        </div>

        <form class="modal-form" novalidate @submit.prevent="emit('submit')">
          <div class="modal-body">
            <slot />
          </div>

          <p v-if="error" class="modal-error" role="alert">{{ error }}</p>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="emit('close')">Cancelar</button>
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 100;
}

.modal {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0.75rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
}

.close-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: v-bind('colors.neutral.mutedText');
}

.close-x:hover {
  color: #374151;
}

.modal-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.modal-body {
  padding: 0.5rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-error {
  margin: 0.5rem 1.5rem 0;
  font-size: 0.85rem;
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
}

.btn-cancel {
  padding: 10px 18px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  padding: 10px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
}

.btn-save:hover {
  background: var(--color-primary-dark);
}

.btn-save:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}
</style>
