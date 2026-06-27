<script setup lang="ts">
import ConfirmModal from '@/shared/components/ConfirmDialog.vue';

defineProps<{ tableName: string }>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <ConfirmModal
    title="¿Salir sin enviar?"
    confirm-label="Descartar y salir"
    savingLabel="Saliendo…"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    Tienes un pedido sin enviar para la {{ tableName }}. Si sales, se perderán los productos
    seleccionados.
  </ConfirmModal>
</template>
