import { describe, it, expect } from 'vitest';
import { categoryColor, categoryName } from '@/modules/service/helpers/categoryColor';
import { colors } from '@/shared/styles/colors';
import type { Category } from '@/shared/types';

describe('categoryColor', () => {
  it('returns a color from the configured palette', () => {
    expect(colors.category.palette).toContain(categoryColor('some-id'));
  });

  it('is deterministic — same id always returns the same color', () => {
    expect(categoryColor('abc-123')).toBe(categoryColor('abc-123'));
  });

  it('returns a hex color string', () => {
    expect(categoryColor('xyz')).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('categoryName', () => {
  const categories: Category[] = [
    { id: 'c1', name: 'Comida' },
    { id: 'c2', name: 'Bebida' },
  ];

  it('returns the category name for a known id', () => {
    expect(categoryName('c1', categories)).toBe('Comida');
  });

  it('returns empty string for an unknown id', () => {
    expect(categoryName('unknown', categories)).toBe('');
  });

  it('returns empty string when the list is empty', () => {
    expect(categoryName('c1', [])).toBe('');
  });
});
