<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckoutDashboard } from '../composables/useCheckoutDashboard'
import { formatCurrency } from '../helpers/formatCurrency'
import Badge from '@/shared/components/Badge.vue'
import type { TableStatus } from '@/shared/types'
import { getComandasByTable } from '@/shared/api/orders'
import { getPrecheck } from '@/shared/api/billing'
import { listPrinters } from '@/shared/api/settings'
import { usePrinterConnection } from '@/shared/printing/usePrinterConnection'
import { printerErrorMessage } from '@/shared/printing'
import { toast } from '@/shared/toast'
import { ApiRequestError } from '@/shared/api/client'

const tableStatusTone: Record<TableStatus, 'gray' | 'blue' | 'amber' | 'green'> = {
  libre: 'green',
  ocupada: 'blue',
  por_cobrar: 'amber',
}

const tableStatusLabel: Record<TableStatus, string> = {
  libre: 'Libre',
  ocupada: 'Ocupada',
  por_cobrar: 'Por cobrar',
}

const router = useRouter()
const { activeTables, selectedTableId, selectedSummary, billLines, billTotal, loading, error } =
  useCheckoutDashboard()
const { isConnected, printBase64 } = usePrinterConnection()

const printing = ref(false)

function selectTable(id: string) {
  selectedTableId.value = id
}

function registerPayment() {
  if (selectedTableId.value) {
    router.push(`/checkout/table/${selectedTableId.value}`)
  }
}

async function defaultPaperWidth(): Promise<number | null> {
  const printers = await listPrinters().catch(() => [])
  const def = printers.find((p) => p.isDefault) ?? printers[0]
  return def?.paperWidth ?? null
}

async function onPrintComanda() {
  if (!selectedTableId.value) return
  if (!isConnected.value) {
    toast.error('Conecta la impresora primero en Configuraciones')
    return
  }
  printing.value = true
  try {
    const width = await defaultPaperWidth()
    if (width === null) {
      toast.error('Configura una impresora en Ajustes antes de imprimir')
      return
    }
    const comandas = await getComandasByTable(selectedTableId.value, width)
    for (const comanda of comandas) {
      await printBase64(comanda.escposBase64)
    }
    toast.success(`Comanda impresa · ${comandas.length} área${comandas.length !== 1 ? 's' : ''}`)
  } catch (err) {
    const msg = err instanceof ApiRequestError ? err.message : printerErrorMessage(err)
    toast.error(msg)
  } finally {
    printing.value = false
  }
}

async function onPrintPrecheck() {
  if (!selectedTableId.value) return
  if (!isConnected.value) {
    toast.error('Conecta la impresora primero en Configuraciones')
    return
  }
  printing.value = true
  try {
    const width = await defaultPaperWidth()
    if (width === null) {
      toast.error('Configura una impresora en Ajustes antes de imprimir')
      return
    }
    const precheck = await getPrecheck(selectedTableId.value, width)
    await printBase64(precheck.escposBase64)
    toast.success('Precuenta impresa')
  } catch (err) {
    const msg = err instanceof ApiRequestError ? err.message : printerErrorMessage(err)
    toast.error(msg)
  } finally {
    printing.value = false
  }
}
</script>

<template>
  <div class="dashboard">
    <!-- Left panel: active tables -->
    <aside class="left-panel">
      <h2 class="panel-title">Pedidos activos</h2>

      <p v-if="loading" class="state-msg">Cargando…</p>
      <p v-else-if="error" class="state-msg">{{ error }}</p>
      <p v-else-if="activeTables.length === 0" class="state-msg">Sin pedidos activos.</p>
      <ul v-else class="table-list">
        <li
          v-for="summary in activeTables"
          :key="summary.table.id"
          class="table-row"
          :class="{ selected: selectedTableId === summary.table.id }"
          role="button"
          :aria-pressed="selectedTableId === summary.table.id"
          @click="selectTable(summary.table.id)"
        >
          <div class="row-top">
            <span class="table-name">{{ summary.table.name }}</span>
            <Badge :tone="tableStatusTone[summary.table.status]">
              {{ tableStatusLabel[summary.table.status] }}
            </Badge>
          </div>
          <div class="row-bottom">
            <span v-if="summary.hasNewOrder" class="new-order-indicator">
              <span class="new-dot" aria-hidden="true" />
              Nuevo pedido
            </span>
            <span v-else class="row-spacer" />
            <span class="table-total">{{ formatCurrency(summary.total) }}</span>
          </div>
        </li>
      </ul>
    </aside>

    <!-- Right panel: bill detail -->
    <section class="right-panel">
      <template v-if="selectedSummary">
        <div class="bill-header">
          <h2 class="bill-table-name">{{ selectedSummary.table.name }}</h2>
          <span class="bill-meta">Cuenta única · {{ selectedSummary.table.capacity }} pers.</span>
        </div>

        <div class="bill-items">
          <div v-for="line in billLines" :key="line.productId" class="bill-line">
            <div class="line-left">
              <span class="line-desc">{{ line.quantity }} × {{ line.productName }}</span>
              <Badge v-if="line.kind === 'combo'" tone="teal">Combo</Badge>
            </div>
            <span class="line-price">{{ formatCurrency(line.subtotal) }}</span>
          </div>
        </div>

        <div class="bill-total">
          <span class="total-label">Total</span>
          <span class="total-amount">{{ formatCurrency(billTotal) }}</span>
        </div>

        <div class="bill-actions">
          <button class="action-btn outlined" :disabled="printing" @click="onPrintComanda">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path
                d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
              />
            </svg>
            Imprimir comanda
          </button>
          <button class="action-btn outlined" :disabled="printing" @click="onPrintPrecheck">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
              />
            </svg>
            Generar precuenta
          </button>
          <button class="action-btn primary" @click="registerPayment">
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
            Registrar pago
          </button>
        </div>
      </template>

      <div v-else class="empty-state">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="40"
          height="40"
          aria-hidden="true"
        >
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"
          />
        </svg>
        <p>Selecciona una mesa para ver el pedido</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100%;
  background: white;
}

/* Left panel */
.left-panel {
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-title {
  padding: 1.25rem 1.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f3f4f6;
}

.table-list {
  list-style: none;
  flex: 1;
}

.state-msg {
  padding: 1.25rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.table-row {
  padding: 1rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.12s;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row.selected {
  background: #e8f5f3;
}

.row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.table-name {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.selected .table-name {
  color: #1a1a1a;
}

.row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.new-order-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 500;
}

.new-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary);
}

.row-spacer {
  flex: 1;
}

.table-total {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.selected .table-total {
  color: #374151;
}

/* Right panel */
.right-panel {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1.75rem 2rem;
}

.bill-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.bill-table-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.bill-meta {
  font-size: 0.875rem;
  color: #9ca3af;
}

.bill-items {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid #f3f4f6;
}

.bill-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
}

.line-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.line-desc {
  font-size: 0.975rem;
  color: #1a1a1a;
}

.line-price {
  font-size: 0.975rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.bill-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0;
  margin-top: 0.25rem;
}

.total-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.bill-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 1.5rem;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.15s;
  line-height: 1.3;
  text-align: center;
}

.action-btn.outlined {
  background: white;
  border: 1.5px solid #e5e7eb;
  color: #374151;
}

.action-btn.outlined:hover {
  background: #f9fafb;
}

.action-btn.primary {
  background: var(--color-primary);
  border: none;
  color: white;
}

.action-btn.primary:hover {
  background: var(--color-primary-dark);
}

/* Empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #d1d5db;
}

.empty-state p {
  font-size: 0.9rem;
  color: #9ca3af;
}
</style>
