import { v4 as uuidv4 } from 'uuid'
import { PageElement } from '../page'
import FormCheckboxComponent from './formCheckboxComponent'

export default class MapSidebarComponent {
  private elementCacheId: string = uuidv4()

  constructor(private readonly parent: PageElement) {
    this.parent.get('.app-map__sidebar', { log: false }).as(`${this.elementCacheId}-element`)
  }

  // PROPERTIES

  get element(): PageElement {
    return cy.get(`@${this.elementCacheId}-element`, { log: false })
  }

  get showLocationToggle(): FormCheckboxComponent {
    return new FormCheckboxComponent(this.element, 'Show locations')
  }

  get showConfidenceCirclesToggle(): FormCheckboxComponent {
    return new FormCheckboxComponent(this.element, 'Show confidence circles')
  }

  get showTracksToggle(): FormCheckboxComponent {
    return new FormCheckboxComponent(this.element, 'Show tracks')
  }

  // HELPERS

  shouldExist(): void {
    this.element.should('exist')
    this.showLocationToggle.shouldExist()
    this.showConfidenceCirclesToggle.shouldExist()
    this.showTracksToggle.shouldExist()
  }
}
