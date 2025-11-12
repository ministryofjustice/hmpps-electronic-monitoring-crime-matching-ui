import { PageElement } from '../page'

export default class NavigationLink {
  constructor(
    private readonly parent: PageElement,
    private readonly text: string,
  ) {}

  // PROPERTIES

  get element(): PageElement {
    return this.parent.contains('.moj-primary-navigation__item', this.text, { log: false })
  }

  // HELPERS

  shouldBeActive(): void {
    this.element.find('.moj-primary-navigation__link').should('have.attr', 'aria-current', 'page')
  }

  shouldExist(): void {
    this.element.should('exist')
  }

  shouldNotBeActive(): void {
    this.element.find('.moj-primary-navigation__link').should('not.have.attr', 'aria-current', 'page')
  }
}
