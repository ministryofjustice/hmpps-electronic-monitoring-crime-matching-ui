import { PageElement } from '../page'

export default class SummaryListComponent {
  constructor(private selector: string, private index = 0) {}

  get element(): PageElement {
    return cy.get(`.govuk-summary-list${this.selector}`).eq(this.index)
  }

  shouldExist() {
    this.element.should('exist')
  }

  shouldNotExist() {
    this.element.should('not.exist')
  }

  shouldHaveItem(key: string, value: string) {
    return this.element
      .contains('.govuk-summary-list__key', key)
      .siblings('.govuk-summary-list__value')
      .should('contain.text', value)
  }
}
