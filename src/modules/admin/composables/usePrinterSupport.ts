import { computed } from 'vue';

export function usePrinterSupport() {
  const usbSupported = computed(() => 'usb' in navigator);
  const bluetoothSupported = computed(() => 'bluetooth' in navigator);
  const secureContext = computed(() => window.isSecureContext);
  const printingSupported = computed(
    () => secureContext.value && (usbSupported.value || bluetoothSupported.value),
  );

  return { usbSupported, bluetoothSupported, secureContext, printingSupported };
}
