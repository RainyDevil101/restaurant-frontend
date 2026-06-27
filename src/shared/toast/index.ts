import { sonnerAdapter } from './adapters/sonner';

export type { ToastService, ToastOptions, PromiseMessages } from './types';

export const toast = sonnerAdapter;
