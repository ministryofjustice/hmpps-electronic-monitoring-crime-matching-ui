import { PageElement } from '../page'

export default class FormCheckboxesComponent {
  constructor(
    private readonly scope: PageElement,
    private readonly name: string,
  ) {}

  get element(): PageElement {
    return this.scope.get(`input[name=${this.name}]`, { log: false })
  }

  // Helpers

  select(value: string) {
    this.element.check(value)
  }

  unselect(value: string) {
    this.element.uncheck(value)
  }

  shouldBeChecked(value: string) {
    this.element.filter(`[value="${value}"]`).should('be.checked')
  }

  shouldNotBeChecked(value) {
    this.element.filter(`[value="${value}"]`).should('not.be.checked')
  }

  shouldExist() {
    this.element.should('exist')
  }

  shouldHaveText(text: string) {
    this.element.get(`label[for="${this.name}"]`)
      .should('be.visible')
      .and('contain.text', text)
  }
}
