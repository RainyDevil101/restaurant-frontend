<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBilling } from '../composables/useBilling';
import { formatCurrency } from '../helpers/formatCurrency';
import CancelOrderDialog from '../components/CancelOrderDialog.vue';
import Badge from '@/shared/components/Badge.vue';
import { cancelOrder } from '@/shared/api/orders';
import { ApiRequestError } from '@/shared/api/client';
import { Route, ORDER_STATUS, ITEM_KIND } from '@/shared/types';
import type { OrderStatus } from '@/shared/types';
import { CHECKOUT_MESSAGES } from '../domain';
import { LOCALE } from '@/shared/constants/locale';
import { colors } from '@/shared/styles/colors';

const orderStatusTone: Record<OrderStatus, 'gray' | 'blue' | 'green' | 'amber' | 'red'> = {
  pendiente: 'amber',
  en_proceso: 'blue',
  listo: 'green',
  entregado: 'gray',
  cancelado: 'red',
};

const orderStatusLabel: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const router = useRouter();
const {
  table,
  activeOrders,
  billLines,
  billTotal,
  ordersByStatus,
  hasPendingOrders,
  loading,
  error,
  reload,
} = useBilling();

const cancelTargetId = ref<string | null>(null);
const cancelSaving = ref(false);
const cancelError = ref('');

function canCancel(status: OrderStatus, paid: boolean): boolean {
  return !paid && status !== ORDER_STATUS.CANCELLED;
}

function openCancelDialog(orderId: string) {
  cancelTargetId.value = orderId;
  cancelError.value = '';
  cancelSaving.value = false;
}

function closeCancelDialog() {
  cancelTargetId.value = null;
  cancelError.value = '';
  cancelSaving.value = false;
}

async function confirmCancel(payload: {
  reason: string;
  adminEmail: string;
  adminCredential: string;
}) {
  if (!cancelTargetId.value) return;
  cancelSaving.value = true;
  cancelError.value = '';
  try {
    await cancelOrder(cancelTargetId.value, payload);
    await reload();
    closeCancelDialog();
  } catch (err) {
    cancelError.value =
      err instanceof ApiRequestError ? err.message : CHECKOUT_MESSAGES.CANCEL_ORDER_ERROR;
  } finally {
    cancelSaving.value = false;
  }
}

function goBack() {
  router.push(Route.CHECKOUT);
}

function goToPayment() {
  router.push(`/checkout/table/${table.value?.id}/payment`);
}
</script>

