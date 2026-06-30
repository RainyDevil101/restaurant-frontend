<script setup lang="ts">
import { colors } from '@/shared/styles/colors';
import { Route, type Table } from '@/shared/types';
import { SERVICE_LABELS, type TableActivity } from '../domain';
import { UsersIcon } from '@/modules/shared/components/icons';

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
        <UsersIcon :size="18" />
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
