import { ref } from 'vue';
import { getPaymentReceipt, getPaymentComanda } from '@/shared/api/billing';
import { listPrinters } from '@/shared/api/settings';
import { usePrinterConnection } from '@/shared/printing/usePrinterConnection';
import { printerErrorMessage } from '@/shared/printing';
import { toast } from '@/shared/toast';
import { ApiRequestError } from '@/shared/api/client';
import { ADMIN_MESSAGES } from '../domain';

export function usePaymentPrinting() {
  const { isConnected, printBase64 } = usePrinterConnection();
  const printing = ref(false);

  async function defaultPaperWidth(): Promise<number | null> {
    const printers = await listPrinters().catch(() => []);
    const def = printers.find((p) => p.isDefault) ?? printers[0];
    return def?.paperWidth ?? null;
  }

  async function run(action: (width: number) => Promise<void>) {
    if (!isConnected.value) {
      toast.error(ADMIN_MESSAGES.PRINTER_NOT_CONNECTED);
      return;
    }
    printing.value = true;
    try {
      const width = await defaultPaperWidth();
      if (width === null) {
        toast.error(ADMIN_MESSAGES.PRINTER_NOT_CONFIGURED);
        return;
      }
      await action(width);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : printerErrorMessage(err));
    } finally {
      printing.value = false;
    }
  }

  function reprintReceipt(paymentId: string) {
    return run(async (width) => {
      const receipt = await getPaymentReceipt(paymentId, width);
      await printBase64(receipt.escposBase64);
      toast.success(ADMIN_MESSAGES.RECEIPT_PRINTED);
    });
  }

  function reprintComanda(paymentId: string) {
    return run(async (width) => {
      const comandas = await getPaymentComanda(paymentId, width);
      for (const comanda of comandas) {
        await printBase64(comanda.escposBase64);
      }
      toast.success(ADMIN_MESSAGES.comandaPrinted(comandas.length));
    });
  }

  return { printing, reprintReceipt, reprintComanda };
}
