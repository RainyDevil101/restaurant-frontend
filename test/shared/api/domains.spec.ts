import { describe, it, expect, vi, beforeEach } from 'vitest';

const { get, post, postKeepingSession, patch, del } = vi.hoisted(() => ({
  get: vi.fn<typeof import('@/shared/api/client').api.get>(() =>
    Promise.resolve(undefined as never),
  ),
  post: vi.fn<typeof import('@/shared/api/client').api.post>(() =>
    Promise.resolve(undefined as never),
  ),
  postKeepingSession: vi.fn<typeof import('@/shared/api/client').api.postKeepingSession>(() =>
    Promise.resolve(undefined as never),
  ),
  patch: vi.fn<typeof import('@/shared/api/client').api.patch>(() =>
    Promise.resolve(undefined as never),
  ),
  del: vi.fn<typeof import('@/shared/api/client').api.delete>(() =>
    Promise.resolve(undefined as never),
  ),
}));

vi.mock('@/shared/api/client', () => ({
  api: {
    get,
    post,
    postKeepingSession,
    patch,
    put: vi.fn<typeof import('@/shared/api/client').api.put>(),
    delete: del,
  },
}));

import * as catalog from '@/shared/api/catalog';
import * as venue from '@/shared/api/venue';
import * as orders from '@/shared/api/orders';
import * as billing from '@/shared/api/billing';
import * as users from '@/shared/api/users';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('catalog api', () => {
  it('getCatalogStamp GETs /catalog/stamp', () => {
    catalog.getCatalogStamp();
    expect(get).toHaveBeenCalledWith('/catalog/stamp');
  });

  it('listProducts GETs /products', () => {
    catalog.listProducts();
    expect(get).toHaveBeenCalledWith('/products');
  });

  it('createProduct POSTs /products with input', () => {
    const input = { name: 'Taco' } as never;
    catalog.createProduct(input);
    expect(post).toHaveBeenCalledWith('/products', input);
  });

  it('updateProduct PATCHes /products/:id with input', () => {
    catalog.updateProduct('p1', { name: 'X' });
    expect(patch).toHaveBeenCalledWith('/products/p1', { name: 'X' });
  });

  it('deleteProduct DELETEs /products/:id', () => {
    catalog.deleteProduct('p1');
    expect(del).toHaveBeenCalledWith('/products/p1');
  });

  it('toggleProductAvailability PATCHes /products/:id/availability', () => {
    catalog.toggleProductAvailability('p1');
    expect(patch).toHaveBeenCalledWith('/products/p1/availability');
  });

  it('listCategories GETs /categories', () => {
    catalog.listCategories();
    expect(get).toHaveBeenCalledWith('/categories');
  });

  it('createCategory POSTs /categories with input', () => {
    const input = { name: 'Bebidas' } as never;
    catalog.createCategory(input);
    expect(post).toHaveBeenCalledWith('/categories', input);
  });

  it('updateCategory PATCHes /categories/:id with input', () => {
    catalog.updateCategory('c1', { name: 'X' });
    expect(patch).toHaveBeenCalledWith('/categories/c1', { name: 'X' });
  });

  it('deleteCategory DELETEs /categories/:id', () => {
    catalog.deleteCategory('c1');
    expect(del).toHaveBeenCalledWith('/categories/c1');
  });

  it('listMenus GETs /menus', () => {
    catalog.listMenus();
    expect(get).toHaveBeenCalledWith('/menus');
  });

  it('createMenu POSTs /menus with input', () => {
    const input = { name: 'Combo' } as never;
    catalog.createMenu(input);
    expect(post).toHaveBeenCalledWith('/menus', input);
  });

  it('updateMenu PATCHes /menus/:id with input', () => {
    catalog.updateMenu('m1', { name: 'X' });
    expect(patch).toHaveBeenCalledWith('/menus/m1', { name: 'X' });
  });

  it('deleteMenu DELETEs /menus/:id', () => {
    catalog.deleteMenu('m1');
    expect(del).toHaveBeenCalledWith('/menus/m1');
  });

  it('toggleMenuActive PATCHes /menus/:id/active', () => {
    catalog.toggleMenuActive('m1');
    expect(patch).toHaveBeenCalledWith('/menus/m1/active');
  });
});

