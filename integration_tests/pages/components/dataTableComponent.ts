import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'

export default class DataTableComponent {
  private elementCacheId: string = uuidv4()

  constructor() {
    cy.get('.datatable', { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get table(): PageElement {
    return this.element.get('.govuk-table')
  }

  get noResultsMessage(): PageElement {
    return this.element.get('[data-qa="no-results-message"]')
  }

  // HELPERS

  shouldHaveResults(): void {
    this.table.should('exist')
    this.noResultsMessage.should('not.exist')
  }

  shouldNotHaveResults(): void {
    this.table.should('not.exist')
    this.noResultsMessage.should('have.text', 'There are no results.')
  }
}
