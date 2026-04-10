import { PageElement } from '../page'

export default class SummaryListComponent {
  constructor(private selector: string) {}

  get element(): PageElement {
    return cy.get(`.govuk-summary-list${this.selector}`)
  }

  shouldExist() {
    this.element.should('exist')
  }

  shouldNotExist() {
    this.element.should('not.exist')
  }

  shouldHaveItem(key: string, value: string) {
    return this.element
      .find('.govuk-summary-list__key')
      .filter((_, el) => el.textContent?.trim() === key)
      .siblings('.govuk-summary-list__value')
      .should('contain.text', value)
  }
}
