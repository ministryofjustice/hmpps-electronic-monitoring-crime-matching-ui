import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'

export default class PageHeaderComponent {
  private elementCacheId: string = uuidv4()

  constructor() {
    cy.get('[role=banner].hmpps-header', { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get authServices(): PageElement {
    return this.element.get('[data-qa=authServices]')
  }

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get manageDetails(): PageElement {
    return this.element.get('[data-qa=manageDetails]')
  }

  get phaseBanner(): PageElement {
    return this.element.get('[data-qa=header-phase-banner]')
  }

  get signOut(): PageElement {
    return this.element.get('[data-qa=signOut]')
  }

  get userName(): PageElement {
    return this.element.get('[data-qa=header-user-name]')
  }

  // HELPERS

  checkHasHeader(): void {
    this.element.contains('HMPPS Electronic Monitoring Crime Matching', { log: false })
    this.userName.should('contain.text', 'J. Smith')
    this.phaseBanner.should('contain.text', 'dev')
  }
}
