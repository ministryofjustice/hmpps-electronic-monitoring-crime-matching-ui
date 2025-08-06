import Map from 'ol/Map'
import { StubCreateCrimeBatchQueryOptions, StubGetCrimeBatchesOptions } from './mockApis/crimeMatching/crimeBatches'
import { StubGetPersonsOptions } from './mockApis/locationData/subjects'
import { StubCreateSubjectLocationQueryOptions } from './mockApis/locationData/subjectLocations'
import { StubGetSubjectOptions } from './mockApis/locationData/subject'
import { StubMapTokenOptions } from './mockApis/map'

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
       * Custom command to run a callback after the OpenLayers map triggers a 'postrender' event.
       * Ensures the map is fully rendered before running any logic such as pixel-to-coordinate interaction.
       * Useful when testing pointer/click behavior or other map interactions.
       * @example cy.mapPostRenderComplete(map, () => { const pixel = map.getPixelFromCoordinate(coord) })
       */
      mapPostRenderComplete<T = void>(map: Map, callback: () => T): Chainable<T>

      /**
       * Stub a wiremock response for the crimeMatchingApi POST /crime-batches-query
       */
      stubCreateCrimeBatchesQuery(options?: StubCreateCrimeBatchQueryOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /crime-batches-query
       */
      stubGetCrimeBatchesQuery(options?: StubGetCrimeBatchesOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /subjects-query
       */
      stubGetPersons(options?: StubGetPersonsOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi POST /locations-query
       */
      stubCreateSubjectLocationsQuery(options?: StubCreateSubjectLocationQueryOptions): Chainable<void>

      /**
       * Stub a wiremock response for the crimeMatchingApi GET /subject/:personId
       */
      stubGetSubject(options?: StubGetSubjectOptions): Chainable<void>

      /**
       * Stub a wiremock response for GET /map/token
       */
      stubMapToken(options?: StubMapTokenOptions): Chainable<void>

      /**
       * Stub a wiremock response for GET map tile requests
       */
      stubMapTiles(options?: Record<string, unknown>): Chainable<void>

      /**
       * Stub a wiremock response for GET /maps/vector/v1/vts
       */
      stubMapVectorStyle(options?: Record<string, unknown>): Chainable<void>

      /**
       * Stub a wiremock response for GET .pbf vector tiles
       */
      stubVectorTiles(options?: Record<string, unknown>): Chainable<void>
    }
  }
}
