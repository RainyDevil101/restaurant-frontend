<script setup lang="ts">
import ConfirmModal from '@/shared/components/ConfirmDialog.vue';

defineProps<{ title: string; message: string; saving?: boolean; error?: string }>();
const emit = defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <ConfirmModal
    :title="title"
    :message="message"
    :saving="saving"
    :error="error"
    confirm-label="Eliminar"
    saving-label="Eliminando…"
    @confirm="emit('confirm')"
    @cancel="emit('close')"
  />
</template>
