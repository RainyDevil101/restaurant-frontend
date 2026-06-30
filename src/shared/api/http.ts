export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

export const HTTP_HEADER = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
} as const;

export const CONTENT_TYPE_JSON = 'application/json';

export const AUTH_SCHEME = 'Bearer';

export const HTTP_STATUS = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
} as const;
