<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import Badge from '@/shared/components/Badge.vue';
import { PAYMENT_METHOD } from '@/shared/types';
import { colors } from '@/shared/styles/colors';
import { formatCurrency } from '../helpers/formatCurrency';
import type { PaymentRow } from '../composables/usePayments';

defineProps<{ payment: PaymentRow }>();
const emit = defineEmits<{ close: [] }>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" role="dialog" aria-modal="true" @click.self="emit('close')">
      <div class="modal">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">{{ payment.tableName }}</h2>
            <p class="modal-subtitle">
              {{
                new Date(payment.paidAt).toLocaleString('es-MX', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </p>
          </div>
          <button type="button" class="close-x" aria-label="Cerrar" @click="emit('close')">
            ×
          </button>
        </div>

        <!-- Items -->
        <div class="modal-body">
          <div class="items-list">
            <div v-for="item in payment.items" :key="item.productId" class="item-row">
              <div class="item-left">
                <span class="item-qty">{{ item.quantity }}×</span>
                <span class="item-name">{{ item.productName }}</span>
                <Badge v-if="item.kind === 'combo'" tone="teal">Combo</Badge>
              </div>
              <span class="item-subtotal">{{ formatCurrency(item.subtotal) }}</span>
            </div>
          </div>

          <!-- Summary -->
          <div class="summary">
            <div class="summary-row total-row">
              <span>Total cobrado</span>
              <span class="total-amount">{{ formatCurrency(payment.amount) }}</span>
            </div>
            <div v-if="payment.method === PAYMENT_METHOD.CASH" class="summary-row">
              <span class="label-muted">Cambio</span>
              <span class="label-muted">{{ formatCurrency(payment.change) }}</span>
            </div>
            <div class="summary-row">
              <span class="label-muted">Método</span>
              <Badge :tone="payment.method === PAYMENT_METHOD.CASH ? 'green' : 'blue'">
                {{ payment.method === PAYMENT_METHOD.CASH ? 'Efectivo' : 'Tarjeta' }}
              </Badge>
            </div>
            <div v-if="payment.waiterNames.length" class="summary-row">
              <span class="label-muted">Atendido por</span>
              <span class="waiter-names">{{ payment.waiterNames.join(', ') }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn-close" @click="emit('close')">Cerrar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: v-bind('colors.neutral.overlay');
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 100;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: v-bind('colors.neutral.background');
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0.75rem;
  border-bottom: 1px solid v-bind('colors.neutral.borderSubtle');
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: v-bind('colors.neutral.textStrong');
}

.modal-subtitle {
  font-size: 0.8rem;
  color: v-bind('colors.neutral.muted');
  margin-top: 2px;
}

.close-x {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: v-bind('colors.neutral.muted');
  padding: 0 4px;
  flex-shrink: 0;
}

.close-x:hover {
  color: v-bind('colors.neutral.textMedium');
}

.modal-body {
  padding: 1rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Items */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid v-bind('colors.neutral.borderSubtle');
  border-radius: 10px;
  overflow: hidden;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  gap: 12px;
  border-bottom: 1px solid v-bind('colors.neutral.borderSubtle');
}

.item-row:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.item-qty {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('colors.neutral.muted');
  min-width: 24px;
  flex-shrink: 0;
}

.item-name {
  font-size: 0.875rem;
  color: v-bind('colors.neutral.text');
}

.item-subtotal {
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('colors.neutral.textMedium');
  white-space: nowrap;
  flex-shrink: 0;
}

/* Summary */
.summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 2px solid v-bind('colors.neutral.border');
  padding-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.total-row {
  font-weight: 700;
  color: v-bind('colors.neutral.textStrong');
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 800;
}

.label-muted {
  color: v-bind('colors.neutral.secondary');
  font-size: 0.875rem;
}

.waiter-names {
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('colors.neutral.textMedium');
  text-align: right;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid v-bind('colors.neutral.borderSubtle');
}

.btn-close {
  padding: 10px 20px;
  background: v-bind('colors.neutral.surface');
  color: v-bind('colors.neutral.textMedium');
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.12s;
}

.btn-close:hover {
  background: v-bind('colors.neutral.border');
}
</style>
