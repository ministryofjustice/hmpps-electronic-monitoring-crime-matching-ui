import { v4 as uuidv4 } from 'uuid'
import Map from 'ol/Map'
import BaseLayer from 'ol/layer/Base'
import { PageElement } from '../page'
import MapSidebarComponent from './mapSidebarComponent'

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

  get mapComponent(): PageElement {
    return this.element.get('moj-map')
  }

  get mapInstance(): Cypress.Chainable<Map> {
    return cy.get('moj-map').then($el => {
      const el = $el[0] as HTMLElement & { olMapInstance?: Map }

      return new Cypress.Promise<Map>(resolve => {
        const handler = () => {
          if (el.olMapInstance) {
            // app:map:layers:ready may have fired before we added the event listener
            resolve(el.olMapInstance)
          } else {
            el.addEventListener(
              'map:render:complete',
              (e: CustomEvent<{ mapInstance: Map }>) => {
                resolve(e.detail.mapInstance)
              },
              { once: true },
            )
          }
        }

        el.addEventListener('app:map:layers:ready', handler, { once: true })
      })
    })
  }

  // HELPERS

  shouldExist(): void {
    this.element.should('exist')
    this.mapComponent.should('exist')
    this.sidebar.shouldExist()
  }

  shouldHaveAlert(variant: string, title: string): void {
    this.element.find(`[aria-label="${variant}: ${title}"]`).should('exist')
  }

  shouldNotHaveAlerts() {
    return this.element.find('.moj-alert').should('have.length', 0)
  }

  shouldShowOverlay(): void {
    cy.get('moj-map').shadow().find('.ol-overlay-container').should('be.visible')
  }

  shouldNotShowOverlay(): void {
    cy.get('moj-map').shadow().find('.ol-overlay-container').should('not.be.visible')
  }

  shouldHaveMapLayer(layer: BaseLayer | undefined, name: string): void {
    expect(layer, `${name} layer should exist`).to.not.equal(undefined)
  }

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

  // Recursively searches through all OL layers/groups and sub-layers to find a layer with the given title
  findLayerByTitle(map: Map, title: string): BaseLayer | undefined {
    const walkLayers = (layer: BaseLayer): BaseLayer | undefined => {
      if (layer.get('title') === title) return layer

      const children =
        (layer as unknown as { getLayers?: () => { getArray?: () => BaseLayer[] } }).getLayers?.().getArray?.() ?? []

      for (const child of children) {
        const matchedResult = walkLayers(child)
        if (matchedResult) return matchedResult
      }
      return undefined
    }

    return walkLayers(map.getLayerGroup())
  }
}
