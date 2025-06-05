import { StubCrimeBatchSearchOptions } from './mockApis/crimeMatching/crimeBatches'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode: boolean }): Chainable<AUTWindow>

      /**
       * Stub a wiremock response for GET /crime-batches
       */
      stubCrimeBatchSearch(options: StubCrimeBatchSearchOptions): Chainable<void>
    }
  }
}
