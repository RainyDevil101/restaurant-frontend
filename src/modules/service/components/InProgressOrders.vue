<script setup lang="ts">
import Badge from '@/shared/components/Badge.vue';
import type { ApiOrder } from '@/shared/api/orders';
import { ORDER_STATUS } from '@/shared/types';
import { ORDER_STATUS_LABEL } from '@/shared/constants/labels';
import { colors } from '@/shared/styles/colors';
import { formatCurrency } from '../helpers/formatCurrency';
import { SERVICE_LABELS } from '../domain';

defineProps<{
  orders: ApiOrder[];
  error: string;
  deliveringId: string | null;
}>();

const emit = defineEmits<{
  deliver: [orderId: string];
}>();

function itemCount(order: ApiOrder): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}
</script>

<template>
  <section class="in-progress">
    <header class="header">
      <span>{{ SERVICE_LABELS.inProgress.title }}</span>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <ul class="order-list">
      <li v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-top">
          <Badge
            v-if="order.status === ORDER_STATUS.PENDING"
            :tone="ORDER_STATUS_LABEL[ORDER_STATUS.PENDING].tone"
          >
            {{ ORDER_STATUS_LABEL[ORDER_STATUS.PENDING].label }}
          </Badge>
          <Badge v-else tone="teal">
            {{ ORDER_STATUS_LABEL[ORDER_STATUS.DELIVERED].label
            }}{{ SERVICE_LABELS.inProgress.deliveredPendingSuffix }}
          </Badge>
          <span class="total">{{ formatCurrency(order.total) }}</span>
        </div>

        <ul class="lines">
          <li v-for="item in order.items" :key="item.itemId" class="line">
            <span class="qty">{{ item.quantity }}×</span>
            <span class="name">{{ item.productName }}</span>
          </li>
        </ul>

        <div class="order-bottom">
          <span class="count">{{ itemCount(order) }} {{ SERVICE_LABELS.items.plural }}</span>
          <button
            v-if="order.status === ORDER_STATUS.PENDING"
            type="button"
            class="deliver-btn"
            :disabled="deliveringId === order.id"
            @click="emit('deliver', order.id)"
          >
            {{
              deliveringId === order.id
                ? SERVICE_LABELS.inProgress.marking
                : SERVICE_LABELS.inProgress.markDelivered
            }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.in-progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('colors.neutral.mutedText');
}

.error {
  margin: 0;
  font-size: 0.875rem;
  color: #991b1b;
}

.order-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.order-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total {
  font-weight: 700;
  color: #1f2937;
}

.lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.line {
  display: flex;
  gap: 6px;
  font-size: 0.875rem;
  color: #4b5563;
}

.qty {
  font-weight: 600;
  color: #1f2937;
}

.order-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.count {
  font-size: var(--font-xs);
  color: v-bind('colors.neutral.mutedText');
}

.deliver-btn {
  border: none;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
}

.deliver-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
