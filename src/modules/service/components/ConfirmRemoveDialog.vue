<script setup lang="ts">
defineProps<{
  productName: string
  tableName: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('cancel')">
      <div class="dialog" role="alertdialog" aria-modal="true">
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

        <h2 class="title">¿Quitar producto?</h2>

        <p class="body">
          Se quitará <strong>{{ productName }}</strong> del pedido de la {{ tableName }}.
        </p>

        <div class="actions">
          <button class="btn-cancel" @click="emit('cancel')">Cancelar</button>
          <button class="btn-confirm" @click="emit('confirm')">Quitar</button>
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
  background: rgba(0, 0, 0, 0.55);
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
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
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
  font-weight: 700;
  color: #1a1a1a;
}

.body {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

.body strong {
  color: #1a1a1a;
  font-weight: 700;
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
  font-weight: 600;
  transition: background 0.15s;
}

.btn-cancel {
  background: white;
  border: 1.5px solid #e0e0e0;
  color: #1a1a1a;
}

.btn-cancel:active {
  background: #f3f4f6;
}

.btn-confirm {
  background: white;
  border: 1.5px solid #dc2626;
  color: #dc2626;
}

.btn-confirm:active {
  background: #fef2f2;
}
</style>
