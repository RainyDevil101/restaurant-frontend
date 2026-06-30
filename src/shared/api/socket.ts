import { io, type Socket } from 'socket.io-client';
import { getToken } from '@/shared/session';
import { apiOrigin } from './config';
import { ORDERS_NAMESPACE, SOCKET_TRANSPORTS } from './socketEvents';

function ordersSocketUrl(): string {
  return `${apiOrigin()}${ORDERS_NAMESPACE}`;
}

export function connectOrdersSocket(): Socket {
  const token = getToken();
  return io(ordersSocketUrl(), {
    transports: [...SOCKET_TRANSPORTS],
    auth: token ? { token } : {},
  });
}
