import { StubCreateCrimeBatchQueryOptions, StubGetCrimeBatchesOptions } from './mockApis/crimeMatching/crimeBatches'
import { StubCreateSubjectQueryOptions, StubGetSubjectsQueryOptions } from './mockApis/crimeMatching/subjects'

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
       * Stub a wiremock response for the crimeMatchingApi POST /subjects-query
       */
      stubCreateSubjectsQuery(options?: StubCreateSubjectQueryOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /subjects-query
       */
      stubGetSubjectsQuery(options?: StubGetSubjectsQueryOptions): Chainable<void>
    }
  }
}
