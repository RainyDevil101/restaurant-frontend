<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Route } from '@/shared/types';
import { usePayment } from '../composables/usePayment';
import { formatCurrency } from '../helpers/formatCurrency';
import Badge from '@/shared/components/Badge.vue';
import { PAYMENT_METHOD, ITEM_KIND } from '@/shared/types';
import { PAYMENT_METHOD_LABEL, ITEM_KIND_LABEL } from '@/shared/constants/labels';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { EMPTY_VALUE } from '@/shared/constants/display';
import { CHECKOUT_LABELS } from '../domain';
import { colors } from '@/shared/styles/colors';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
} from '@/modules/shared/components/icons';

const router = useRouter();
const {
  table,
  billLines,
  billTotal,
  method,
  cashReceived,
  change,
  canConfirm,
  loading,
  error,
  processing,
  confirmPayment,
} = usePayment();

function goBack() {
  router.push(Route.CHECKOUT);
}

async function handleConfirm() {
  const ok = await confirmPayment();
  if (ok) router.push(Route.CHECKOUT);
}
</script>

<template>
  <div class="payment-view">
    <!-- Page header -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeftIcon :size="20" />
        <span>{{ ROUTE_TITLES.CAJA }}</span>
      </button>
      <h1 class="page-title">
        {{ table?.name ?? CHECKOUT_LABELS.common.tableFallback }} ·
        {{ CHECKOUT_LABELS.common.registerPayment }}
      </h1>
    </div>

    <!-- Two-column content -->
    <div class="content-grid">
      <!-- Left: bill summary -->
      <div class="card bill-card">
        <h2 class="card-title">{{ CHECKOUT_LABELS.payment.orderSummary }}</h2>

        <div class="bill-lines">
          <div v-for="line in billLines" :key="line.productId" class="bill-line">
            <div class="line-left">
              <span class="line-desc">{{ line.quantity }} × {{ line.productName }}</span>
              <Badge
                v-if="line.kind === ITEM_KIND.COMBO"
                :tone="ITEM_KIND_LABEL[ITEM_KIND.COMBO].tone"
              >
                {{ ITEM_KIND_LABEL[ITEM_KIND.COMBO].label }}
              </Badge>
            </div>
            <span class="line-price">{{ formatCurrency(line.subtotal) }}</span>
          </div>
        </div>

        <div class="bill-total-row">
          <span class="total-label">{{ CHECKOUT_LABELS.payment.totalDue }}</span>
          <span class="total-amount">{{ formatCurrency(billTotal) }}</span>
        </div>
      </div>

      <!-- Right: payment form -->
      <div class="card payment-card">
        <h2 class="card-title">{{ CHECKOUT_LABELS.payment.methodTitle }}</h2>

        <div class="method-selector">
          <button
            class="method-btn"
            :class="{ active: method === PAYMENT_METHOD.CASH }"
            @click="method = PAYMENT_METHOD.CASH"
          >
            <CurrencyDollarIcon :size="28" />
            <span>{{ PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CASH].label }}</span>
          </button>
          <button
            class="method-btn"
            :class="{ active: method === PAYMENT_METHOD.CARD }"
            @click="method = PAYMENT_METHOD.CARD"
          >
            <CreditCardIcon :size="28" />
            <span>{{ PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CARD].label }}</span>
          </button>
        </div>

        <!-- Efectivo form -->
        <template v-if="method === PAYMENT_METHOD.CASH">
          <div class="form-group">
            <label class="form-label" for="cash-input">{{
              CHECKOUT_LABELS.payment.amountReceived
            }}</label>
            <div class="input-wrap">
              <span class="input-prefix">$</span>
              <input
                id="cash-input"
                v-model.number="cashReceived"
                class="cash-input"
                type="number"
                min="0"
                :placeholder="billTotal.toString()"
                @focus="($event.target as HTMLInputElement).select()"
              />
            </div>
          </div>

          <div
            class="change-row"
            :class="{
              positive: change !== null && change >= 0,
              negative: change !== null && change < 0,
            }"
          >
            <span>{{ CHECKOUT_LABELS.payment.change }}</span>
            <span class="change-amount">
              {{ change !== null ? formatCurrency(change) : EMPTY_VALUE }}
            </span>
          </div>
        </template>

        <!-- Tarjeta form -->
        <template v-else>
          <div class="card-instructions">
            <CreditCardIcon :size="36" />
            <p>{{ CHECKOUT_LABELS.payment.cardInstructions }}</p>
          </div>
        </template>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button
          class="confirm-btn"
          :disabled="!canConfirm || processing || loading"
          @click="handleConfirm"
        >
          {{
            processing
              ? CHECKOUT_LABELS.payment.processing
              : CHECKOUT_LABELS.payment.confirm(formatCurrency(billTotal))
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.75rem 2rem;
  gap: 1.5rem;
  overflow-y: auto;
}

/* Page header */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
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
}

.back-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: #111827;
}

/* Two-column grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
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

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

/* Method selector */
.method-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1.25rem 1rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  transition:
    border-color 0.15s,
    color 0.15s,
    background 0.15s;
}

.method-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #f0f9f7;
}

/* Cash form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.input-wrap:focus-within {
  border-color: var(--color-primary);
}

.input-prefix {
  padding: 0 12px;
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('colors.neutral.mutedText');
  border-right: 1.5px solid #e5e7eb;
  background: #f9fafb;
}

.cash-input {
  flex: 1;
  padding: 12px 14px;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  font-family: inherit;
  background: white;
}

.cash-input::-webkit-outer-spin-button,
.cash-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.change-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f9fafb;
  font-size: 0.9rem;
  font-weight: 600;
  color: v-bind('colors.neutral.mutedText');
}

.change-row.positive {
  background: #f0fdf4;
  color: #166534;
}

.change-row.negative {
  background: #fef2f2;
  color: #991b1b;
}

.change-amount {
  font-size: 1.1rem;
}

/* Card instructions */
.card-instructions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  text-align: center;
  color: v-bind('colors.neutral.mutedText');
}

.card-instructions p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
}

/* Confirm button */
.confirm-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.975rem;
  font-weight: 700;
  transition: background 0.15s;
  margin-top: auto;
}

.confirm-btn:hover {
  background: var(--color-primary-dark);
}

.confirm-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}

.error-msg {
  font-size: 0.875rem;
  color: #991b1b;
  text-align: center;
}
</style>
