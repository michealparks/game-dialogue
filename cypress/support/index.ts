// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to test the visibility of text
       * @example cy.message(/greeting/i)
       */
       text(value: string | RegExp): Chainable<Element>

       /**
        * Custom command to enter text into an input followed by an enter keypress
        * @example cy.input('yes')
        */
       input(value: string): Chainable<Element>
    }
  }
}

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
