const TABLES = [
  { id: 't1', name: 'Mesa 1', capacity: 4, status: 'libre' },
  { id: 't2', name: 'Mesa 2', capacity: 2, status: 'ocupada' },
]

const ACTIVE_ORDERS = [
  {
    id: 'ord-1',
    tableId: 't2',
    createdBy: 'u1',
    createdAt: '2026-06-01T00:00:00Z',
    status: 'pendiente',
    paid: false,
    total: 120,
    items: [
      { itemId: 'i1', productId: 'p1', productName: 'Tacos', quantity: 2, unitPrice: 60, subtotal: 120 },
    ],
  },
]

const DELIVERED_ORDERS = [
  {
    id: 'ord-1',
    tableId: 't2',
    createdBy: 'u1',
    createdAt: '2026-06-01T00:00:00Z',
    status: 'entregado',
    paid: false,
    total: 120,
    items: [
      { itemId: 'i1', productId: 'p1', productName: 'Tacos', quantity: 2, unitPrice: 60, subtotal: 120 },
    ],
  },
]

describe('Checkout — dashboard', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.intercept('GET', '**/tables', { statusCode: 200, body: TABLES }).as('tables')
    cy.intercept('GET', '**/orders', { statusCode: 200, body: ACTIVE_ORDERS }).as('orders')
  })

  it('shows tables that have active orders', () => {
    cy.visitAs('C', '/checkout')
    cy.wait('@tables')
    cy.wait('@orders')
    cy.contains('Mesa 2').should('be.visible')
  })

  it('does not show tables with no active orders', () => {
    cy.visitAs('C', '/checkout')
    cy.wait('@tables')
    cy.wait('@orders')
    cy.contains('Mesa 1').should('not.exist')
  })

  it('shows "Sin pedidos activos." when there are no orders', () => {
    cy.intercept('GET', '**/orders', { statusCode: 200, body: [] }).as('emptyOrders')
    cy.visitAs('C', '/checkout')
    cy.wait('@emptyOrders')
    cy.contains('Sin pedidos activos.').should('be.visible')
  })
})

describe('Checkout — billing view', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.intercept('GET', '**/tables', { statusCode: 200, body: TABLES }).as('tables')
    cy.intercept('GET', '**/orders/table/t2', { statusCode: 200, body: DELIVERED_ORDERS }).as('tableOrders')
  })

  it('shows the consolidated bill for a table', () => {
    cy.visitAs('C', '/checkout/table/t2')
    cy.wait('@tables')
    cy.wait('@tableOrders')
    cy.contains('Tacos').should('be.visible')
  })
})
