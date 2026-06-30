export const API_BASE_URL = import.meta.env.VITE_API_URL;

const API_PREFIX_RE = /\/api\/?$/;

export const HEALTH_PATH = '/health';

export function apiOrigin(): string {
  return API_BASE_URL.replace(API_PREFIX_RE, '');
}
