Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('mapPostRenderComplete', (map, callback) => {
  return cy.wrap(
    new Promise(resolve => {
      map.once('postrender', () => {
        const result = callback()
        resolve(result)
      })

      /**
       * Manually trigger a re-render to ensure the 'rendercomplete' event fires,
       * which in turn dispatches our custom 'map:render:complete' event.
       *
       * Without this, the map may remain in a stable state and not re-render naturally,
       * causing Cypress tests waiting on the event to hang indefinitely.
       */
      map.render()
    }),
    { log: false },
  )
})

Cypress.Commands.add('stubCreateCrimeBatchesQuery', options => {
  cy.task('stubCreateCrimeBatchesQuery', options)
})

Cypress.Commands.add('stubGetCrimeBatchesQuery', options => {
  cy.task('stubGetCrimeBatchesQuery', options)
})

Cypress.Commands.add('stubGetDeviceActivation', options => {
  cy.task('stubGetDeviceActivation', options)
})

Cypress.Commands.add('stubGetDeviceActivationPositions', options => {
  cy.task('stubGetDeviceActivationPositions', options)
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
