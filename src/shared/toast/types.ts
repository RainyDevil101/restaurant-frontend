export interface ToastOptions {
  description?: string;
  duration?: number;
}

export interface PromiseMessages<T = unknown> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
}

export interface ToastService {
  success(message: string, options?: ToastOptions): void;
  error(message: string, options?: ToastOptions): void;
  info(message: string, options?: ToastOptions): void;
  warning(message: string, options?: ToastOptions): void;
  promise<T>(promise: Promise<T>, messages: PromiseMessages<T>): Promise<T>;
}
