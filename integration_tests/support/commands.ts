Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('getDownloads', path => {
  return cy.task('getDownloads', path)
})

Cypress.Commands.add('resetDownloads', path => {
  cy.task('resetDownloads', path)
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

Cypress.Commands.add('stubMapMiddleware', () => {
  cy.intercept('GET', '/os-map/vector/style', {
    statusCode: 200,
    body: {
      version: 8,
      sources: {
        'os-source': { type: 'vector', url: '/os-map/vector/source' },
      },
      layers: [
        { id: 'background', type: 'background', paint: {} },
        { id: 'stub-layer', type: 'fill', source: 'os-source', paint: {} },
      ],
    },
  }).as('stubMapStyle')

  cy.intercept('GET', '/os-map/vector/source', {
    statusCode: 200,
    body: {
      type: 'vector',
      tiles: ['/os-map/vector/tiles/{z}/{x}/{y}.pbf'],
    },
  }).as('stubMapSource')

  cy.intercept('GET', /\/os-map\/vector\/tiles\/.*\.pbf/, {
    statusCode: 200,
    body: '',
  }).as('stubMapTiles')
})
