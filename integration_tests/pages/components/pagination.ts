import { PageElement } from '../page'

export default class PaginationComponent {
  constructor() {}

  // PROPERTIES

  get element(): PageElement {
    return cy.get('.govuk-pagination', { log: false })
  }

  get next(): PageElement {
    return this.element.get('.govuk-pagination__next a')
  }

  get prev(): PageElement {
    return this.element.get('.govuk-pagination__prev a')
  }

  get currentPage(): PageElement {
    return this.element.get('.govuk-pagination__item--current')
  }

  // HELPERS

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldNotExist(): void {
    this.element.should('not.exist')
  }

  shouldHaveCurrentPage(text: string): void {
    this.currentPage.should('contain.text', text)
  }

  shouldHaveNextButton(): void {
    this.next.should('exist')
  }

  shouldNotHaveNextButton(): void {
    this.next.should('not.exist')
  }

  shouldHavePrevButton(): void {
    this.prev.should('exist')
  }

  shouldNotHavePrevButton(): void {
    this.prev.should('not.exist')
  }
}
