<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Route } from '@/shared/types'
import { usePayment } from '../composables/usePayment'
import { formatCurrency } from '../helpers/formatCurrency'
import { areaLabel } from '../helpers/areaLabel'
import { PAYMENT_METHOD } from '@/shared/types'

const router = useRouter()
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
} = usePayment()

function goBack() {
  router.push(Route.CHECKOUT)
}

async function handleConfirm() {
  try {
    await confirmPayment()
    router.push(Route.CHECKOUT)
  } catch {
    // error surfaced via the composable's error ref
  }
}
</script>

<template>
  <div class="payment-view">
    <!-- Page header -->
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
      <h1 class="page-title">{{ table?.name ?? 'Mesa' }} · Registrar pago</h1>
    </div>

    <!-- Two-column content -->
    <div class="content-grid">
      <!-- Left: bill summary -->
      <div class="card bill-card">
        <h2 class="card-title">Resumen del pedido</h2>

        <div class="bill-lines">
          <div v-for="line in billLines" :key="line.productName" class="bill-line">
            <div class="line-left">
              <span class="line-desc">{{ line.quantity }} × {{ line.productName }}</span>
              <span
                class="area-tag"
                :style="{
                  background: areaLabel(line.categoryId).bg,
                  color: areaLabel(line.categoryId).color,
                }"
              >
                {{ areaLabel(line.categoryId).text }}
              </span>
            </div>
            <span class="line-price">{{ formatCurrency(line.subtotal) }}</span>
          </div>
        </div>

        <div class="bill-total-row">
          <span class="total-label">Total a cobrar</span>
          <span class="total-amount">{{ formatCurrency(billTotal) }}</span>
        </div>
      </div>

      <!-- Right: payment form -->
      <div class="card payment-card">
        <h2 class="card-title">Método de pago</h2>

        <div class="method-selector">
          <button
            class="method-btn"
            :class="{ active: method === PAYMENT_METHOD.CASH }"
            @click="method = PAYMENT_METHOD.CASH"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="28"
              height="28"
              aria-hidden="true"
            >
              <path
                d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
              />
            </svg>
            <span>Efectivo</span>
          </button>
          <button
            class="method-btn"
            :class="{ active: method === PAYMENT_METHOD.CARD }"
            @click="method = PAYMENT_METHOD.CARD"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="28"
              height="28"
              aria-hidden="true"
            >
              <path
                d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
              />
            </svg>
            <span>Tarjeta</span>
          </button>
        </div>

        <!-- Efectivo form -->
        <template v-if="method === PAYMENT_METHOD.CASH">
          <div class="form-group">
            <label class="form-label" for="cash-input">Monto recibido</label>
            <div class="input-wrap">
              <span class="input-prefix">$</span>
              <input
                id="cash-input"
                v-model.number="cashReceived"
                class="cash-input"
                type="number"
                min="0"
                :placeholder="billTotal.toString()"
              />
            </div>
          </div>

          <div class="change-row" :class="{ positive: change !== null && change >= 0, negative: change !== null && change < 0 }">
            <span>Cambio</span>
            <span class="change-amount">
              {{ change !== null ? formatCurrency(change) : '—' }}
            </span>
          </div>
        </template>

        <!-- Tarjeta form -->
        <template v-else>
          <div class="card-instructions">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="36"
              height="36"
              aria-hidden="true"
            >
              <path
                d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
              />
            </svg>
            <p>Pase la tarjeta en el terminal y confirme cuando el cobro sea exitoso.</p>
          </div>
        </template>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button
          class="confirm-btn"
          :disabled="!canConfirm || processing || loading"
          @click="handleConfirm"
        >
          {{ processing ? 'Procesando…' : `Confirmar pago · ${formatCurrency(billTotal)}` }}
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

.area-tag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
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
  transition: border-color 0.15s, color 0.15s, background 0.15s;
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
  color: #9ca3af;
  border-right: 1.5px solid #e5e7eb;
  background: #f9fafb;
}

.cash-input {
  flex: 1;
  padding: 12px 14px;
  border: none;
  outline: none;
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
  color: #9ca3af;
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
  color: #9ca3af;
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