<template>
  <div class="billing-view">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <span>Caja</span>
      </button>
      <div class="header-title">
        <h1 class="page-title">{{ table?.name ?? 'Mesa' }}</h1>
        <span v-if="table" class="meta">{{ table.capacity }} pers.</span>
      </div>

      <div v-if="!loading && activeOrders.length > 0" class="status-chips">
        <Badge v-if="ordersByStatus.pending > 0" tone="amber">
          {{ ordersByStatus.pending }} pendiente{{ ordersByStatus.pending > 1 ? 's' : '' }}
        </Badge>
        <Badge v-if="ordersByStatus.inProgress > 0" tone="blue">
          {{ ordersByStatus.inProgress }} en proceso
        </Badge>
        <Badge v-if="ordersByStatus.ready > 0" tone="green">
          {{ ordersByStatus.ready }} listo{{ ordersByStatus.ready > 1 ? 's' : '' }}
        </Badge>
        <Badge v-if="ordersByStatus.delivered > 0" tone="gray">
          {{ ordersByStatus.delivered }} entregado{{ ordersByStatus.delivered > 1 ? 's' : '' }}
        </Badge>
      </div>
    </div>

    <!-- Scrollable body -->
    <div class="scroll-body">
      <div v-if="loading" class="state-block">
        <p class="state-msg">Cargando…</p>
      </div>
      <div v-else-if="error" class="state-block">
        <p class="state-msg error">{{ error }}</p>
      </div>

      <div v-else class="content-grid">
        <!-- Left: orders -->
        <div class="card">
          <h2 class="card-title">Pedidos</h2>

          <div v-if="activeOrders.length === 0" class="empty-orders">
            <p>Sin pedidos registrados para esta mesa.</p>
          </div>

          <ul v-else class="order-list">
            <li v-for="order in activeOrders" :key="order.id" class="order-card">
              <div class="order-header">
                <span class="order-id">#{{ order.id.slice(-6).toUpperCase() }}</span>
                <Badge :tone="orderStatusTone[order.status]">
                  {{ orderStatusLabel[order.status] }}
                </Badge>
              </div>
              <ul class="order-items">
                <li v-for="item in order.items" :key="item.itemId" class="order-item">
                  <span class="item-qty">{{ item.quantity }}×</span>
                  <span class="item-name">{{ item.productName }}</span>
                  <span class="item-price">{{ formatCurrency(item.subtotal) }}</span>
                </li>
              </ul>
              <div class="order-footer">
                <span class="order-time">{{
                  new Date(order.createdAt).toLocaleTimeString(LOCALE, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}</span>
                <span class="order-subtotal">{{ formatCurrency(order.total) }}</span>
              </div>
              <div v-if="canCancel(order.status, order.paid)" class="order-actions">
                <button type="button" class="cancel-order-btn" @click="openCancelDialog(order.id)">
                  Cancelar pedido
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Right: bill summary -->
        <div class="card bill-card">
          <h2 class="card-title">Cuenta consolidada</h2>

          <div v-if="billLines.length === 0" class="empty-orders">
            <p>Sin ítems en cuenta.</p>
          </div>

          <template v-else>
            <div class="bill-lines">
              <div v-for="line in billLines" :key="line.productId" class="bill-line">
                <div class="line-left">
                  <span class="line-desc">{{ line.quantity }} × {{ line.productName }}</span>
                  <Badge v-if="line.kind === ITEM_KIND.COMBO" tone="teal">Combo</Badge>
                </div>
                <span class="line-price">{{ formatCurrency(line.subtotal) }}</span>
              </div>
            </div>

            <div class="bill-total-row">
              <span class="total-label">Total</span>
              <span class="total-amount">{{ formatCurrency(billTotal) }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Pay bar — always visible at the bottom -->
    <div v-if="!loading && !error" class="pay-bar">
      <p v-if="hasPendingOrders" class="pending-warning">
        Hay pedidos sin entregar. Confirma antes de cobrar.
      </p>
      <button class="pay-btn" :disabled="billLines.length === 0" @click="goToPayment">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path
            d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
          />
        </svg>
        Proceder al cobro · {{ formatCurrency(billTotal) }}
      </button>
    </div>

    <CancelOrderDialog
      v-if="cancelTargetId"
      :order-id="cancelTargetId"
      :saving="cancelSaving"
      :error="cancelError"
      @confirm="confirmCancel"
      @close="closeCancelDialog"
    />
  </div>
</template>

<style scoped>
.billing-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.page-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.75rem 2rem 1rem;
  background: #f0f2f5;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.12s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.header-title {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: #111827;
}

.meta {
  font-size: 0.875rem;
  color: v-bind('colors.neutral.mutedText');
}

.status-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: auto;
}

/* Scrollable body */
.scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 2rem 1.5rem;
}

/* States */
.state-block {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.state-msg {
  font-size: 0.9rem;
  color: v-bind('colors.neutral.mutedText');
}

.state-msg.error {
  color: #dc2626;
}

/* Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.card {
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bill-card {
  position: sticky;
  top: 0;
}

@media (max-width: 768px) {
  .bill-card {
    position: static;
  }
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Orders */
.empty-orders {
  padding: 1rem 0;
  font-size: 0.875rem;
  color: v-bind('colors.neutral.mutedText');
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
}

.order-card {
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.order-id {
  font-size: var(--font-xs);
  font-weight: 700;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}

.order-items {
  list-style: none;
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.item-qty {
  color: v-bind('colors.neutral.mutedText');
  font-weight: 600;
  min-width: 24px;
}

.item-name {
  flex: 1;
  color: #1a1a1a;
}

.item-price {
  color: #6b7280;
  font-size: var(--font-xs);
  white-space: nowrap;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.order-time {
  font-size: var(--font-xs);
  color: v-bind('colors.neutral.mutedText');
}

.order-subtotal {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 14px;
  border-top: 1px solid #f3f4f6;
}

.cancel-order-btn {
  background: none;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: var(--font-xs);
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  transition: background 0.12s;
}

.cancel-order-btn:hover {
  background: #fef2f2;
}

/* Bill summary */
.bill-lines {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #f3f4f6;
}

.bill-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
}

.line-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.line-desc {
  font-size: 0.9rem;
  color: #1a1a1a;
}

.line-price {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.bill-total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 0.25rem;
  border-top: 2px solid #e5e7eb;
}

.total-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

/* Pay bar */
.pay-bar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 1rem 2rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #e5e7eb;
}

.pending-warning {
  font-size: var(--font-xs);
  color: #92690a;
  background: #fef9ec;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 8px 12px;
  line-height: 1.4;
}

.pay-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.975rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}

.pay-btn:hover {
  background: var(--color-primary-dark);
}

.pay-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem 1.25rem 0.75rem;
  }

  .scroll-body {
    padding: 0.75rem 1.25rem 1.5rem;
  }

  .pay-bar {
    padding: 0.875rem 1.25rem;
    padding-bottom: max(0.875rem, env(safe-area-inset-bottom));
  }
}
</style>
