<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { colors } from '@/shared/styles/colors';
import { usePrinters } from '../composables/usePrinters';
import { useReceiptSettings } from '../composables/useReceiptSettings';
import { usePrinterSupport } from '../composables/usePrinterSupport';
import { usePrinterConnection } from '@/shared/printing/usePrinterConnection';
import { printerErrorMessage } from '@/shared/printing';
import { toast } from '@/shared/toast';
import AdminFormField from '../components/AdminFormField.vue';
import ModalDialog from '../components/ModalDialog.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import Badge from '@/shared/components/Badge.vue';
import { ApiRequestError } from '@/shared/api/client';
import type { Printer, PrinterConnection, PaperWidth } from '@/shared/api/settings';
import { PRINTER_CONNECTION, PAPER_WIDTH, DEFAULT_PAPER_WIDTH } from '@/shared/types';
import { PRINTER_CONNECTION_LABEL } from '@/shared/constants/labels';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { UI_LABELS } from '@/shared/constants/ui';
import { ADMIN_LABELS } from '../constants';
import { ADMIN_MESSAGES } from '../domain';

const { printingSupported, usbSupported, bluetoothSupported } = usePrinterSupport();
const { printers, loading, error, createPrinter, updatePrinter, removePrinter, setDefault } =
  usePrinters();
const { settings, save: saveReceipt } = useReceiptSettings();

const {
  isConnected,
  deviceName,
  connecting,
  error: connectionError,
  connect,
  printTest,
  disconnect,
} = usePrinterConnection();

const defaultColumns = computed(() => {
  const fallback = printers.value.find((p) => p.isDefault) ?? printers.value[0];
  return fallback?.paperWidth === PAPER_WIDTH.NARROW ? 32 : 48;
});

async function connectUsb() {
  if (await connect(PRINTER_CONNECTION.USB))
    toast.success(ADMIN_MESSAGES.printerConnected(deviceName.value));
}

async function connectBluetooth() {
  if (await connect(PRINTER_CONNECTION.BLUETOOTH))
    toast.success(ADMIN_MESSAGES.printerConnected(deviceName.value));
}

async function testPrint() {
  try {
    await printTest(defaultColumns.value);
    toast.success(ADMIN_MESSAGES.TEST_PRINT_SENT);
  } catch (err) {
    toast.error(printerErrorMessage(err));
  }
}

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const formError = ref('');

const form = reactive({
  name: '',
  connection: PRINTER_CONNECTION.USB as PrinterConnection,
  paperWidth: DEFAULT_PAPER_WIDTH as PaperWidth,
  isDefault: false,
});

function openCreate() {
  editingId.value = null;
  formError.value = '';
  form.name = '';
  form.connection = PRINTER_CONNECTION.USB;
  form.paperWidth = DEFAULT_PAPER_WIDTH;
  form.isDefault = false;
  dialogOpen.value = true;
}

function openEdit(printer: Printer) {
  editingId.value = printer.id;
  formError.value = '';
  form.name = printer.name;
  form.connection = printer.connection;
  form.paperWidth = printer.paperWidth;
  form.isDefault = printer.isDefault;
  dialogOpen.value = true;
}

function closeDialog() {
  dialogOpen.value = false;
}

async function savePrinter() {
  const trimmedName = form.name.trim();
  if (!trimmedName) {
    formError.value = ADMIN_MESSAGES.PRINTER_NAME_REQUIRED;
    return;
  }
  saving.value = true;
  formError.value = '';
  try {
    if (editingId.value) {
      await updatePrinter(editingId.value, {
        name: trimmedName,
        connection: form.connection,
        paperWidth: form.paperWidth,
        isDefault: form.isDefault,
      });
    } else {
      await createPrinter({
        name: trimmedName,
        connection: form.connection,
        paperWidth: form.paperWidth,
        isDefault: form.isDefault,
      });
    }
    dialogOpen.value = false;
  } catch (err) {
    formError.value = err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.SAVE_ERROR;
  } finally {
    saving.value = false;
  }
}

const confirmOpen = ref(false);
const deletingId = ref<string | null>(null);
const deleting = ref(false);
const deleteError = ref('');

function openDelete(id: string) {
  deletingId.value = id;
  deleteError.value = '';
  confirmOpen.value = true;
}

function closeConfirm() {
  confirmOpen.value = false;
  deletingId.value = null;
}

async function confirmDelete() {
  if (!deletingId.value) return;
  deleting.value = true;
  deleteError.value = '';
  try {
    await removePrinter(deletingId.value);
    confirmOpen.value = false;
    deletingId.value = null;
  } catch (err) {
    deleteError.value = err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.DELETE_ERROR;
  } finally {
    deleting.value = false;
  }
}

