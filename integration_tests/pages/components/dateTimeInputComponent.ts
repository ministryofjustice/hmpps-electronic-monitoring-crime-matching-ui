import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'

export default class DateTimeInputComponent {
  private elementCacheId: string = uuidv4()

  constructor(
    private readonly parent: PageElement,
    private readonly label: string,
  ) {
    this.parent.get(`[id="${this.label}"]`).as(`${this.elementCacheId}-element`)
    this.element.should('exist')
  }

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: true })
  }

  set(value?: string | number | boolean) {
    this.element.type(value as string)
  }

  get validationMessage() {
    return this.element.parents('.govuk-form-group').children('.govuk-error-message', { log: false })
  }

  shouldHaveValidationMessage(message: string) {
    this.validationMessage.should('contain', message)
  }
}
