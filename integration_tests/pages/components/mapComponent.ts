import { v4 as uuidv4 } from 'uuid'
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

  get viewport(): PageElement {
    return this.element.get('.app-map__viewport')
  }

  // HELPERS

  shouldExist(): void {
    this.element.should('exist')
    this.viewport.should('exist')
    this.sidebar.shouldExist()
  }
}
