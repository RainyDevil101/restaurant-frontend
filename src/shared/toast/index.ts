import { sonnerAdapter } from './adapters/sonner'

export type { ToastService, ToastOptions, PromiseMessages } from './types'

// To swap the notification library, replace sonnerAdapter with a different adapter.
// The rest of the codebase imports only from '@/shared/toast' and stays untouched.
export const toast = sonnerAdapter
