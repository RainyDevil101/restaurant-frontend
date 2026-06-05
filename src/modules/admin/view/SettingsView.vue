<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { colors } from '@/shared/styles/colors'
import { usePrinters } from '../composables/usePrinters'
import { useReceiptSettings } from '../composables/useReceiptSettings'
import { usePrinterSupport } from '../composables/usePrinterSupport'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Badge from '@/shared/components/Badge.vue'
import { ApiRequestError } from '@/shared/api/client'
import type { Printer, PrinterConnection, PaperWidth } from '@/shared/api/settings'

const { printingSupported } = usePrinterSupport()
const { printers, loading, error, createPrinter, updatePrinter, removePrinter, setDefault } =
  usePrinters()
const { settings, save: saveReceipt } = useReceiptSettings()

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  connection: 'usb' as PrinterConnection,
  paperWidth: 80 as PaperWidth,
  isDefault: false,
})

function openCreate() {
  editingId.value = null
  formError.value = ''
  form.name = ''
  form.connection = 'usb'
  form.paperWidth = 80
  form.isDefault = false
  dialogOpen.value = true
}

function openEdit(printer: Printer) {
  editingId.value = printer.id
  formError.value = ''
  form.name = printer.name
  form.connection = printer.connection
  form.paperWidth = printer.paperWidth
  form.isDefault = printer.isDefault
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

async function savePrinter() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = 'El nombre es obligatorio.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await updatePrinter(editingId.value, {
        name: trimmedName,
        connection: form.connection,
        paperWidth: form.paperWidth,
        isDefault: form.isDefault,
      })
    } else {
      await createPrinter({
        name: trimmedName,
        connection: form.connection,
        paperWidth: form.paperWidth,
        isDefault: form.isDefault,
      })
    }
    dialogOpen.value = false
  } catch (err) {
    formError.value = err instanceof ApiRequestError ? err.message : 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}

const confirmOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function openDelete(id: string) {
  deletingId.value = id
  deleteError.value = ''
  confirmOpen.value = true
}

function closeConfirm() {
  confirmOpen.value = false
  deletingId.value = null
}

async function confirmDelete() {
  if (!deletingId.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await removePrinter(deletingId.value)
    confirmOpen.value = false
    deletingId.value = null
  } catch (err) {
    deleteError.value = err instanceof ApiRequestError ? err.message : 'No se pudo eliminar.'
  } finally {
    deleting.value = false
  }
}

const receiptForm = reactive({
  businessName: '',
  address: '',
  footer: '',
})
const receiptSaving = ref(false)

watch(
  settings,
  (value) => {
    if (!value) return
    receiptForm.businessName = value.businessName
    receiptForm.address = value.address
    receiptForm.footer = value.footer
  },
  { immediate: true },
)

async function onSaveReceipt() {
  receiptSaving.value = true
  try {
    await saveReceipt({
      businessName: receiptForm.businessName.trim(),
      address: receiptForm.address.trim(),
      footer: receiptForm.footer.trim(),
    })
  } catch {
    receiptSaving.value = false
    return
  }
  receiptSaving.value = false
}

function connectionLabel(connection: PrinterConnection): string {
  return connection === 'usb' ? 'USB' : 'Bluetooth'
}
</script>

<template>
  <div class="settings-view">
    <h1 class="page-title">Configuraciones</h1>

    <div v-if="!printingSupported" class="support-banner" role="alert">
      La impresión requiere Chrome o Edge en este equipo (con HTTPS). Podés configurar impresoras
      igual, pero no se podrá imprimir desde este navegador.
    </div>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">Impresoras</h2>
        <button class="new-btn" @click="openCreate">Nueva impresora</button>
      </div>

      <p v-if="error" class="section-error" role="alert">{{ error }}</p>
      <p v-else-if="loading" class="section-muted">Cargando…</p>
      <p v-else-if="!printers.length" class="section-muted">Sin impresoras configuradas.</p>

      <ul v-else class="printer-list">
        <li v-for="printer in printers" :key="printer.id" class="printer-card">
          <div class="printer-info">
            <div class="printer-name-row">
              <span class="printer-name">{{ printer.name }}</span>
              <Badge v-if="printer.isDefault" tone="amber">Predeterminada</Badge>
            </div>
            <div class="printer-meta">
              <Badge :tone="printer.connection === 'usb' ? 'green' : 'blue'">
                {{ connectionLabel(printer.connection) }}
              </Badge>
              <span class="printer-size">{{ printer.paperWidth }}mm</span>
            </div>
          </div>

          <div class="row-actions">
            <button
              v-if="!printer.isDefault"
              class="action-btn"
              @click="setDefault(printer.id)"
            >
              Hacer predeterminada
            </button>
            <button class="action-btn" @click="openEdit(printer)">Editar</button>
            <button class="action-btn danger" @click="openDelete(printer.id)">Eliminar</button>
          </div>
        </li>
      </ul>
    </section>

    <section class="section">
      <h2 class="section-title">Datos del comprobante</h2>

      <form class="receipt-form" @submit.prevent="onSaveReceipt">
        <AdminFormField label="Nombre del local" for="receipt-business-name">
          <input
            id="receipt-business-name"
            v-model="receiptForm.businessName"
            class="field-input"
          />
        </AdminFormField>

        <AdminFormField label="Dirección / RUT" for="receipt-address">
          <input id="receipt-address" v-model="receiptForm.address" class="field-input" />
        </AdminFormField>

        <AdminFormField label="Pie del comprobante" for="receipt-footer">
          <input id="receipt-footer" v-model="receiptForm.footer" class="field-input" />
        </AdminFormField>

        <div class="receipt-actions">
          <button type="submit" class="save-btn" :disabled="receiptSaving">
            {{ receiptSaving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </section>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar impresora' : 'Nueva impresora'"
      :saving="saving"
      :error="formError"
      @close="closeDialog"
      @submit="savePrinter"
    >
      <AdminFormField label="Nombre" for="printer-name">
        <input id="printer-name" v-model="form.name" class="field-input" required />
      </AdminFormField>

      <AdminFormField label="Conexión" for="printer-connection">
        <select id="printer-connection" v-model="form.connection" class="field-input">
          <option value="usb">USB</option>
          <option value="bluetooth">Bluetooth</option>
        </select>
      </AdminFormField>

      <AdminFormField label="Tamaño de papel" for="printer-paper-width">
        <select id="printer-paper-width" v-model.number="form.paperWidth" class="field-input">
          <option :value="80">80mm</option>
          <option :value="58">58mm</option>
        </select>
      </AdminFormField>

      <label class="check-field">
        <input v-model="form.isDefault" type="checkbox" />
        <span>Predeterminada</span>
      </label>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar impresora"
      message="¿Seguro que deseas eliminar esta impresora? Esta acción no se puede deshacer."
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
  background: v-bind('colors.neutral.borderSubtle');
  color: v-bind('colors.neutral.textMedium');
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
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
