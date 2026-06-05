import { toast as sonner } from 'vue-sonner'
import type { ToastService, ToastOptions, PromiseMessages } from '../types'

export const sonnerAdapter: ToastService = {
  success(message, options?: ToastOptions) {
    sonner.success(message, options)
  },

  error(message, options?: ToastOptions) {
    sonner.error(message, options)
  },

  info(message, options?: ToastOptions) {
    sonner.info(message, options)
  },

  warning(message, options?: ToastOptions) {
    sonner.warning(message, options)
  },

  promise<T>(promise: Promise<T>, messages: PromiseMessages<T>): Promise<T> {
    sonner.promise(promise, messages as Parameters<typeof sonner.promise>[1])
    return promise
  },
}
