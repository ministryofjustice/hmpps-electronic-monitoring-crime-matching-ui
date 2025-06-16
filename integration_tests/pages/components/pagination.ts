import { PageElement } from '../page'

export default class PaginationComponent {
  constructor() {}

  // PROPERTIES

  get element(): PageElement {
    return cy.get('.govuk-pagination', { log: false })
  }

  // HELPERS

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldNotExist(): void {
    this.element.should('not.exist')
  }
}
