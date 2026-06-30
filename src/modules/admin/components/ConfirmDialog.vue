<script setup lang="ts">
import ConfirmModal from '@/shared/components/ConfirmDialog.vue';
import { UI_LABELS } from '@/shared/constants/ui';

defineProps<{ title: string; message: string; saving?: boolean; error?: string }>();
const emit = defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <ConfirmModal
    :title="title"
    :message="message"
    :saving="saving"
    :error="error"
    :confirm-label="UI_LABELS.remove"
    :saving-label="UI_LABELS.removing"
    @confirm="emit('confirm')"
    @cancel="emit('close')"
  />
</template>
