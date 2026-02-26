import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'

export default class FormSelectComponent {
  private elementCacheId: string = uuidv4()

  constructor(
    private readonly parent: PageElement,
    private readonly label: string,
    private readonly options: string[],
  ) {
    this.parent.getByLabel(this.label, { log: false }).as(`${this.elementCacheId}-element`)
    this.element.should('exist')

    this.options.forEach(option => this.shouldHaveOption(option))
  }

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  set(value?: string | number | boolean) {
    this.element.select(value as string)
  }

  shouldHaveValue(value?: string | number | boolean) {
    this.element.should('have.value', value as string)
  }

  shouldHaveOption(value: string): void {
    this.element.contains('option', value).should('exist')
  }

  shouldBeDisabled() {
    this.element.should('be.disabled')
  }

  shouldNotBeDisabled(): void {
    this.element.should('not.be.disabled')
  }

  get validationMessage() {
    return this.element.siblings('.govuk-error-message', { log: false })
  }

  shouldHaveValidationMessage(message: string) {
    this.validationMessage.should('contain', message)
  }

  shouldNotHaveValidationMessage(): void {
    this.validationMessage.should('not.exist')
  }
}
