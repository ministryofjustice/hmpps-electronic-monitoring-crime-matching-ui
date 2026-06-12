import { v4 as uuidv4 } from 'uuid'
import Map from 'ol/Map'
import { PageElement } from '../page'
import MapSidebarComponent from './mapSidebarComponent'
import MapOverlay from './mapOverlay'

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
    return this.element.get('em-map')
  }

  get overlay(): MapOverlay {
    return new MapOverlay(this.element)
  }

  get mapInstance(): Cypress.Chainable<Map> {
    return cy.get('em-map').then($el => {
      const el = $el[0] as HTMLElement & { olMapInstance?: Map }

      return new Cypress.Promise<Map>(resolve => {
        const handler = () => {
          if (el.olMapInstance) {
            // app:map:layers:ready may have fired before we added the event listener
            resolve(el.olMapInstance)
          } else {
            el.addEventListener(
              'map:render:complete',
              e => {
                const customEvent = e as CustomEvent<{ mapInstance: Map }>
                resolve(customEvent.detail.mapInstance)
              },
              { once: true },
            )
          }
        }

        if (el.olMapInstance) {
          resolve(el.olMapInstance)
        } else {
          el.addEventListener('app:map:layers:ready', handler, { once: true })
        }
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

  waitForMapToStopAnimating(map: Map): Cypress.Chainable<void> {
    return cy.wrap(
      new Cypress.Promise<void>(resolve => {
        const wait = () => {
          if (!map.getView().getAnimating() && !map.getView().getInteracting()) {
            resolve()
            return
          }

          map.once('postrender', wait)
          map.render()
        }

        wait()
      }),
      { log: false },
    )
  }

  waitForOverlayFeatureToBeHittable(map: Map, coordinate: number[]): Cypress.Chainable<number[]> {
    return cy.wrap(
      new Cypress.Promise<number[]>((resolve, reject) => {
        let attempts = 0

        const wait = () => {
          const pixel = map.getPixelFromCoordinate(coordinate)
          const overlayFeature = pixel
            ? map
                .getFeaturesAtPixel(pixel, { hitTolerance: 10 })
                .find(feature => typeof feature.get('overlayBodyTemplateId') === 'string')
            : undefined

          if (pixel && overlayFeature) {
            resolve(pixel)
            return
          }

          attempts += 1

          if (attempts >= 10) {
            reject(new Error(`Overlay feature was not hittable at coordinate ${JSON.stringify(coordinate)}`))
            return
          }

          map.once('postrender', wait)
          map.render()
        }

        wait()
      }),
      { log: false },
    )
  }
}