const receiptForm = reactive({
  businessName: '',
  address: '',
  footer: '',
});
const receiptSaving = ref(false);

watch(
  settings,
  (value) => {
    if (!value) return;
    receiptForm.businessName = value.businessName;
    receiptForm.address = value.address;
    receiptForm.footer = value.footer;
  },
  { immediate: true },
);

async function onSaveReceipt() {
  receiptSaving.value = true;
  try {
    await saveReceipt({
      businessName: receiptForm.businessName.trim(),
      address: receiptForm.address.trim(),
      footer: receiptForm.footer.trim(),
    });
  } catch {
    receiptSaving.value = false;
    return;
  }
  receiptSaving.value = false;
}
</script>

<template>
  <div class="settings-view">
    <h1 class="page-title">{{ ROUTE_TITLES.CONFIGURACION }}</h1>

    <div v-if="!printingSupported" class="support-banner" role="alert">
      {{ ADMIN_LABELS.settings.supportBanner }}
    </div>

    <section v-if="printingSupported" class="section">
      <div class="section-head">
        <h2 class="section-title">{{ ADMIN_LABELS.settings.connectionSection }}</h2>
        <Badge :tone="isConnected ? 'green' : 'gray'">
          {{ isConnected ? ADMIN_LABELS.printer.connected : ADMIN_LABELS.printer.notConnected }}
        </Badge>
      </div>

      <p v-if="isConnected" class="connected-name">{{ deviceName }}</p>
      <p v-else class="section-muted">
        {{ ADMIN_LABELS.settings.connectHint }}
      </p>

      <div class="connect-actions">
        <template v-if="!isConnected">
          <button
            v-if="usbSupported"
            class="connect-btn"
            :disabled="connecting"
            @click="connectUsb"
          >
            {{ connecting ? ADMIN_LABELS.printer.connecting : ADMIN_LABELS.printer.connectUsb }}
          </button>
          <button
            v-if="bluetoothSupported"
            class="connect-btn"
            :disabled="connecting"
            @click="connectBluetooth"
          >
            {{
              connecting ? ADMIN_LABELS.printer.connecting : ADMIN_LABELS.printer.connectBluetooth
            }}
          </button>
        </template>
        <template v-else>
          <button class="connect-btn" @click="testPrint">
            {{ ADMIN_LABELS.printer.testPrint }}
          </button>
          <button class="disconnect-btn" @click="disconnect">
            {{ ADMIN_LABELS.printer.disconnect }}
          </button>
        </template>
      </div>

      <p v-if="connectionError" class="section-error" role="alert">{{ connectionError }}</p>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">{{ ADMIN_LABELS.settings.printersSection }}</h2>
        <button class="new-btn" @click="openCreate">{{ ADMIN_LABELS.printer.newPrinter }}</button>
      </div>

      <p v-if="error" class="section-error" role="alert">{{ error }}</p>
      <p v-else-if="loading" class="section-muted">{{ UI_LABELS.loading }}</p>
      <p v-else-if="!printers.length" class="section-muted">
        {{ ADMIN_LABELS.printer.noPrinters }}
      </p>

      <ul v-else class="printer-list">
        <li v-for="printer in printers" :key="printer.id" class="printer-card">
          <div class="printer-info">
            <div class="printer-name-row">
              <span class="printer-name">{{ printer.name }}</span>
              <Badge v-if="printer.isDefault" tone="amber">{{
                ADMIN_LABELS.printer.default
              }}</Badge>
            </div>
            <div class="printer-meta">
              <Badge :tone="printer.connection === PRINTER_CONNECTION.USB ? 'green' : 'blue'">
                {{ PRINTER_CONNECTION_LABEL[printer.connection] }}
              </Badge>
              <span class="printer-size">{{
                ADMIN_LABELS.counts.paperWidth(printer.paperWidth)
              }}</span>
            </div>
          </div>

          <div class="row-actions">
            <button v-if="!printer.isDefault" class="action-btn" @click="setDefault(printer.id)">
              {{ ADMIN_LABELS.printer.makeDefault }}
            </button>
            <button class="action-btn" @click="openEdit(printer)">{{ UI_LABELS.edit }}</button>
            <button class="action-btn danger" @click="openDelete(printer.id)">
              {{ UI_LABELS.remove }}
            </button>
          </div>
        </li>
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">{{ ADMIN_LABELS.settings.receiptSection }}</h2>

      <form class="receipt-form" @submit.prevent="onSaveReceipt">
        <AdminFormField :label="ADMIN_LABELS.settings.businessName" for="receipt-business-name">
          <input
            id="receipt-business-name"
            v-model="receiptForm.businessName"
            class="field-input"
          />
        </AdminFormField>

        <AdminFormField :label="ADMIN_LABELS.settings.address" for="receipt-address">
          <input id="receipt-address" v-model="receiptForm.address" class="field-input" />
        </AdminFormField>

        <AdminFormField :label="ADMIN_LABELS.settings.footer" for="receipt-footer">
          <input id="receipt-footer" v-model="receiptForm.footer" class="field-input" />
        </AdminFormField>

        <div class="receipt-actions">
          <button type="submit" class="save-btn" :disabled="receiptSaving">
            {{ receiptSaving ? UI_LABELS.saving : UI_LABELS.save }}
          </button>
        </div>
      </form>
    </section>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? ADMIN_LABELS.printer.editTitle : ADMIN_LABELS.printer.newPrinter"
      :saving="saving"
      :error="formError"
      @close="closeDialog"
      @submit="savePrinter"
    >
      <AdminFormField :label="ADMIN_LABELS.fields.name" for="printer-name">
        <input id="printer-name" v-model="form.name" class="field-input" required />
      </AdminFormField>

      <AdminFormField :label="ADMIN_LABELS.fields.connection" for="printer-connection">
        <select id="printer-connection" v-model="form.connection" class="field-input">
          <option :value="PRINTER_CONNECTION.USB">
            {{ PRINTER_CONNECTION_LABEL[PRINTER_CONNECTION.USB] }}
          </option>
          <option :value="PRINTER_CONNECTION.BLUETOOTH">
            {{ PRINTER_CONNECTION_LABEL[PRINTER_CONNECTION.BLUETOOTH] }}
          </option>
        </select>
      </AdminFormField>

      <AdminFormField :label="ADMIN_LABELS.fields.paperWidth" for="printer-paper-width">
        <select id="printer-paper-width" v-model.number="form.paperWidth" class="field-input">
          <option :value="PAPER_WIDTH.WIDE">
            {{ ADMIN_LABELS.counts.paperWidth(PAPER_WIDTH.WIDE) }}
          </option>
          <option :value="PAPER_WIDTH.NARROW">
            {{ ADMIN_LABELS.counts.paperWidth(PAPER_WIDTH.NARROW) }}
          </option>
        </select>
      </AdminFormField>

      <label class="check-field">
        <input v-model="form.isDefault" type="checkbox" />
        <span>{{ ADMIN_LABELS.printer.default }}</span>
      </label>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      :title="ADMIN_LABELS.printer.deleteTitle"
      :message="ADMIN_LABELS.printer.deleteMessage"
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.settings-view {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: v-bind('colors.neutral.textStrong');
}

