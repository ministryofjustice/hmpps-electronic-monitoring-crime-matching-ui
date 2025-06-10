import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'

export default class FormInputComponent {
  private elementCacheId: string = uuidv4()

  constructor(
    private readonly parent: PageElement,
    private readonly label: string,
  ) {
    this.parent.getByLabel(this.label, { log: true }).as(`${this.elementCacheId}-element`)
    this.element.should('exist')
  }

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: true })
  }

  set(value?: string | number | boolean) {
    this.element.type(value as string)
  }

  shouldHaveValue(value?: string | number | boolean) {
    this.element.should('have.value', value as string)
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
