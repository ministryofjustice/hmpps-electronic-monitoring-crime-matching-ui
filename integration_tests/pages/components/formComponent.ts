import { PageElement } from '../page'

export default abstract class FormComponent {
  constructor(private readonly id: string) {}

  // PROPERTIES

  protected get form(): PageElement {
    return cy.get(`form#${this.id}`, { log: false })
  }

  // HELPERS

  checkHasForm(): void {
    this.form.should('exist')
  }

  shouldNotExist(): void {
    this.form.should('not.exist')
  }
}
