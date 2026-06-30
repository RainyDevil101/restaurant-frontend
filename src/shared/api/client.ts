import { getToken, clearSession } from '@/shared/session';
import { Route } from '@/shared/types';
import { API_BASE_URL } from './config';
import {
  HTTP_METHOD,
  HTTP_HEADER,
  CONTENT_TYPE_JSON,
  AUTH_SCHEME,
  HTTP_STATUS,
  type HttpMethod,
} from './http';

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
}

export class ApiRequestError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorBody | null;

  constructor(message: string, statusCode: number, body: ApiErrorBody | null) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  keepSessionOnUnauthorized?: boolean;
}

function messageFrom(body: ApiErrorBody | null, status: number): string {
  if (!body) return `Error ${status}`;
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = HTTP_METHOD.GET,
    body,
    auth = true,
    keepSessionOnUnauthorized = false,
  } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers[HTTP_HEADER.CONTENT_TYPE] = CONTENT_TYPE_JSON;
  if (auth) {
    const token = getToken();
    if (token) headers[HTTP_HEADER.AUTHORIZATION] = `${AUTH_SCHEME} ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === HTTP_STATUS.NO_CONTENT) return undefined as T;

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | null;
    if (response.status === HTTP_STATUS.UNAUTHORIZED && auth && !keepSessionOnUnauthorized) {
      clearSession();
      if (window.location.pathname !== Route.LOGIN) window.location.assign(Route.LOGIN);
    }
    throw new ApiRequestError(messageFrom(errorBody, response.status), response.status, errorBody);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: HTTP_METHOD.GET, auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: HTTP_METHOD.POST, body, auth }),
  postKeepingSession: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: HTTP_METHOD.POST,
      body,
      auth: true,
      keepSessionOnUnauthorized: true,
    }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: HTTP_METHOD.PATCH, body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: HTTP_METHOD.PUT, body, auth }),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: HTTP_METHOD.DELETE, auth }),
};
