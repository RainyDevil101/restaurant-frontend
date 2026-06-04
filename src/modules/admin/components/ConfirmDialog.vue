<script setup lang="ts">
defineProps<{ title: string; message: string; saving?: boolean; error?: string }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>

        <p v-if="error" class="modal-error" role="alert">{{ error }}</p>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="emit('close')">Cancelar</button>
          <button type="button" class="btn-danger" :disabled="saving || Boolean(error)" @click="emit('confirm')">
            {{ saving ? 'Eliminando…' : 'Eliminar' }}
          </button>
        </div>
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
  max-width: 380px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #111827;
}

.modal-message {
  margin-top: 0.75rem;
  font-size: 0.92rem;
  color: #4b5563;
  line-height: 1.5;
}

.modal-error {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
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

.btn-danger {
  padding: 10px 18px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-danger:disabled {
  background: #f0a3a3;
  cursor: not-allowed;
}
</style>
