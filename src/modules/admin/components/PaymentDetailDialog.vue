<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import Badge from '@/shared/components/Badge.vue';
import { PAYMENT_METHOD, ITEM_KIND, PRINTER_CONNECTION } from '@/shared/types';
import { PAYMENT_METHOD_LABEL, ITEM_KIND_LABEL } from '@/shared/constants/labels';
import { LOCALE } from '@/shared/constants/locale';
import { UI_LABELS } from '@/shared/constants/ui';
import { colors } from '@/shared/styles/colors';
import { formatCurrency } from '../helpers/formatCurrency';
import { usePaymentPrinting } from '../composables/usePaymentPrinting';
import { usePrinterSupport } from '../composables/usePrinterSupport';
import { usePrinterConnection } from '@/shared/printing/usePrinterConnection';
import { toast } from '@/shared/toast';
import { ADMIN_LABELS } from '../constants';
import { ADMIN_MESSAGES, type PaymentRow } from '../domain';
import { DocumentTextIcon, PrinterIcon } from '@/modules/shared/components/icons';

const props = defineProps<{ payment: PaymentRow }>();
const emit = defineEmits<{ close: [] }>();

const { printingSupported, usbSupported, bluetoothSupported } = usePrinterSupport();
const { printing, reprintReceipt, reprintComanda } = usePaymentPrinting();
const { isConnected, deviceName, connecting, connect } = usePrinterConnection();

async function connectUsb() {
  if (await connect(PRINTER_CONNECTION.USB))
    toast.success(ADMIN_MESSAGES.printerConnected(deviceName.value));
}

async function connectBluetooth() {
  if (await connect(PRINTER_CONNECTION.BLUETOOTH))
    toast.success(ADMIN_MESSAGES.printerConnected(deviceName.value));
}

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
                new Date(payment.paidAt).toLocaleString(LOCALE, {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </p>
          </div>
          <button
            type="button"
            class="close-x"
            :aria-label="UI_LABELS.close"
            @click="emit('close')"
          >
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
                <Badge
                  v-if="item.kind === ITEM_KIND.COMBO"
                  :tone="ITEM_KIND_LABEL[ITEM_KIND.COMBO].tone"
                  >{{ ITEM_KIND_LABEL[ITEM_KIND.COMBO].label }}</Badge
                >
              </div>
              <span class="item-subtotal">{{ formatCurrency(item.subtotal) }}</span>
            </div>
          </div>

          <!-- Summary -->
          <div class="summary">
            <div class="summary-row total-row">
              <span>{{ ADMIN_LABELS.fields.totalCharged }}</span>
              <span class="total-amount">{{ formatCurrency(payment.amount) }}</span>
            </div>
            <div v-if="payment.method === PAYMENT_METHOD.CASH" class="summary-row">
              <span class="label-muted">{{ ADMIN_LABELS.fields.change }}</span>
              <span class="label-muted">{{ formatCurrency(payment.change) }}</span>
            </div>
            <div class="summary-row">
              <span class="label-muted">{{ ADMIN_LABELS.fields.method }}</span>
              <Badge :tone="PAYMENT_METHOD_LABEL[payment.method].tone">
                {{ PAYMENT_METHOD_LABEL[payment.method].label }}
              </Badge>
            </div>
            <div v-if="payment.waiterNames.length" class="summary-row">
              <span class="label-muted">{{ ADMIN_LABELS.payments.servedBy }}</span>
              <span class="waiter-names">{{ payment.waiterNames.join(', ') }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <div v-if="printingSupported" class="printer-actions">
            <template v-if="isConnected">
              <button
                type="button"
                class="btn-reprint"
                :disabled="printing"
                @click="reprintReceipt(props.payment.id)"
              >
                <DocumentTextIcon :size="18" />
                {{ ADMIN_LABELS.printer.receipt }}
              </button>
              <button
                type="button"
                class="btn-reprint"
                :disabled="printing"
                @click="reprintComanda(props.payment.id)"
              >
                <PrinterIcon :size="18" />
                {{ ADMIN_LABELS.printer.comanda }}
              </button>
            </template>
            <template v-else>
              <button
                v-if="usbSupported"
                type="button"
                class="btn-connect"
                :disabled="connecting"
                @click="connectUsb"
              >
                {{
                  connecting
                    ? ADMIN_LABELS.printer.connecting
                    : ADMIN_LABELS.printer.connectUsbShort
                }}
              </button>
              <button
                v-if="bluetoothSupported"
                type="button"
                class="btn-connect"
                :disabled="connecting"
                @click="connectBluetooth"
              >
                {{
                  connecting
                    ? ADMIN_LABELS.printer.connecting
                    : ADMIN_LABELS.printer.connectBluetoothShort
                }}
              </button>
            </template>
          </div>
          <button type="button" class="btn-close" @click="emit('close')">
            {{ UI_LABELS.close }}
          </button>
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
  font-size: var(--font-xs);
  color: v-bind('colors.neutral.mutedText');
  margin-top: 2px;
}

.close-x {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: v-bind('colors.neutral.mutedText');
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
  color: v-bind('colors.neutral.mutedText');
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
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid v-bind('colors.neutral.borderSubtle');
}

.printer-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-connect {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  min-height: 2.75rem;
  background: var(--color-primary);
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.btn-connect:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reprint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  min-height: 2.75rem;
  background: none;
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: v-bind('colors.neutral.textMedium');
  transition:
    background 0.12s,
    border-color 0.12s,
    color 0.12s;
}

.btn-reprint:hover:not(:disabled) {
  background: v-bind('colors.neutral.surface');
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-reprint:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
