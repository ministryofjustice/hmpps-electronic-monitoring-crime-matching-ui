import { PageElement } from '../page'

export default class FormHiddenInputComponent {
  constructor(
    private readonly parent: PageElement,
    private readonly selector: string,
  ) {}

  get element(): PageElement {
    return this.parent.find(this.selector)
  }

  set(value?: string | number | boolean) {
    this.element.invoke('val', value)
  }

  shouldHaveValue(value?: string | number | boolean) {
    this.element.should('have.value', value as string)
  }

  shouldBeDisabled() {
    this.element.should('be.disabled')
  }

  shouldNotBeDisabled() {
    this.element.should('not.be.disabled')
  }
}
