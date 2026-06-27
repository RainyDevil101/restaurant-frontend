export const ORDERS_NAMESPACE = '/orders';

export const ORDERS_SOCKET_EVENT = {
  CONNECT: 'connect',
  JOIN_CHECKOUT: 'joinCheckout',
  ORDER_CREATED: 'orderCreated',
  ORDER_STATUS_CHANGED: 'orderStatusChanged',
} as const;

export type OrdersSocketEvent = (typeof ORDERS_SOCKET_EVENT)[keyof typeof ORDERS_SOCKET_EVENT];
