import { StubGetDeviceActivationOptions } from './mockApis/locationData/deviceActivation'
import { StubGetDeviceActivationPositionsOptions } from './mockApis/locationData/deviceActivationPositions'
import { StubGetPersonsOptions } from './mockApis/locationData/persons'
import { StubGetPersonOptions } from './mockApis/locationData/person'
import { StubGetIngestionAttemptOptions } from './mockApis/crimeMatching/ingestionAttempt'
import { StubGetIngestionAttemptsOptions } from './mockApis/crimeMatching/ingestionAttempts'
import { StubGetCrimeMatchingResultsOptions } from './mockApis/crimeMatching/crimeMatchingResults'
import { StubGetCrimeVersionsOptions } from './mockApis/crimeMatching/crimeVersions'

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
       * Custom command to list downloads
       */
      getDownloads: (path: string) => Chainable<Array<string>>

      /**
       * Custom command to delete the downloads directory
       */
      resetDownloads: (path: string) => void

      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode: boolean }): Chainable<AUTWindow>

      /**
       * Stub a wiremock response for the crimeMatchingApi POST /crime-batches-query
       */
      stubGetCrimeMatchingResults(options?: StubGetCrimeMatchingResultsOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi POST /crime-batches-query
       */
      stubGetCrimeVersions(options?: StubGetCrimeVersionsOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /device-activations/{deviceActivationId}
       */
      stubGetDeviceActivation(options?: StubGetDeviceActivationOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /device-activations/{deviceActivationId}/positions
       */
      stubGetDeviceActivationPositions(options?: StubGetDeviceActivationPositionsOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /ingestion-attempts/{ingestionAttemptId}
       */
      stubGetIngestionAttempt(options?: StubGetIngestionAttemptOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /ingestion-attempts
       */
      stubGetIngestionAttempts(options?: StubGetIngestionAttemptsOptions): Chainable<void>

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
