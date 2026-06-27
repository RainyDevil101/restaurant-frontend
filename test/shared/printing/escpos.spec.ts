import { describe, it, expect } from 'vitest';
import { base64ToBytes, testTicket } from '@/shared/printing/escpos';

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

function decodeAscii(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) {
    if (b >= 0x20 && b < 0x7f) out += String.fromCharCode(b);
  }
  return out;
}

function indexOfSeq(bytes: Uint8Array, seq: number[]): number {
  for (let i = 0; i + seq.length <= bytes.length; i++) {
    let match = true;
    for (let j = 0; j < seq.length; j++) {
      if (bytes[i + j] !== seq[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}

describe('base64ToBytes', () => {
  it('decodes base64 into the matching byte sequence', () => {
    const base64 = btoa('SUBITO');
    const bytes = base64ToBytes(base64);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(decodeAscii(bytes)).toBe('SUBITO');
  });

  it('returns an empty Uint8Array for an empty string', () => {
    const bytes = base64ToBytes('');
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes).toHaveLength(0);
  });

  it('preserves raw binary byte values', () => {
    const base64 = btoa(String.fromCharCode(0x00, 0x1b, 0x40, 0xff));
    const bytes = base64ToBytes(base64);
    expect(Array.from(bytes)).toEqual([0x00, 0x1b, 0x40, 0xff]);
  });
});

describe('testTicket', () => {
  it('returns a Uint8Array', () => {
    expect(testTicket(48)).toBeInstanceOf(Uint8Array);
  });

  it('begins with the ESC @ initialize opcode (0x1B 0x40)', () => {
    const bytes = testTicket(48);
    expect(bytes[0]).toBe(ESC);
    expect(bytes[1]).toBe(0x40);
  });

  it('contains the SUBITO brand header', () => {
    const text = decodeAscii(testTicket(48));
    expect(text).toContain('SUBITO');
  });

  it('contains the print-test label and column width line', () => {
    const text = decodeAscii(testTicket(48));
    expect(text).toContain('Prueba de impresion');
    expect(text).toContain('Ancho: 48 columnas');
  });

  it('emits ESC a (center align) and ESC E (bold) control sequences', () => {
    const bytes = testTicket(48);
    // ESC a 1 = center align
    expect(indexOfSeq(bytes, [ESC, 0x61, 0x01])).toBeGreaterThanOrEqual(0);
    // ESC E 1 = bold on, ESC E 0 = bold off
    expect(indexOfSeq(bytes, [ESC, 0x45, 0x01])).toBeGreaterThanOrEqual(0);
    expect(indexOfSeq(bytes, [ESC, 0x45, 0x00])).toBeGreaterThanOrEqual(0);
  });

  it('ends with the GS V full-cut opcode (0x1D 0x56 0x00)', () => {
    const bytes = testTicket(48);
    const tail = bytes.slice(bytes.length - 3);
    expect(Array.from(tail)).toEqual([GS, 0x56, 0x00]);
  });

  it('renders a separator rule of the requested column width', () => {
    const text = decodeAscii(testTicket(32));
    expect(text).toContain('-'.repeat(32));
    expect(text).toContain('Ancho: 32 columnas');
  });

  it('contains line-feed (0x0A) bytes between sections', () => {
    const bytes = testTicket(48);
    expect(Array.from(bytes)).toContain(LF);
  });
});
