import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'

export default class PageHeaderComponent {
  private elementCacheId: string = uuidv4()

  constructor() {
    // Match all known header types: PDS, fallback, and MOJ HMPPS
    cy.get(
      '[role=banner].probation-common-header, [role=banner].probation-common-fallback-header, [role=banner].hmpps-header',
      { log: false },
    ).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get userName(): PageElement {
    return this.element.find('[data-qa=header-user-name], [data-qa=probation-common-header-user-name]')
  }

  get manageDetails(): PageElement {
    return this.element.find('[data-qa=manageDetails], a.probation-common-header__submenu-link:contains("account")')
  }

  get signOut(): PageElement {
    return this.element.find('[data-qa=signOut], a[href*="sign-out"]')
  }

  get phaseBanner(): PageElement {
    return this.element.find('[data-qa=header-phase-banner], .govuk-tag')
  }

  get authServices(): PageElement {
    return this.element.find('[data-qa=authServices]')
  }

  // HELPERS

  checkHasHeader(): void {
    cy.get('body').then($body => {
      const hasPdsHeader = $body.find('[role=banner].probation-common-header').length > 0
      const hasFallbackHeader = $body.find('[role=banner].probation-common-fallback-header').length > 0
      const hasHmppsHeader = $body.find('[role=banner].hmpps-header').length > 0

      if (hasPdsHeader) {
        cy.log('Found Probation PDS header')
        cy.get('[role=banner].probation-common-header').should('contain.text', 'Account name').and('be.visible')
      } else if (hasFallbackHeader) {
        cy.log('Found fallback header')
        cy.get('[role=banner].probation-common-fallback-header').should('exist').and('be.visible')
      } else if (hasHmppsHeader) {
        cy.log('Found legacy HMPPS header')
        cy.get('[role=banner].hmpps-header').should('contain.text', 'HMPPS Electronic Monitoring Crime Matching')
      } else {
        throw new Error('No recognised header found on the page')
      }
    })
  }
}
