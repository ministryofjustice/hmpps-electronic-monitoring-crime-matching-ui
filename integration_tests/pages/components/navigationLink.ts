import { PageElement } from '../page'

export default class NavigationLink {
  constructor(
    private readonly parent: PageElement,
    private readonly text: string,
  ) {}

  // PROPERTIES

  get element(): PageElement {
    return this.parent.contains('.govuk-service-navigation__item', this.text, { log: false })
  }

  // HELPERS

  shouldBeActive(): void {
    this.element.should('have.class', 'govuk-service-navigation__item--active')
  }

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldNotBeActive(): void {
    this.element.should('not.have.class', 'govuk-service-navigation__item--active')
  }
}