describe('venue api', () => {
  it('listAreas GETs /areas', () => {
    venue.listAreas();
    expect(get).toHaveBeenCalledWith('/areas');
  });

  it('createArea POSTs /areas with input', () => {
    const input = { name: 'Cocina' } as never;
    venue.createArea(input);
    expect(post).toHaveBeenCalledWith('/areas', input);
  });

  it('updateArea PATCHes /areas/:id with input', () => {
    venue.updateArea('a1', { name: 'X' });
    expect(patch).toHaveBeenCalledWith('/areas/a1', { name: 'X' });
  });

  it('deleteArea DELETEs /areas/:id', () => {
    venue.deleteArea('a1');
    expect(del).toHaveBeenCalledWith('/areas/a1');
  });

  it('listTables GETs /tables', () => {
    venue.listTables();
    expect(get).toHaveBeenCalledWith('/tables');
  });

  it('createTable POSTs /tables with input', () => {
    const input = { label: 'Mesa 1' } as never;
    venue.createTable(input);
    expect(post).toHaveBeenCalledWith('/tables', input);
  });

  it('updateTable PATCHes /tables/:id with input', () => {
    venue.updateTable('t1', { capacity: 4 } as never);
    expect(patch).toHaveBeenCalledWith('/tables/t1', { capacity: 4 });
  });

  it('deleteTable DELETEs /tables/:id', () => {
    venue.deleteTable('t1');
    expect(del).toHaveBeenCalledWith('/tables/t1');
  });

  it('updateTableStatus PATCHes /tables/:id/status with { status }', () => {
    venue.updateTableStatus('t1', 'ocupada' as never);
    expect(patch).toHaveBeenCalledWith('/tables/t1/status', { status: 'ocupada' });
  });
});

describe('orders api', () => {
  it('listOrders GETs /orders without query when no tableId', () => {
    orders.listOrders();
    expect(get).toHaveBeenCalledWith('/orders');
  });

  it('listOrders GETs /orders with encoded tableId query', () => {
    orders.listOrders('t 1');
    expect(get).toHaveBeenCalledWith('/orders?tableId=t%201');
  });

  it('listOrdersByTable GETs /orders/table/:id', () => {
    orders.listOrdersByTable('t1');
    expect(get).toHaveBeenCalledWith('/orders/table/t1');
  });

  it('createOrder POSTs /orders with input', () => {
    const input = { tableId: 't1', items: [] };
    orders.createOrder(input);
    expect(post).toHaveBeenCalledWith('/orders', input);
  });

  it('updateOrderStatus PATCHes /orders/:id/status with { status }', () => {
    orders.updateOrderStatus('o1', 'preparando' as never);
    expect(patch).toHaveBeenCalledWith('/orders/o1/status', { status: 'preparando' });
  });

  it('cancelOrder uses postKeepingSession on /orders/:id/cancel with body', () => {
    const body = { reason: 'r', adminEmail: 'a@b.c', adminCredential: '1234' };
    orders.cancelOrder('o1', body);
    expect(postKeepingSession).toHaveBeenCalledWith('/orders/o1/cancel', body);
  });

  it('getComandasByTable GETs encoded path with default width', () => {
    orders.getComandasByTable('t 1');
    expect(get).toHaveBeenCalledWith('/orders/table/t%201/comandas?width=80');
  });
});

describe('billing api', () => {
  it('getBill GETs /billing/table/:id', () => {
    billing.getBill('t1');
    expect(get).toHaveBeenCalledWith('/billing/table/t1');
  });

  it('consolidateBill POSTs /billing/table/:id/consolidate', () => {
    billing.consolidateBill('t1');
    expect(post).toHaveBeenCalledWith('/billing/table/t1/consolidate');
  });

  it('payBill POSTs /billing/table/:id/payment with input', () => {
    const input = { method: 'efectivo' as never, amount: 100 };
    billing.payBill('t1', input);
    expect(post).toHaveBeenCalledWith('/billing/table/t1/payment', input);
  });

  it('listPayments GETs /billing/payments', () => {
    billing.listPayments();
    expect(get).toHaveBeenCalledWith('/billing/payments');
  });

  it('getPrecheck GETs encoded path with default width', () => {
    billing.getPrecheck('t 1');
    expect(get).toHaveBeenCalledWith('/billing/table/t%201/precheck?width=80');
  });
});

describe('users api', () => {
  it('listUsers GETs /users', () => {
    users.listUsers();
    expect(get).toHaveBeenCalledWith('/users');
  });

  it('createUser POSTs /users with input', () => {
    const input = { name: 'Ana', email: 'a@b.c', role: 'M' as never, credential: '1234' };
    users.createUser(input);
    expect(post).toHaveBeenCalledWith('/users', input);
  });

  it('updateUser PATCHes /users/:id with input', () => {
    users.updateUser('u1', { name: 'X' });
    expect(patch).toHaveBeenCalledWith('/users/u1', { name: 'X' });
  });

  it('deactivateUser DELETEs /users/:id', () => {
    users.deactivateUser('u1');
    expect(del).toHaveBeenCalledWith('/users/u1');
  });
});
