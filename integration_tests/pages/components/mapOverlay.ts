import { PageElement } from '../page'

export default class MapOverlay {
  constructor(private readonly scope: PageElement) {}

  // PROPERTIES

  get element(): PageElement {
    return cy.get('em-map').shadow().find('.ol-overlay-container')
  }

  // HELPERS

  shouldBeVisible() {
    this.element.should('be.visible')
  }

  shouldHaveTitle(title: string) {
    this.element.find('.app-map__overlay-title').should('contain.text', title)
  }

  shouldHaveNthRow(index: number, label: string, value: string) {
    this.element.find('.app-map__overlay-row').eq(index).find('.app-map__overlay-label').should('contain.text', label)
    this.element.find('.app-map__overlay-row').eq(index).find('.app-map__overlay-value').should('contain.text', value)
  }
}
