<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCheckoutDashboard } from '../composables/useCheckoutDashboard';
import { formatCurrency } from '../helpers/formatCurrency';
import Badge from '@/shared/components/Badge.vue';
import { ITEM_KIND, Route } from '@/shared/types';
import { TABLE_STATUS_LABEL, ITEM_KIND_LABEL } from '@/shared/constants/labels';
import { UI_LABELS } from '@/shared/constants/ui';
import { CHECKOUT_MESSAGES, CHECKOUT_LABELS } from '../domain';
import { getComandasByTable } from '@/shared/api/orders';
import { getPrecheck } from '@/shared/api/billing';
import { listPrinters } from '@/shared/api/settings';
import { usePrinterConnection } from '@/shared/printing/usePrinterConnection';
import { printerErrorMessage } from '@/shared/printing';
import { toast } from '@/shared/toast';
import { ApiRequestError } from '@/shared/api/client';
import { colors } from '@/shared/styles/colors';
import {
  PrinterIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UserSquareIcon,
} from '@/modules/shared/components/icons';

const router = useRouter();
const { activeTables, selectedTableId, selectedSummary, billLines, billTotal, loading, error } =
  useCheckoutDashboard();
const { isConnected, printBase64 } = usePrinterConnection();

const printing = ref(false);

function selectTable(id: string) {
  selectedTableId.value = id;
}

function registerPayment() {
  if (selectedTableId.value) {
    router.push(`${Route.CHECKOUT}/table/${selectedTableId.value}`);
  }
}

async function defaultPaperWidth(): Promise<number | null> {
  const printers = await listPrinters().catch(() => []);
  const def = printers.find((p) => p.isDefault) ?? printers[0];
  return def?.paperWidth ?? null;
}

async function onPrintComanda() {
  if (!selectedTableId.value) return;
  if (!isConnected.value) {
    toast.error(CHECKOUT_MESSAGES.PRINTER_NOT_CONNECTED);
    return;
  }
  printing.value = true;
  try {
    const width = await defaultPaperWidth();
    if (width === null) {
      toast.error(CHECKOUT_MESSAGES.PRINTER_NOT_CONFIGURED);
      return;
    }
    const comandas = await getComandasByTable(selectedTableId.value, width);
    for (const comanda of comandas) {
      await printBase64(comanda.escposBase64);
    }
    toast.success(CHECKOUT_MESSAGES.comandaPrinted(comandas.length));
  } catch (err) {
    const msg = err instanceof ApiRequestError ? err.message : printerErrorMessage(err);
    toast.error(msg);
  } finally {
    printing.value = false;
  }
}

async function onPrintPrecheck() {
  if (!selectedTableId.value) return;
  if (!isConnected.value) {
    toast.error(CHECKOUT_MESSAGES.PRINTER_NOT_CONNECTED);
    return;
  }
  printing.value = true;
  try {
    const width = await defaultPaperWidth();
    if (width === null) {
      toast.error(CHECKOUT_MESSAGES.PRINTER_NOT_CONFIGURED);
      return;
    }
    const precheck = await getPrecheck(selectedTableId.value, width);
    await printBase64(precheck.escposBase64);
    toast.success(CHECKOUT_MESSAGES.PRECHECK_PRINTED);
  } catch (err) {
    const msg = err instanceof ApiRequestError ? err.message : printerErrorMessage(err);
    toast.error(msg);
  } finally {
    printing.value = false;
  }
}
</script>

<template>
  <div class="dashboard">
    <!-- Left panel: active tables -->
    <aside class="left-panel">
      <h2 class="panel-title">{{ CHECKOUT_LABELS.dashboard.activeOrdersTitle }}</h2>

      <p v-if="loading" class="state-msg">{{ UI_LABELS.loading }}</p>
      <p v-else-if="error" class="state-msg">{{ error }}</p>
      <p v-else-if="activeTables.length === 0" class="state-msg">
        {{ CHECKOUT_LABELS.dashboard.noActiveOrders }}
      </p>
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
            <Badge :tone="TABLE_STATUS_LABEL[summary.table.status].tone">
              {{ TABLE_STATUS_LABEL[summary.table.status].label }}
            </Badge>
          </div>
          <div class="row-bottom">
            <span v-if="summary.hasNewOrder" class="new-order-indicator">
              <span class="new-dot" aria-hidden="true" />
              {{ CHECKOUT_LABELS.dashboard.newOrder }}
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
          <span class="bill-meta">{{
            CHECKOUT_LABELS.dashboard.singleBill(selectedSummary.table.capacity)
          }}</span>
        </div>

        <div class="bill-items">
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

        <div class="bill-total">
          <span class="total-label">{{ CHECKOUT_LABELS.common.total }}</span>
          <span class="total-amount">{{ formatCurrency(billTotal) }}</span>
        </div>

        <div class="bill-actions">
          <button class="action-btn outlined" :disabled="printing" @click="onPrintComanda">
            <PrinterIcon :size="20" />
            {{ CHECKOUT_LABELS.dashboard.printComanda }}
          </button>
          <button class="action-btn outlined" :disabled="printing" @click="onPrintPrecheck">
            <DocumentTextIcon :size="20" />
            {{ CHECKOUT_LABELS.dashboard.generatePrecheck }}
          </button>
          <button class="action-btn primary" @click="registerPayment">
            <CreditCardIcon :size="20" />
            {{ CHECKOUT_LABELS.common.registerPayment }}
          </button>
        </div>
      </template>

      <div v-else class="empty-state">
        <UserSquareIcon :size="40" />
        <p>{{ CHECKOUT_LABELS.dashboard.selectTableHint }}</p>
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
  color: v-bind('colors.neutral.mutedText');
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
  font-size: var(--font-xs);
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
  color: v-bind('colors.neutral.mutedText');
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
  color: v-bind('colors.neutral.mutedText');
}
</style>
