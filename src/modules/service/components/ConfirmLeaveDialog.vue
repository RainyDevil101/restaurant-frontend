<script setup lang="ts">
import ConfirmModal from '@/shared/components/ConfirmDialog.vue';
import { SERVICE_LABELS } from '../domain';

defineProps<{ tableName: string }>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <ConfirmModal
    :title="SERVICE_LABELS.leaveDialog.title"
    :confirm-label="SERVICE_LABELS.leaveDialog.confirm"
    :saving-label="SERVICE_LABELS.leaveDialog.saving"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    {{ SERVICE_LABELS.leaveDialog.body(tableName) }}
  </ConfirmModal>
</template>
