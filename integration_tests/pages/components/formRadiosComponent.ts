import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'

class FormRadiosComponent {
  private elementCacheId: string = uuidv4()

  constructor(
    private readonly parent: PageElement,
    private readonly label: string,
  ) {
    this.parent.getByLegend(this.label, { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get options(): Cypress.Chainable<Array<string>> {
    return this.element.find('input').then(input => {
      return Cypress._.map(input, 'value')
    })
  }

  get validationMessage() {
    return this.element.children('.govuk-error-message', { log: false })
  }

  // HELPERS

  set(value: string) {
    this.element.find(`input[value="${value}"]`).check({ force: true })
  }

  setInputField(field: string, value: string) {
    this.element.find(`input[name="${field}"]`).clear()
    this.element.find(`input[name="${field}"]`).type(value)
  }

  shouldHaveOptions(options: Array<string>): void {
    this.options.should('deep.equal', options)
  }

  shouldHaveValue(value: string): void {
    this.element.find(`input[value="${value}"]`).should('be.checked')
  }

  shouldHaveInputValue(field: string, value: string): void {
    this.element.find(`input[name="${field}"]`).should('have.value', value as string)
  }

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldNotExist(): void {
    this.element.should('not.exist')
  }

  shouldBeDisabled(): void {
    this.element.find('input[type=radio]').each(input => cy.wrap(input).should('be.disabled'))
  }

  shouldNotBeDisabled(): void {
    this.element.find('input[type=radio]').each(input => cy.wrap(input).should('not.be.disabled'))
  }

  shouldHaveValidationMessage(message: string): void {
    this.validationMessage.should('contain', message)
  }

  shouldNotHaveValidationMessage(): void {
    this.validationMessage.should('not.exist')
  }
}

export default FormRadiosComponent
