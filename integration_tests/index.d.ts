import { StubCreateCrimeBatchQueryOptions, StubGetCrimeBatchesOptions } from './mockApis/crimeMatching/crimeBatches'
import { StubGetDeviceActivationOptions } from './mockApis/locationData/deviceActivation'
import { StubGetDeviceActivationPositionsOptions } from './mockApis/locationData/deviceActivationPositions'
import { StubGetPersonsOptions } from './mockApis/locationData/persons'
import { StubGetPersonOptions } from './mockApis/locationData/person'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to get a form field by label text. Options are passed to the command to get the actual field element
       * @example cy.getByLabel('My text field')
       */
      getByLabel: (
        label: string | RegExp,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
      ) => Chainable<JQuery>

      /**
       * Custom command to get a form fieldset by legend text. Options are passed to the command to get the actual fieldset element
       * @example cy.getByLegend('Important fields')
       */
      getByLegend: (
        legend: string | RegExp,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
      ) => Chainable<JQuery>

      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode: boolean }): Chainable<AUTWindow>

      /**
       * Stub a wiremock response for the crimeMatchingApi POST /crime-batches-query
       */
      stubCreateCrimeBatchesQuery(options?: StubCreateCrimeBatchQueryOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /crime-batches-query
       */
      stubGetCrimeBatchesQuery(options?: StubGetCrimeBatchesOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /device-activations/{deviceActivationId}
       */
      stubGetDeviceActivation(options?: StubGetDeviceActivationOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /device-activations/{deviceActivationId}/positions
       */
      stubGetDeviceActivationPositions(options?: StubGetDeviceActivationPositionsOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /persons
       */
      stubGetPersons(options?: StubGetPersonsOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /persons/{personId}
       */
      stubGetPerson(options?: StubGetPersonOptions): Chainable<void>

      /**
       * Stub the /os-map/vector/style endpoint to simulate the Ordnance Survey middleware.
       */
      stubMapMiddleware(): Chainable<void>
    }
  }
}
