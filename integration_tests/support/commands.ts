Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('stubCreateCrimeBatchesQuery', options => {
  cy.task('stubCreateCrimeBatchesQuery', options)
})

Cypress.Commands.add('stubGetCrimeBatchesQuery', options => {
  cy.task('stubGetCrimeBatchesQuery', options)
})

Cypress.Commands.add('stubCreateSubjectsQuery', options => {
  cy.task('stubCreateSubjectsQuery', options)
})

Cypress.Commands.add('stubGetSubjectsQuery', options => {
  cy.task('stubGetSubjectsQuery', options)
})
