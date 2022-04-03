/// <reference types="cypress" />

describe('chat app', () => {
  beforeEach(() => {
    cy.viewport('iphone-se2')
    cy.visit('localhost:3000')
    cy.window().then(() => sessionStorage.setItem('env', 'cypress'))
  })

  const name = 'Mikey'

  it('can complete the January section', () => {
    cy.text(/please enter the month of our most recent correspondence/i)
    cy.input('Jan')
  
    cy.text(/enter your first name to continue./i)
    cy.input(name)
  
    cy.text(/connecting/i)
    cy.text(new RegExp(`Hi ${name}`, 'i'))

    cy.text(/find the names of 3 potion ingredients/i)

    cy.input('cathedral')
    cy.input('davius')
    cy.input('malachite')
    cy.input('sambucus')

    cy.text(/has left the chat/i)
  })

  it('can complete the February section', () => {
    cy.text(/please enter the month of our most recent correspondence/i)
    cy.input('Feb')

    cy.text(/enter your first name to continue./i)
    cy.input(name)

    cy.text(/connecting/i)
    cy.text(new RegExp(`Hi ${name}`, 'i'))
    cy.input('Yes')
  
    cy.text(/let me know the names of the 3 potion ingredients/i)
    cy.input('eryx')
    cy.input('vantia')
    cy.input('agricosa')

    cy.text(/have you used the map/i)
    cy.input('yes')

    cy.text(/are you ready to help me navigate/i)
    cy.input('yes')

    cy.text(/enter the number of units and either e or s for the direction/i)
    cy.input('7 south')

    cy.text(/arrived at a four-way intersection/i)
    cy.input('13 east')

    cy.text(/i can go north, south, or keep going east/i)
    cy.input('10 east')

    cy.text(/gone as far east as i can go now, and i can either turn north or south/i)
    cy.input('4 north')

    cy.text(/has left the chat/i)
  })

  it('can complete the March section', () => {
    cy.text(/please enter the month of our most recent correspondence/i)
    cy.input('March')

    cy.text(/enter your first name to continue./i)
    cy.input(name)

    cy.text(/connecting/i)
    cy.text(new RegExp(`hi ${name}`, 'i'))
    cy.input('Yes')

    cy.text(/enter them one at a time/i)
    cy.input('14 hours')
    cy.input('55 north')
    cy.input('5 west')

    cy.text(/consider your answer carefully/i)
    cy.input('new')

    cy.text(/has left the chat/i)
  })
})
