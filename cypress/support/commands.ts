/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      visitAs(role: 'M' | 'C' | 'A', path: string): Chainable<void>
    }
  }
}

const SESSION_USERS: Record<'M' | 'C' | 'A', object> = {
  M: { id: 'u1', name: 'Ana', email: 'ana@subito.mx', role: 'M', active: true, isOwner: false },
  C: { id: 'u2', name: 'Carlos', email: 'carlos@subito.mx', role: 'C', active: true, isOwner: false },
  A: { id: 'u3', name: 'Admin', email: 'admin@subito.mx', role: 'A', active: true, isOwner: true },
}

Cypress.Commands.add('visitAs', (role, path) => {
  const user = SESSION_USERS[role]
  const session = JSON.stringify({ token: 'cypress-test-token', user })
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('subito.session', session)
    },
  })
})

export {}
