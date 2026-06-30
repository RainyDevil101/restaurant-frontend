<script setup lang="ts">
import ConfirmModal from '@/shared/components/ConfirmDialog.vue';
import { SERVICE_LABELS } from '../domain';

defineProps<{ productName: string; tableName: string }>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <ConfirmModal
    :title="SERVICE_LABELS.removeDialog.title"
    :confirm-label="SERVICE_LABELS.removeDialog.confirm"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    {{ SERVICE_LABELS.removeDialog.bodyPrefix }}<strong>{{ productName }}</strong
    >{{ SERVICE_LABELS.removeDialog.bodySuffix(tableName) }}
  </ConfirmModal>
</template>
