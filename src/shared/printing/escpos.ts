import { BRAND } from '@/shared/constants/brand';

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const TEST_TICKET_SUBTITLE = 'Prueba de impresion';
const testTicketWidthLine = (columns: number) => `Ancho: ${columns} columnas`;

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function ascii(text: string): number[] {
  const clean = text.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    out.push(code < 128 ? code : 0x3f);
  }
  return out;
}

export function testTicket(columns: number): Uint8Array {
  const bytes: number[] = [];
  const write = (s: string) => bytes.push(...ascii(s));
  bytes.push(ESC, 0x40);
  bytes.push(ESC, 0x61, 0x01);
  bytes.push(ESC, 0x45, 0x01);
  write(BRAND.toUpperCase());
  bytes.push(LF);
  bytes.push(ESC, 0x45, 0x00);
  write(TEST_TICKET_SUBTITLE);
  bytes.push(LF);
  write(testTicketWidthLine(columns));
  bytes.push(LF);
  write('-'.repeat(columns));
  bytes.push(LF, LF, LF, LF);
  bytes.push(GS, 0x56, 0x00);
  return new Uint8Array(bytes);
}
