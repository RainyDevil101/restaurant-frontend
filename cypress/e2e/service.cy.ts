const TABLES = [
  { id: 't1', name: 'Mesa 1', capacity: 4, status: 'libre' },
  { id: 't2', name: 'Mesa 2', capacity: 2, status: 'ocupada' },
]

const PRODUCTS = [
  { id: 'p1', name: 'Tacos', price: 90, categoryId: 'c1', available: true },
  { id: 'p2', name: 'Agua', price: 30, categoryId: 'c2', available: true },
]

const CATEGORIES = [
  { id: 'c1', name: 'Comida' },
  { id: 'c2', name: 'Bebida' },
]

describe('Service — table selection', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/tables', { statusCode: 200, body: TABLES }).as('tables')
  })

  it('shows all tables in the grid', () => {
    cy.visitAs('M', '/service')
    cy.wait('@tables')
    cy.contains('Mesa 1').should('be.visible')
    cy.contains('Mesa 2').should('be.visible')
  })

  it('navigates to the order view when a table card is clicked', () => {
    cy.intercept('GET', '**/products', { statusCode: 200, body: PRODUCTS })
    cy.intercept('GET', '**/categories', { statusCode: 200, body: CATEGORIES })
    cy.intercept('GET', '**/menus', { statusCode: 200, body: [] })
    cy.intercept('GET', '**/orders/table/**', { statusCode: 200, body: [] })

    cy.visitAs('M', '/service')
    cy.wait('@tables')
    cy.contains('Mesa 1').click()

    cy.url().should('include', '/service/table/t1')
  })
})

describe('Service — order view', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/tables', { statusCode: 200, body: TABLES })
    cy.intercept('GET', '**/products', { statusCode: 200, body: PRODUCTS }).as('products')
    cy.intercept('GET', '**/categories', { statusCode: 200, body: CATEGORIES })
    cy.intercept('GET', '**/menus', { statusCode: 200, body: [] })
    cy.intercept('GET', '**/orders/table/**', { statusCode: 200, body: [] })
  })

  it('displays catalog products', () => {
    cy.visitAs('M', '/service/table/t1')
    cy.wait('@products')
    cy.contains('Tacos').should('be.visible')
    cy.contains('Agua').should('be.visible')
  })

  it('filters products by search term', () => {
    cy.visitAs('M', '/service/table/t1')
    cy.wait('@products')
    cy.get('.search-input').type('Taco')
    cy.contains('Tacos').should('be.visible')
    cy.contains('Agua').should('not.exist')
  })

  it('clears the search filter', () => {
    cy.visitAs('M', '/service/table/t1')
    cy.wait('@products')
    cy.get('.search-input').type('Taco')
    cy.contains('Agua').should('not.exist')
    cy.get('.search-input').clear()
    cy.contains('Agua').should('be.visible')
  })
})
