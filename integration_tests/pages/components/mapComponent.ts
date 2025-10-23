import { v4 as uuidv4 } from 'uuid'
import Map from 'ol/Map'
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
}
