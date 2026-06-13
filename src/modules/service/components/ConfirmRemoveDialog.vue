<script setup lang="ts">
import ConfirmModal from '@/shared/components/ConfirmDialog.vue';

defineProps<{ productName: string; tableName: string }>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <ConfirmModal
    title="¿Quitar producto?"
    confirm-label="Quitar"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    Se quitará <strong>{{ productName }}</strong> del pedido de la {{ tableName }}.
  </ConfirmModal>
</template>