.support-banner {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.875rem;
  background: v-bind('colors.feedback.warningBg');
  border: 1px solid v-bind('colors.feedback.warningBorder');
  color: v-bind('colors.feedback.warningText');
}

.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: v-bind('colors.neutral.textStrong');
}

.new-btn {
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.new-btn:hover {
  background: var(--color-primary-dark);
}

.section-error {
  font-size: 0.85rem;
  color: v-bind('colors.feedback.error');
}

.section-muted {
  font-size: 0.9rem;
  color: v-bind('colors.neutral.secondary');
}

.connected-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: v-bind('colors.neutral.textStrong');
}

.connect-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.connect-btn {
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disconnect-btn {
  padding: 8px 16px;
  background: v-bind('colors.neutral.surface');
  color: v-bind('colors.neutral.textMedium');
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.printer-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.printer-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 14px 18px;
  border: 1px solid v-bind('colors.neutral.border');
  border-radius: 12px;
  background: v-bind('colors.neutral.background');
}

.printer-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.printer-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.printer-name {
  font-weight: 700;
  color: v-bind('colors.neutral.textStrong');
}

.printer-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.printer-size {
  font-size: 0.85rem;
  color: v-bind('colors.neutral.secondary');
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  padding: 5px 12px;
  min-height: 2.75rem;
  background: v-bind('colors.neutral.borderSubtle');
  color: v-bind('colors.neutral.textMedium');
  border: none;
  border-radius: 8px;
  font-size: var(--font-xs);
  font-weight: 600;
  cursor: pointer;
}

.action-btn:hover {
  background: v-bind('colors.neutral.border');
}

.action-btn:focus-visible {
  outline: 2px solid v-bind('colors.brand.primary');
  outline-offset: 2px;
}

.action-btn.danger {
  color: v-bind('colors.feedback.error');
}

.action-btn.danger:hover {
  background: v-bind('colors.feedback.errorBg');
}

.receipt-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 440px;
}

.receipt-actions {
  display: flex;
  justify-content: flex-start;
}

.save-btn {
  padding: 10px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:hover {
  background: var(--color-primary-dark);
}

.save-btn:disabled {
  background: v-bind('colors.brand.soft');
  cursor: not-allowed;
}

.check-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: v-bind('colors.neutral.textMedium');
}
</style>
