import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'

export default class TabComponent {
  private elementCacheId: string = uuidv4()

  constructor(id: string) {
    cy.get(id, { log: false }).as(`${this.elementCacheId}-element`)
  }

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  // PROPERTIES

  // HELPERS

  click() {
    this.element.click()
  }

  shouldBeActive() {
    this.element.should('have.attr', 'aria-selected', 'true')
  }

  shouldExist() {
    this.element.should('exist')
  }

  shouldNotBeActive() {
    this.element.should('have.attr', 'aria-selected', 'false')
  }
}
