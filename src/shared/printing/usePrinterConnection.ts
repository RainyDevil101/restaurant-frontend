import { computed, ref } from 'vue';
import {
  base64ToBytes,
  printerAdapters,
  printerErrorMessage,
  testTicket,
  type ConnectedPrinter,
  type PrinterTransportId,
} from './index';

const printer = ref<ConnectedPrinter | null>(null);
const activeKind = ref<PrinterTransportId | null>(null);
const connecting = ref(false);
const error = ref('');

export function usePrinterConnection() {
  const isConnected = computed(() => printer.value !== null);
  const deviceName = computed(() => printer.value?.name ?? '');

  async function connect(kind: PrinterTransportId): Promise<boolean> {
    connecting.value = true;
    error.value = '';
    try {
      printer.value = await printerAdapters[kind].connect();
      activeKind.value = kind;
      return true;
    } catch (err) {
      error.value = printerErrorMessage(err);
      return false;
    } finally {
      connecting.value = false;
    }
  }

  async function write(bytes: Uint8Array): Promise<void> {
    if (!printer.value) throw new Error('No hay impresora conectada.');
    await printer.value.write(bytes);
  }

  async function printBase64(base64: string): Promise<void> {
    await write(base64ToBytes(base64));
  }

  async function printTest(columns = 48): Promise<void> {
    await write(testTicket(columns));
  }

  async function disconnect(): Promise<void> {
    await printer.value?.disconnect();
    printer.value = null;
    activeKind.value = null;
  }

  return {
    isConnected,
    deviceName,
    connecting,
    error,
    activeKind,
    connect,
    write,
    printBase64,
    printTest,
    disconnect,
  };
}
