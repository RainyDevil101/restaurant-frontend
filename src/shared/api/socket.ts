import { io, type Socket } from 'socket.io-client';
import { getToken } from '@/shared/session';
import { ORDERS_NAMESPACE } from './socketEvents';

function ordersSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${ORDERS_NAMESPACE}`;
}

export function connectOrdersSocket(): Socket {
  const token = getToken();
  return io(ordersSocketUrl(), {
    transports: ['websocket'],
    auth: token ? { token } : {},
  });
}
