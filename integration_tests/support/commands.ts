import { getSentAuditEvents } from '../mockApis/wiremock'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task<string>('getSignInUrl').then(url => cy.visit(url, options))
})

Cypress.Commands.add('expectAuditEvents', (events: object[]) => {
  return cy.wrap(getSentAuditEvents()).should(actualEvents => {
    expect(actualEvents).to.deep.include.members(events)
  })
})

Cypress.Commands.add('getDownloads', path => {
  return cy.task('getDownloads', path)
})

Cypress.Commands.add('resetDownloads', path => {
  cy.task('resetDownloads', path)
})

Cypress.Commands.add('stubCreateHubManager', options => {
  cy.task('stubCreateHubManager', options)
})

Cypress.Commands.add('stubDeleteHubManager', options => {
  cy.task('stubDeleteHubManager', options)
})

Cypress.Commands.add('stubGetCrimeMatchingResults', options => {
  cy.task('stubGetCrimeMatchingResults', options)
})

Cypress.Commands.add('stubGetCrimeVersion', options => {
  cy.task('stubGetCrimeVersion', options)
})

Cypress.Commands.add('stubGetCrimeVersions', options => {
  cy.task('stubGetCrimeVersions', options)
})

Cypress.Commands.add('stubGetDeviceActivation', options => {
  cy.task('stubGetDeviceActivation', options)
})

Cypress.Commands.add('stubGetDeviceActivationPositions', options => {
  cy.task('stubGetDeviceActivationPositions', options)
})

Cypress.Commands.add('stubGetHubManager', options => {
  cy.task('stubGetHubManager', options)
})

Cypress.Commands.add('stubGetHubManagerSignature', options => {
  cy.task('stubGetHubManagerSignature', options)
})

Cypress.Commands.add('stubGetHubManagers', options => {
  cy.task('stubGetHubManagers', options)
})

Cypress.Commands.add('stubGetIngestionAttempt', options => {
  cy.task('stubGetIngestionAttempt', options)
})

Cypress.Commands.add('stubGetIngestionAttempts', options => {
  cy.task('stubGetIngestionAttempts', options)
})

Cypress.Commands.add('stubGetPersons', options => {
  cy.task('stubGetPersons', options)
})

Cypress.Commands.add('stubGetPerson', options => {
  cy.task('stubGetPerson', options)
})

Cypress.Commands.add('stubUpdateHubManagerSignature', options => {
  cy.task('stubUpdateHubManagerSignature', options)
})

Cypress.Commands.add('stubOrdnanceSurvey', () => {
  cy.task('stubOSGetToken')
  cy.task('stubOSGetVectorStyle')
  cy.task('stubOSGetVectorSource')
  cy.task('stubOSGetTile')
})
