<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ orderId: string; saving?: boolean; error?: string }>()
const emit = defineEmits<{
  confirm: [payload: { reason: string; adminEmail: string; adminCredential: string }]
  close: []
}>()

const reason = ref('')
const adminEmail = ref('')
const adminCredential = ref('')

const orderLabel = computed(() => props.orderId.slice(-6).toUpperCase())

const canSubmit = computed(
  () =>
    reason.value.trim().length > 0 &&
    adminEmail.value.trim().length > 0 &&
    adminCredential.value.length > 0,
)

function onSubmit() {
  if (!canSubmit.value || props.saving) return
  emit('confirm', {
    reason: reason.value.trim(),
    adminEmail: adminEmail.value.trim(),
    adminCredential: adminCredential.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="overlay" role="dialog" aria-modal="true" @click.self="emit('close')">
      <div class="dialog">
        <div class="dialog-header">
          <h2 class="title">Cancelar pedido #{{ orderLabel }}</h2>
          <button type="button" class="close-x" aria-label="Cerrar" @click="emit('close')">×</button>
        </div>

        <p class="note">
          Un administrador debe autorizar esta cancelación con sus credenciales. El pedido cancelado
          se excluye de la cuenta.
        </p>

        <form class="form" novalidate @submit.prevent="onSubmit">
          <label class="field">
            <span class="field-label">Motivo</span>
            <textarea
              v-model="reason"
              class="input textarea"
              rows="3"
              placeholder="Describe el motivo de la cancelación"
            ></textarea>
          </label>

          <label class="field">
            <span class="field-label">Email del admin</span>
            <input v-model="adminEmail" type="email" class="input" autocomplete="off" />
          </label>

          <label class="field">
            <span class="field-label">PIN o contraseña del admin</span>
            <input
              v-model="adminCredential"
              type="password"
              class="input"
              autocomplete="off"
            />
          </label>

          <p v-if="error" class="error" role="alert">{{ error }}</p>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="emit('close')">Cancelar</button>
            <button type="submit" class="btn-confirm" :disabled="saving || !canSubmit">
              {{ saving ? 'Cancelando…' : 'Cancelar pedido' }}
            </button>
          </div>
        </form>
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
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 1.2rem;
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

.note {
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #111827;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.textarea {
  resize: vertical;
  min-height: 72px;
  font-family: inherit;
}

.error {
  font-size: 0.85rem;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 0.25rem;
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
