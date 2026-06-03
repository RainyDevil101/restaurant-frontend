<script setup lang="ts">
defineProps<{ title: string; saving?: boolean; error?: string }>()
const emit = defineEmits<{ close: []; submit: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button type="button" class="close-x" aria-label="Cerrar" @click="emit('close')">×</button>
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
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #9ca3af;
  padding: 0 4px;
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
