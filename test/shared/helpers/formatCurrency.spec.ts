import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/shared/helpers/formatCurrency';

describe('formatCurrency', () => {
  it('includes a currency symbol', () => {
    expect(formatCurrency(100)).toContain('$');
  });

  it('formats thousands with a dot separator in es-CL locale', () => {
    expect(formatCurrency(1000)).toContain('1.000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('formats large amounts with multiple thousand groups', () => {
    expect(formatCurrency(1234567)).toContain('1.234.567');
  });

  it('produces no decimal places for CLP', () => {
    expect(formatCurrency(99)).not.toMatch(/[.,]\d{2}/);
  });
});
