/// <reference types="cypress" />

// Exact strings sourced from src/modules/auth/constants.ts
const LABELS = {
  credentialLabel: 'Contraseña o PIN',
  errorFieldsRequired: 'Ingresa tu correo y credencial.',
  errorEmailInvalid: 'Ingresa un correo electrónico válido.',
  errorInvalidCredentials: 'Credenciales incorrectas.',
  errorNetwork: 'No se pudo conectar con el servidor.',
} as const

// Stub responses for downstream API calls that fire after a successful login,
// so post-login redirects don't produce 404/network errors in the tests.
function stubServiceApi() {
  cy.intercept('GET', '**/tables', { statusCode: 200, body: [] }).as('stubTables')
}

function stubCheckoutApi() {
  cy.intercept('GET', '**/tables', { statusCode: 200, body: [] }).as('stubTables')
  cy.intercept('GET', '**/orders**', { statusCode: 200, body: [] }).as('stubOrders')
}

function stubAdminApi() {
  cy.intercept('GET', '**/products**', { statusCode: 200, body: [] }).as('stubProducts')
  cy.intercept('GET', '**/categories**', { statusCode: 200, body: [] }).as('stubCategories')
  cy.intercept('GET', '**/areas**', { statusCode: 200, body: [] }).as('stubAreas')
  cy.intercept('GET', '**/menus**', { statusCode: 200, body: [] }).as('stubMenus')
  cy.intercept('GET', '**/tables**', { statusCode: 200, body: [] }).as('stubTables')
  cy.intercept('GET', '**/users**', { statusCode: 200, body: [] }).as('stubUsers')
}

// Shared successful login stub payloads
const LOGIN_RESPONSE = {
  M: {
    accessToken: 'test-jwt-m',
    tokenType: 'Bearer',
    user: { id: 'u1', name: 'Ana', email: 'ana@subito.mx', role: 'M', active: true, isOwner: false },
  },
  C: {
    accessToken: 'test-jwt-c',
    tokenType: 'Bearer',
    user: { id: 'u2', name: 'Carlos', email: 'carlos@subito.mx', role: 'C', active: true, isOwner: false },
  },
  A: {
    accessToken: 'test-jwt-a',
    tokenType: 'Bearer',
    user: { id: 'u3', name: 'Admin', email: 'admin@subito.mx', role: 'A', active: true, isOwner: true },
  },
} as const

