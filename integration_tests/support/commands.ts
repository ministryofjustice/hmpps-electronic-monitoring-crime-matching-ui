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

Cypress.Commands.add('stubCreateSubjectsQuery', options => {
  cy.task('stubCreateSubjectsQuery', options)
})

Cypress.Commands.add('stubGetSubjectsQuery', options => {
  cy.task('stubGetSubjectsQuery', options)
})

Cypress.Commands.add('stubCreateSubjectLocationsQuery', options => {
  cy.task('stubCreateSubjectLocationsQuery', options)
})

Cypress.Commands.add('stubGetSubject', options => {
  cy.task('stubGetSubject', options)
})

Cypress.Commands.add('stubMapToken', options => {
  cy.task('stubMapToken', options)
})

Cypress.Commands.add('stubMapTiles', options => {
  cy.task('stubMapTiles', options)
})
