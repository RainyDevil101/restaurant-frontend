<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePayments } from '../composables/usePayments';
import { formatCurrency } from '../helpers/formatCurrency';
import Badge from '@/shared/components/Badge.vue';
import DataTable, { type Column } from '@/shared/components/DataTable.vue';
import PaymentDetailDialog from '../components/PaymentDetailDialog.vue';
import { PAYMENT_METHOD } from '@/shared/types';
import { PAYMENT_METHOD_LABEL } from '@/shared/constants/labels';
import { LOCALE } from '@/shared/constants/locale';
import { EMPTY_VALUE } from '@/shared/constants/display';
import { colors } from '@/shared/styles/colors';
import { ADMIN_LABELS } from '../constants';
import type { PaymentRow } from '../domain';

const { payments, loading, error, reload } = usePayments();

const selectedPayment = ref<PaymentRow | null>(null);

const columns = computed<Column<PaymentRow>[]>(() => [
  { key: 'tableName', label: ADMIN_LABELS.fields.table, sortable: true },
  {
    key: 'method',
    label: ADMIN_LABELS.fields.method,
    sortable: true,
    filter: {
      type: 'select',
      options: [
        { value: PAYMENT_METHOD.CASH, label: PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CASH].label },
        { value: PAYMENT_METHOD.CARD, label: PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CARD].label },
      ],
    },
  },
  {
    key: 'amount',
    label: ADMIN_LABELS.fields.totalCharged,
    align: 'right',
    sortable: true,
    accessor: (row) => row.amount,
  },
  {
    key: 'change',
    label: ADMIN_LABELS.fields.change,
    align: 'right',
    sortable: true,
    accessor: (row) => (row.method === PAYMENT_METHOD.CASH ? row.change : -1),
  },
  {
    key: 'paidAt',
    label: ADMIN_LABELS.fields.dateTime,
    sortable: true,
    accessor: (row) => row.paidAt,
  },
  { key: 'actions', label: '', align: 'right' },
]);
</script>

<template>
  <div class="payments-view">
    <div class="page-header">
      <h1 class="page-title">{{ ADMIN_LABELS.payments.title }}</h1>
      <button class="reload-btn" :disabled="loading" @click="reload">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 0 0-8 8 8 8 0 0 0 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18a6 6 0 0 1-6-6 6 6 0 0 1 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
          />
        </svg>
        {{ ADMIN_LABELS.payments.refresh }}
      </button>
    </div>

    <DataTable
      :items="payments"
      :columns="columns"
      :loading="loading"
      :error="error"
      default-sort="paidAt"
      default-sort-dir="desc"
      :search-placeholder="ADMIN_LABELS.payments.searchPlaceholder"
      :empty-text="ADMIN_LABELS.payments.emptyText"
    >
      <template #cell-method="{ row }">
        <Badge :tone="PAYMENT_METHOD_LABEL[row.method].tone">
          {{ PAYMENT_METHOD_LABEL[row.method].label }}
        </Badge>
      </template>

      <template #cell-amount="{ row }">
        {{ formatCurrency(row.amount) }}
      </template>

      <template #cell-change="{ row }">
        <span :class="row.method === PAYMENT_METHOD.CASH ? 'change-value' : 'change-na'">
          {{ row.method === PAYMENT_METHOD.CASH ? formatCurrency(row.change) : EMPTY_VALUE }}
        </span>
      </template>

      <template #cell-paidAt="{ row }">
        {{
          new Date(row.paidAt).toLocaleString(LOCALE, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        }}
      </template>

      <template #cell-actions="{ row }">
        <button class="detail-btn" type="button" @click="selectedPayment = row">
          {{ ADMIN_LABELS.payments.viewBreakdown }}
        </button>
      </template>
    </DataTable>

    <PaymentDetailDialog
      v-if="selectedPayment"
      :payment="selectedPayment"
      @close="selectedPayment = null"
    />
  </div>
</template>

<style scoped>
.payments-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: v-bind('colors.neutral.textStrong');
}

.reload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: v-bind('colors.neutral.background');
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('colors.neutral.textMedium');
  transition: background 0.12s;
}

.reload-btn:hover:not(:disabled) {
  background: v-bind('colors.neutral.surface');
}

.reload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.change-value {
  font-variant-numeric: tabular-nums;
}

.change-na {
  color: v-bind('colors.neutral.mutedText');
}

.detail-btn {
  background: none;
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 8px;
  padding: 5px 12px;
  min-height: 2.75rem;
  font-size: var(--font-xs);
  font-weight: 600;
  color: v-bind('colors.neutral.textMedium');
  transition:
    background 0.12s,
    border-color 0.12s;
  white-space: nowrap;
}

.detail-btn:hover {
  background: v-bind('colors.neutral.surface');
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
