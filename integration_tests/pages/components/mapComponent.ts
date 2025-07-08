import { v4 as uuidv4 } from 'uuid'
import Map from 'ol/Map'
import BaseLayer from 'ol/layer/Base'
import { PageElement } from '../page'
import MapSidebarComponent from './mapSidebarComponent'

interface TestMapElement extends HTMLElement {
  olMapForCypress?: Map
}

export default class MapComponent {
  private elementCacheId: string = uuidv4()

  constructor() {
    cy.get('.app-map', { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get sidebar(): MapSidebarComponent {
    return new MapSidebarComponent(this.element)
  }

  get viewport(): PageElement {
    return this.element.get('.app-map__viewport')
  }

  get mapInstance(): Cypress.Chainable<Map> {
    return cy.get('.app-map').then($el => {
      const el = $el[0] as TestMapElement

      return new Cypress.Promise<Map>(resolve => {
        if (el.olMapForCypress) {
          resolve(el.olMapForCypress)
          return
        }

        const handler = (e: CustomEvent<{ mapInstance: Map }>) => {
          el.removeEventListener('olMap:ready', handler)
          resolve(e.detail.mapInstance)
        }

        el.addEventListener('olMap:ready', handler)
      })
    })
  }

  // HELPERS

  /**
   * Assert that the map and sidebar exist
   * @example page.map.shouldExist()
   */
  shouldExist(): void {
    this.element.should('exist')
    this.viewport.should('exist')
    this.sidebar.shouldExist()
  }

  /**
   * Assert that the OpenLayers overlay is visible (e.g. after a feature is clicked)
   * @example page.map.shouldShowOverlay()
   */
  shouldShowOverlay(): void {
    cy.get('.ol-overlay-container').should('be.visible')
  }

  /**
   * Assert that the OpenLayers overlay is not visible
   * @example page.map.shouldNotShowOverlay()
   */
  shouldNotShowOverlay(): void {
    cy.get('.ol-overlay-container').should('not.be.visible')
  }

  /**
   * Asserts that the given OpenLayers map layer exists.
   * @example page.map.shouldHaveMapLayer(confidenceLayer, 'Confidence');
   */
  shouldHaveMapLayer(layer: BaseLayer | undefined, name: string): void {
    expect(layer, `${name} layer should exist`).to.not.equal(undefined)
  }

  /**
   * Dispatch pointer events to simulate a user clicking on a given coordinate on the map
   * @param coordinate - map coordinate array [x, y]
   * @param map - OpenLayers map instance
   * @example page.map.triggerPointerEventsAt([0, 0], map)
   */
  triggerPointerEventsAt(coordinate: number[], map: Map): void {
    cy.window().then(win => {
      const canvas = map.getViewport().querySelector('canvas')
      const rect = canvas.getBoundingClientRect()
      const pixel = map.getPixelFromCoordinate(coordinate)
      const clientX = rect.left + pixel[0]
      const clientY = rect.top + pixel[1]

      const events = ['pointerdown', 'pointerup', 'click']
      events.forEach(type => {
        const event = new win.PointerEvent(type, {
          clientX,
          clientY,
          bubbles: true,
          cancelable: true,
          view: win,
        })
        canvas.dispatchEvent(event)
      })
    })
  }
}
