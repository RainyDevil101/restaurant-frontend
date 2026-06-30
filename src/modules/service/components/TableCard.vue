<script setup lang="ts">
import { colors } from '@/shared/styles/colors';
import { Route, type Table } from '@/shared/types';
import { SERVICE_LABELS, type TableActivity } from '../domain';

defineProps<{ table: Table; activity?: TableActivity }>();
</script>

<template>
  <RouterLink :to="`${Route.SERVICE}/table/${table.id}`" class="table-card" :class="table.status">
    <div class="table-top">
      <span class="table-name">{{ table.name }}</span>
      <span
        v-if="activity?.needsDelivery"
        class="deliver-flag"
        :aria-label="SERVICE_LABELS.tableCard.pendingDeliveryAria"
      >
        <span class="deliver-dot" aria-hidden="true" />
        {{ SERVICE_LABELS.tableCard.pendingDelivery }}
      </span>
    </div>

    <div class="table-meta">
      <div class="table-capacity">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path
            d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 13.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z"
          />
        </svg>
        <span>{{ table.capacity }} {{ SERVICE_LABELS.tableCard.peopleSuffix }}</span>
      </div>

      <span v-if="activity && activity.open > 0" class="order-count">
        {{ activity.open }}
        {{
          activity.open === 1
            ? SERVICE_LABELS.tableCard.orderSingular
            : SERVICE_LABELS.tableCard.orderPlural
        }}
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.table-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  min-height: 80px;
  transition: filter 0.15s ease;
}

.table-card:active {
  filter: brightness(0.93);
}

.table-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.table-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: v-bind('colors.neutral.textStrong');
}

.deliver-flag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: var(--font-xs);
  font-weight: 700;
  color: v-bind('colors.feedback.warningText');
}

.deliver-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: v-bind('colors.table.pendingPayment.text');
}

.table-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.table-capacity {
  display: flex;
  align-items: center;
  gap: 5px;
  color: v-bind('colors.neutral.secondary');
  font-size: 0.875rem;
}

.order-count {
  font-size: var(--font-xs);
  font-weight: 700;
  color: v-bind('colors.neutral.textMedium');
}

.libre {
  background: v-bind('colors.table.free.bg');
}
.ocupada {
  background: v-bind('colors.table.occupied.bg');
}
.por_cobrar {
  background: v-bind('colors.table.pendingPayment.bg');
}
</style>