describe('Login page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  // ─── Guard / Routing ────────────────────────────────────────────────────────

  it('redirects unauthenticated visit to / → /login', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('already-authenticated mesero (M) visiting /login is redirected to /service', () => {
    stubServiceApi()
    cy.visitAs('M', '/login')
    cy.url().should('include', '/service')
    cy.url().should('not.include', '/login')
  })

  it('already-authenticated admin (A) visiting /login is redirected to /admin', () => {
    stubAdminApi()
    cy.visitAs('A', '/login')
    cy.url().should('include', '/admin')
    cy.url().should('not.include', '/login')
  })

  // ─── UI Structure ───────────────────────────────────────────────────────────

  it('shows branding — h1 "Subito" and tagline "Gestión de pedidos"', () => {
    cy.visit('/login')
    cy.get('h1').should('have.text', 'Subito')
    cy.contains('p', 'Gestión de pedidos').should('be.visible')
  })

  it('shows email field, credential field, and submit button', () => {
    cy.visit('/login')
    cy.get('#email').should('be.visible')
    cy.get('#credential').should('be.visible')
    cy.contains('button[type="submit"]', 'Ingresar').should('be.visible')
  })

  it('credential label reads "Contraseña o PIN"', () => {
    cy.visit('/login')
    cy.contains('label', LABELS.credentialLabel).should('be.visible')
  })

  it('credential input starts as type="password"', () => {
    cy.visit('/login')
    cy.get('#credential').should('have.attr', 'type', 'password')
  })

  it('eye-toggle button switches credential to type="text" then back to "password"', () => {
    cy.visit('/login')
    cy.get('#credential').should('have.attr', 'type', 'password')

    cy.get('button[type="button"]').click()
    cy.get('#credential').should('have.attr', 'type', 'text')

    cy.get('button[type="button"]').click()
    cy.get('#credential').should('have.attr', 'type', 'password')
  })

  // ─── Client-side Validation (no network request should fire) ────────────────

  it('submitting with both fields empty shows required-fields error (no API call)', () => {
    cy.intercept('POST', '**/auth/login').as('loginSpy')

    cy.visit('/login')
    cy.contains('button[type="submit"]', 'Ingresar').click()

    cy.get('[role="alert"]').should('have.text', LABELS.errorFieldsRequired)
    // Ensure no network request was made
    cy.get('@loginSpy.all').should('have.length', 0)
  })

  it('submitting with only email filled shows required-fields error (no API call)', () => {
    cy.intercept('POST', '**/auth/login').as('loginSpy')

    cy.visit('/login')
    cy.get('#email').type('test@example.com')
    cy.contains('button[type="submit"]', 'Ingresar').click()

    cy.get('[role="alert"]').should('have.text', LABELS.errorFieldsRequired)
    cy.get('@loginSpy.all').should('have.length', 0)
  })

  it('submitting with an invalid email format shows invalid-email error (no API call)', () => {
    cy.intercept('POST', '**/auth/login').as('loginSpy')

    cy.visit('/login')
    cy.get('#email').type('not-an-email')
    cy.get('#credential').type('somepassword')
    cy.contains('button[type="submit"]', 'Ingresar').click()

    cy.get('[role="alert"]').should('have.text', LABELS.errorEmailInvalid)
    cy.get('@loginSpy.all').should('have.length', 0)
  })

  // ─── Loading State ──────────────────────────────────────────────────────────

  it('while API request is in-flight the submit button is disabled and shows "Ingresando…"', () => {
    cy.intercept('POST', '**/auth/login', (req) => {
      req.reply({
        delay: 1500,
        statusCode: 401,
        body: { statusCode: 401, error: 'Unauthorized', message: 'Credenciales incorrectas.' },
      })
    }).as('loginDelayed')

    cy.visit('/login')
    cy.get('#email').type('test@subito.mx')
    cy.get('#credential').type('wrongpass')
    cy.contains('button[type="submit"]', 'Ingresar').click()

    // While in-flight the button must be disabled and show the loading label
    cy.contains('button[type="submit"]', 'Ingresando…').should('be.disabled')

    cy.wait('@loginDelayed')
    // After response the button returns to normal
    cy.contains('button[type="submit"]', 'Ingresar').should('not.be.disabled')
  })

  // ─── API Error Handling ─────────────────────────────────────────────────────

  it('401 response shows "Credenciales incorrectas."', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { statusCode: 401, error: 'Unauthorized', message: 'Credenciales incorrectas.' },
    }).as('loginUnauthorized')

    cy.visit('/login')
    cy.get('#email').type('bad@user.com')
    cy.get('#credential').type('wrongpass')
    cy.contains('button[type="submit"]', 'Ingresar').click()
    cy.wait('@loginUnauthorized')

    cy.get('[role="alert"]').should('have.text', LABELS.errorInvalidCredentials)
  })

  it('500 response shows the server error message', () => {
    const serverMessage = 'Internal server error'
    cy.intercept('POST', '**/auth/login', {
      statusCode: 500,
      body: { statusCode: 500, error: 'Internal Server Error', message: serverMessage },
    }).as('loginServerError')

    cy.visit('/login')
    cy.get('#email').type('test@subito.mx')
    cy.get('#credential').type('somepass')
    cy.contains('button[type="submit"]', 'Ingresar').click()
    cy.wait('@loginServerError')

    cy.get('[role="alert"]').should('have.text', serverMessage)
  })

  it('network/CORS failure shows a network error message', () => {
    cy.intercept('POST', '**/auth/login', { forceNetworkError: true }).as('loginNetworkError')

    cy.visit('/login')
    cy.get('#email').type('test@subito.mx')
    cy.get('#credential').type('somepass')
    cy.contains('button[type="submit"]', 'Ingresar').click()
    cy.wait('@loginNetworkError')

    cy.get('[role="alert"]').should('have.text', LABELS.errorNetwork)
  })

  // ─── Successful Login Redirects ─────────────────────────────────────────────

  it('successful login as mesero (M) redirects to /service', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 201,
      body: LOGIN_RESPONSE.M,
    }).as('loginM')
    stubServiceApi()

    cy.visit('/login')
    cy.get('#email').type('ana@subito.mx')
    cy.get('#credential').type('1234')
    cy.contains('button[type="submit"]', 'Ingresar').click()
    cy.wait('@loginM')

    cy.url().should('include', '/service')
  })

  it('successful login as cajero (C) redirects to /checkout', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 201,
      body: LOGIN_RESPONSE.C,
    }).as('loginC')
    stubCheckoutApi()

    cy.visit('/login')
    cy.get('#email').type('carlos@subito.mx')
    cy.get('#credential').type('1234')
    cy.contains('button[type="submit"]', 'Ingresar').click()
    cy.wait('@loginC')

    cy.url().should('include', '/checkout')
  })

  it('successful login as admin (A) redirects to /admin', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 201,
      body: LOGIN_RESPONSE.A,
    }).as('loginA')
    stubAdminApi()

    cy.visit('/login')
    cy.get('#email').type('admin@subito.mx')
    cy.get('#credential').type('admin')
    cy.contains('button[type="submit"]', 'Ingresar').click()
    cy.wait('@loginA')

    cy.url().should('include', '/admin')
  })
})
