import { describe, it, expect } from 'vitest';
import { BRAND, BRAND_TAGLINE, DEFAULT_TITLE, brandTitle, ROUTE_TITLES } from '../brand';

describe('brand constants', () => {
  it('BRAND is "Subito"', () => {
    expect(BRAND).toBe('Subito');
  });

  it('DEFAULT_TITLE composes brand and tagline', () => {
    expect(DEFAULT_TITLE).toBe('Subito — Gestión de pedidos');
    expect(DEFAULT_TITLE).toBe(`${BRAND} — ${BRAND_TAGLINE}`);
  });

  it('ROUTE_TITLES has the expected keys and values', () => {
    expect(ROUTE_TITLES).toEqual({
      MESAS: 'Mesas',
      TOMAR_PEDIDO: 'Tomar pedido',
      CAJA: 'Caja',
      CUENTA: 'Cuenta',
      COBRO: 'Cobro',
      PRODUCTOS: 'Productos',
      CATEGORIAS: 'Categorías',
      MENUS: 'Menús',
      AREAS: 'Áreas',
      USUARIOS: 'Usuarios',
      PAGOS: 'Pagos',
      CONFIGURACION: 'Configuración',
    });
  });
});

describe('brandTitle', () => {
  it('returns "<title> · Subito" when given a title', () => {
    expect(brandTitle('Mesas')).toBe('Mesas · Subito');
    expect(brandTitle(ROUTE_TITLES.PAGOS)).toBe('Pagos · Subito');
  });

  it('returns DEFAULT_TITLE when called with undefined', () => {
    expect(brandTitle(undefined)).toBe(DEFAULT_TITLE);
    expect(brandTitle()).toBe(DEFAULT_TITLE);
  });

  it('returns DEFAULT_TITLE for an empty string title', () => {
    expect(brandTitle('')).toBe(DEFAULT_TITLE);
  });
});
