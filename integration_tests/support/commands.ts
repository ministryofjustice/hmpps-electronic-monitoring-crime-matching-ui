Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('stubCrimeBatchSearch', options => {
  cy.task('stubCrimeBatchSearch', options)
})

Cypress.Commands.add('stubSubjectSearch', options => {
  cy.task('stubSubjectSearch', options)
})
