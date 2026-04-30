import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'

export type UploadFileOptions = {
  fileName: string
  contents: string
}

export default class FormFileUploadComponent {
  private elementCacheId: string = uuidv4()

  constructor(
    private readonly parent: PageElement,
    private readonly label: string,
  ) {
    this.parent
      .contains('label', this.label)
      .invoke('attr', 'for')
      .then(id => cy.get(`#${id}-input`))
      .as(`${this.elementCacheId}-element`)
  }

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  uploadFile(options: UploadFileOptions): void {
    this.element.selectFile(
      {
        contents: Cypress.Buffer.from(options.contents),
        fileName: options.fileName,
        lastModified: Date.now(),
      },
      { force: true },
    )
  }

  get validationMessage(): PageElement {
    return this.element.parents('.govuk-form-group').find('.govuk-error-message', { log: false })
  }

  shouldHaveValidationMessage(message: string): void {
    this.validationMessage.should('contain', message)
  }
}
