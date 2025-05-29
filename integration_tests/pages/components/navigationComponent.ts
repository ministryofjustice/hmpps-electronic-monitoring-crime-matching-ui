import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'
import NavigationLink from './navigationLink'

export default class NavigationComponent {
  private elementCacheId: string = uuidv4()

  constructor() {
    cy.get('.govuk-service-navigation__container', { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get crimeMappingLink(): NavigationLink {
    return new NavigationLink(this.element, 'Crime mapping')
  }

  get locationDataLink(): NavigationLink {
    return new NavigationLink(this.element, 'Location data')
  }

  get legalLink(): NavigationLink {
    return new NavigationLink(this.element, 'Legal')
  }

  get helpLink(): NavigationLink {
    return new NavigationLink(this.element, 'Help')
  }

  // HELPERS

  checkHasNavigation(): void {
    this.crimeMappingLink.shouldExist()
    this.locationDataLink.shouldExist()
    this.legalLink.shouldExist()
    this.helpLink.shouldExist()
  }
}
