import { v4 as uuidv4 } from 'uuid'

import { PageElement } from '../page'

export default abstract class FormComponent {
  protected elementCacheId: string = uuidv4()

  constructor(id: string) {
    cy.get(`form#${id}`, { log: false }).as(this.elementCacheId)
  }

  // PROPERTIES

  protected get form(): PageElement {
    return cy.get(`@${this.elementCacheId}`, { log: false })
  }

  // HELPERS

  checkHasForm(): void {
    this.form.should('exist')
  }
}
